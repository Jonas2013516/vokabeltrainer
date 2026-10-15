const CACHE='vokabeltrainer-20261015202308';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method==='POST'&&new URL(r.url).pathname.endsWith('/share-target')){
    e.respondWith((async()=>{
      try{ const fd=await r.formData(); const f=fd.get('file');
        if(f){ const c=await caches.open('vt-share'); await c.put(new URL('shared-file',self.registration.scope).href,new Response(f)); } }catch(err){}
      return Response.redirect(new URL('./?shared=1',self.registration.scope).href,303);
    })());
    return;
  }
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  const font=u.host==='fonts.googleapis.com'||u.host==='fonts.gstatic.com';
  if(u.origin!==location.origin&&!font)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const key=r.mode==='navigate'?'./index.html':r;
    const hit=await c.match(key);
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(key,res.clone());return res;}).catch(()=>hit);
    return hit||net;
  }));
});

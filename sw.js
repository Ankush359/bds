const V='bds-v8',CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
e.respondWith(fetch(r).then(n=>{if(n.ok){const c=n.clone();caches.open(V).then(x=>x.put(r,c))}return n}).catch(()=>caches.match(r).then(h=>h||(r.mode==='navigate'?caches.match('index.html'):Response.error()))))});

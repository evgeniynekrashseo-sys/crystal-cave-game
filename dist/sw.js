const CACHE='chemlab-release-22-living-coastal-city';
const ASSETS=['./','index.html','style.css?v=22','app.js?v=22','liquid.js?v=22','expansion.js?v=22','progression.js?v=22','engine.js?v=22','city.js?v=22','city-hud.js?v=22','settlement-model.js?v=22','settlement.css?v=22','settlement-renderer.js?v=22','settlement-camera.js?v=22','settlement-ground.js?v=22','settlement-life.js?v=22','settlement-life-v21.png','icons/stone.svg','settlement-meadow-v18.png','mission.js?v=22','settlement-sprites-alpha.png','settlement-details-alpha.png','resource-wood-v16.png','resource-food-v16.png','resource-coin-v16.png','elements-data.js?v=22','element-learning.js?v=22','city-research.js?v=22','lab.webp','tube-glass.webp','manifest.webmanifest','icon.svg','icons/people.svg','icons/water.svg','icons/chemistry.svg','icons/build.svg','icons/discoveries.svg','icons/city.svg','icons/zoom-in.svg','icons/zoom-out.svg','icons/center.svg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith('chemlab-release-')&&key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request).then(response=>response||Response.error())));
});

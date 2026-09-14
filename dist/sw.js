const CACHE='chemlab-release-24-living-coastal-city';
const ASSETS=['./','index.html','style.css?v=24','app.js?v=24','liquid.js?v=24','expansion.js?v=24','progression.js?v=24','engine.js?v=24','city.js?v=24','city-building-panel.js?v=24','city-hud.js?v=24','settlement-model.js?v=24','settlement.css?v=24','settlement-renderer.js?v=24','settlement-camera.js?v=24','settlement-ground.js?v=24','settlement-life.js?v=24','settlement-life-v21.png','icons/stone.svg','settlement-meadow-v18.png','mission.js?v=24','settlement-sprites-alpha.png','settlement-details-alpha.png','resource-wood-v16.png','resource-food-v16.png','resource-coin-v16.png','elements-data.js?v=24','element-learning.js?v=24','city-research.js?v=24','lab.webp','tube-glass.webp','manifest.webmanifest','icon.svg','icons/people.svg','icons/water.svg','icons/chemistry.svg','icons/build.svg','icons/discoveries.svg','icons/city.svg','icons/zoom-in.svg','icons/zoom-out.svg','icons/center.svg'];
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

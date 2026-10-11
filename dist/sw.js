const CACHE='chemlab-release-26-natural-river';
const ASSETS=['settlement-river.js?v=26','river-materials-v26.png','city-story.js?v=26','preferences.js?v=26','settlement-chronicles-v25.png','privacy.html','icons/app-192.png','icons/app-512.png','./','index.html','style.css?v=26','app.js?v=26','liquid.js?v=26','expansion.js?v=26','progression.js?v=26','engine.js?v=26','city.js?v=26','city-building-panel.js?v=26','city-hud.js?v=26','settlement-model.js?v=26','settlement.css?v=26','settlement-renderer.js?v=26','settlement-camera.js?v=26','settlement-ground.js?v=26','settlement-life.js?v=26','settlement-life-v21.png','icons/stone.svg','settlement-meadow-v18.png','mission.js?v=26','settlement-sprites-alpha.png','settlement-details-alpha.png','resource-wood-v16.png','resource-food-v16.png','resource-coin-v16.png','elements-data.js?v=26','element-learning.js?v=26','city-research.js?v=26','lab.webp','tube-glass.webp','manifest.webmanifest','icon.svg','icons/people.svg','icons/water.svg','icons/chemistry.svg','icons/build.svg','icons/discoveries.svg','icons/city.svg','icons/zoom-in.svg','icons/zoom-out.svg','icons/center.svg'];
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

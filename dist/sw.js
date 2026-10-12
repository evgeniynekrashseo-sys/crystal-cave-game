const CACHE='chemlab-release-27-coastal-city';
const ASSETS=['coastal-settlement-v27.png','coastal-infrastructure-v27.png','settlement-river.js?v=27','river-materials-v26.png','city-story.js?v=27','preferences.js?v=27','settlement-chronicles-v25.png','privacy.html','icons/app-192.png','icons/app-512.png','./','index.html','style.css?v=27','app.js?v=27','liquid.js?v=27','expansion.js?v=27','progression.js?v=27','engine.js?v=27','city.js?v=27','city-building-panel.js?v=27','city-hud.js?v=27','settlement-model.js?v=27','settlement.css?v=27','settlement-renderer.js?v=27','settlement-camera.js?v=27','settlement-ground.js?v=27','settlement-life.js?v=27','settlement-life-v21.png','icons/stone.svg','settlement-meadow-v18.png','mission.js?v=27','settlement-sprites-alpha.png','settlement-details-alpha.png','resource-wood-v16.png','resource-food-v16.png','resource-coin-v16.png','elements-data.js?v=27','element-learning.js?v=27','city-research.js?v=27','lab.webp','tube-glass.webp','manifest.webmanifest','icon.svg','icons/people.svg','icons/water.svg','icons/chemistry.svg','icons/build.svg','icons/discoveries.svg','icons/city.svg','icons/zoom-in.svg','icons/zoom-out.svg','icons/center.svg'];
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

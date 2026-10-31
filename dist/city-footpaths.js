// Decorative footpaths connect settlement doors to the existing road network.
// Visual-only: no changes to road connectivity, building occupancy, or saves.
export function nearestRoadFor(object, roads, maxDistance = 5) {
  if (!object || !Array.isArray(roads)) return null;
  let best = null;
  let bestDistance = maxDistance + 1;
  for (const road of roads) {
    if (!Number.isFinite(road.x) || !Number.isFinite(road.y)) continue;
    const distance = Math.abs(object.x - road.x) + Math.abs(object.y - road.y);
    if (distance < bestDistance && distance <= maxDistance) {
      best = road;
      bestDistance = distance;
    }
  }
  return best;
}

export function drawSettlementFootpaths(ctx, point, objects, roads, zoom) {
  if (!ctx || typeof point !== 'function' || !Array.isArray(objects) || !Array.isArray(roads)) return 0;
  let drawn = 0;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const object of objects) {
    if (object.type !== 'house' && object.type !== 'site') continue;
    const road = nearestRoadFor(object, roads);
    if (!road || (road.x === object.x && road.y === object.y)) continue;
    const a = point(object.x + .5, object.y + .68);
    const b = point(road.x + .5, road.y + .5);
    const dx = b.x - a.x, dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    if (length < 8) continue;
    const bend = ((object.x * 17 + object.y * 11) % 5 - 2) * Math.min(3, length * .045);
    const cx = (a.x + b.x) / 2 - dy / length * bend;
    const cy = (a.y + b.y) / 2 + dx / length * bend;
    const width = Math.max(2.5, 7 * zoom);
    for (const [multiplier, color] of [
      [2.7, 'rgba(105,87,58,.10)'],
      [1.8, 'rgba(129,104,68,.21)'],
      [1, 'rgba(174,145,98,.29)'],
    ]) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width * multiplier;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(cx, cy, b.x, b.y);
      ctx.stroke();
    }
    // Light wheel/foot wear is kept below the buildings and above the ground.
    ctx.strokeStyle = 'rgba(83,70,48,.17)';
    ctx.lineWidth = Math.max(.6, zoom * .8);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(cx, cy, b.x, b.y);
    ctx.stroke();
    drawn++;
  }
  ctx.restore();
  return drawn;
}

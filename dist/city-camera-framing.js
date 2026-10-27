// Camera framing for the visual-parity sandbox only; does not alter game saves.
// Lift the scene in short landscape viewports so the southern construction site
// stays above the bottom toolbar rather than being hidden underneath it.
export function initialCameraFrame(width, height) {
  const zoom = height < 500 ? 0.52 : width < 480 ? 0.60 : 0.75;
  const unit = Math.min(55, Math.max(35, width * 0.09)) * zoom;
  const landscapeLift = height < 500 ? Math.min(95, height * 0.22) : 0;
  return {
    zoom,
    panX: 0,
    panY: height * 0.48 - (height * 0.24 + 10 * unit * 0.53) - landscapeLift,
  };
}

// Isometric ground anchor used for the mobile viewport visibility checks.
export function sceneGroundY(width, height, x, y, camera = initialCameraFrame(width, height)) {
  const unit = Math.min(55, Math.max(35, width * 0.09)) * camera.zoom;
  return height * 0.24 + (x + y) * unit * 0.53 + camera.panY;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCameraFrame, sceneGroundY} from '../dist/city-camera-framing.js';

test('landscape construction site ground anchor clears the bottom toolbar', () => {
  const width = 844, height = 390;
  const camera = initialCameraFrame(width, height);
  const siteGround = sceneGroundY(width, height, 13.5, 10.65, camera);
  assert.equal(camera.zoom, 0.52);
  assert.ok(siteGround > 80, 'site remains on screen');
  assert.ok(siteGround < height - 55, 'site base clears toolbar and margin');
});

test('portrait retains established camera framing', () => {
  const width = 390, height = 844;
  const camera = initialCameraFrame(width, height);
  const unit = Math.min(55, Math.max(35, width * 0.09)) * camera.zoom;
  assert.equal(camera.zoom, 0.60);
  assert.equal(camera.panY, height * 0.48 - (height * 0.24 + 10 * unit * 0.53));
  assert.ok(sceneGroundY(width, height, 13.5, 10.65, camera) < height - 110);
});

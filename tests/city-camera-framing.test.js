import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCameraFrame, sceneGroundY} from '../dist/city-camera-framing.js';

test('landscape construction site ground anchor clears the bottom toolbar', () => {
  const width = 844, height = 390;
  const camera = initialCameraFrame(width, height);
  const siteGround = sceneGroundY(width, height, 13.97, 10.97, camera);
  assert.equal(camera.zoom, 0.52);
  assert.ok(siteGround > 80, 'site remains on screen');
  assert.ok(siteGround < height - 55, 'site base clears toolbar and margin');
});

test('portrait settlement center moves into the middle without clipping the southern site', () => {
  const width = 390, height = 844;
  const camera = initialCameraFrame(width, height);
  assert.equal(camera.zoom, 0.60);
  assert.ok(sceneGroundY(width, height, 8, 8, camera) > height * 0.37);
  assert.ok(sceneGroundY(width, height, 8, 8, camera) < height * 0.49);
  assert.ok(sceneGroundY(width, height, 13.97, 10.97, camera) < height - 110);
  assert.ok(sceneGroundY(width, height, 5, 5, camera) > 100, 'northern house stays clear of header');
});

test('short portrait and desktop framing remain within viewport bounds', () => {
  const narrow = initialCameraFrame(360, 640);
  assert.equal(narrow.zoom, 0.60);
  assert.ok(sceneGroundY(360, 640, 8, 8, narrow) > 640 * 0.35);
  assert.ok(sceneGroundY(360, 640, 13.97, 10.97, narrow) < 640 - 95);
  const desktop = initialCameraFrame(1280, 800);
  assert.equal(desktop.zoom, 0.75);
  assert.equal(desktop.panY, 800 * 0.48 - (800 * 0.24 + 10 * 55 * 0.75 * 0.53));
});

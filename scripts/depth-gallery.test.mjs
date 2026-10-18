import { test } from 'node:test';
import assert from 'node:assert/strict';
import { depthAtmospheres, clamp, galleryStep, mixColor, portraitPose } from '../src/lib/depthGallery.js';

test('all eleven existing girls have distinct atmosphere metadata', () => {
  assert.deepEqual(Object.keys(depthAtmospheres), ['emma', 'anna', 'elise', 'mei', 'yuki', 'grace', 'sofia', 'diya', 'lily', 'mia', 'soo']);
  assert.equal(new Set(Object.values(depthAtmospheres).map(([color]) => color)).size, 11);
});
test('scroll bounds and responsive steps are finite', () => {
  assert.equal(clamp(-1, 0, 10), 0);
  assert.equal(clamp(11, 0, 10), 10);
  assert.equal(galleryStep(1000), 850);
  assert.equal(galleryStep(0), 1);
});
test('atmospheres interpolate continuously', () => {
  assert.equal(mixColor('#000000', '#ffffff', 0), 'rgb(0, 0, 0)');
  assert.equal(mixColor('#000000', '#ffffff', .5), 'rgb(128, 128, 128)');
  assert.equal(mixColor('#000000', '#ffffff', 1), 'rgb(255, 255, 255)');
});
test('portraits occupy true perspective depth and reduced motion removes it', () => {
  assert.match(portraitPose(0, 0, 0, false).transform, /translate3d\(0px, 0px, 0px\)/);
  assert.match(portraitPose(1, 0, 0, false).transform, /-760px/);
  assert.equal(portraitPose(10, 0, 0, false).opacity, 0);
  assert.equal(portraitPose(1, 1.1, 3, true).transform, 'translate(-50%, -50%)');
  assert.equal(portraitPose(0, 1.1, 3, true).opacity, 0);
});

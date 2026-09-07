import { Assets } from 'pixi.js';
import { APPROVED_TUBE } from './v91-approved-assets';

// Preload the exact approved visual before starting the non-continuous renderer.
await Assets.load(APPROVED_TUBE);
await import('./main');

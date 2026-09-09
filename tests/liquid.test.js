import {test} from 'node:test';
import assert from 'node:assert/strict';
import {surface,stepSurface,impulse} from '../dist/liquid.js';
test('surface impulses propagate and damp to rest without numerical instability',()=>{const s=surface();impulse(s,.2,50);for(let i=0;i<15;i++)stepSurface(s,1/60);assert(s.y.some(y=>Math.abs(y)>.1));assert(s.y.filter(y=>Math.abs(y)>.01).length>1);for(let i=0;i<1200;i++)stepSurface(s,1/60);assert(s.y.every(y=>Number.isFinite(y)&&Math.abs(y)<.001));});
test('repeated splashes remain bounded at capped frame deltas',()=>{const s=surface();for(let i=0;i<3000;i++){if(i%13===0)impulse(s,(i%11)/10,50);stepSurface(s,.02);}assert(s.y.every(y=>Number.isFinite(y)&&Math.abs(y)<=8));assert(s.v.every(v=>Number.isFinite(v)&&Math.abs(v)<=70));});

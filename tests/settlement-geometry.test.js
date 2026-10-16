import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GROUND_SLOPE,ART_CONTRACT,boxFaces,raisedPoint} from '../dist/settlement-geometry.js';
import {projectPoint,unitFor} from '../dist/settlement-camera.js';
test('equipment foundations and camera use exactly the same projection',()=>{
 const view={width:390,height:720},camera={zoom:1.3,pan:{x:17,y:-5}},u=unitFor(view.width)*camera.zoom,p=(x,y)=>projectPoint(view,camera,x,y);
 const faces=boxFaces(p,u,2,3,0,.4,.3,.2),a=faces.top[0],b=faces.top[1];
 assert(Math.abs((b.y-a.y)/(b.x-a.x)-GROUND_SLOPE)<1e-10);
 const q=raisedPoint(p,u,2,3,.2);assert.equal(q.x,p(2,3).x);assert.equal(q.y,p(2,3).y-.2*u);
 assert.equal(ART_CONTRACT.groundSlope,.56);
});

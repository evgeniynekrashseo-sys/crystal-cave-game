import * as T from '../vendor/three/three.module.js';
import {groundHeight,roadDistance,point,random} from './world-space.js';

function roadTexture(paved){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d'),rng=random(519);ctx.fillStyle=paved?'#5a584f':'#8d8067';ctx.fillRect(0,0,512,512);
 if(paved)for(let row=0;row<16;row++)for(let col=-1;col<9;col++){const v=104+Math.floor(rng()*33);ctx.fillStyle=`rgb(${v+8},${v+5},${v-5})`;ctx.beginPath();ctx.roundRect(col*64+(row%2)*32+2,row*32+2,60,28,5+rng()*4);ctx.fill();}
 for(let i=0;i<28000;i++){const light=rng()>.5;ctx.fillStyle=light?'#f4e2bc12':'#231c1518';ctx.fillRect(rng()*512,rng()*512,.5+rng()*2,.5+rng()*2);}
 if(!paved)for(let i=0;i<2600;i++){const x=rng()*512,y=rng()*512,r=.5+rng()*2.2;ctx.fillStyle=rng()>.5?'#b5a28588':'#65594466';ctx.beginPath();ctx.ellipse(x,y,r,r*.65,rng()*6,0,Math.PI*2);ctx.fill();}
 const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=8;return texture;}
export function makeTerrain(roads,buildings,invalidate){
 const meadow=new T.TextureLoader().load(new URL('./meadow-albedo.webp',import.meta.url).href,invalidate);meadow.colorSpace=T.SRGBColorSpace;meadow.wrapS=meadow.wrapT=T.RepeatWrapping;meadow.anisotropy=8;
 const dirt=roadTexture(false),paving=roadTexture(true),material=new T.MeshStandardMaterial({map:meadow,roughness:1});
 material.onBeforeCompile=shader=>{
  shader.uniforms.meadow={value:meadow};shader.uniforms.roadDirt={value:dirt};shader.uniforms.roadStone={value:paving};
  shader.vertexShader='attribute vec4 surface; varying vec4 vSurface; varying vec2 vGround;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSurface=surface; vGround=position.xz;');
  shader.fragmentShader=`uniform sampler2D meadow;uniform sampler2D roadDirt;uniform sampler2D roadStone;varying vec4 vSurface;varying vec2 vGround;
   float terrainHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float terrainNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(terrainHash(i),terrainHash(i+vec2(1.,0.)),f.x),mix(terrainHash(i+vec2(0.,1.)),terrainHash(i+vec2(1.,1.)),f.x),f.y);}
  `+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
   vec3 turf=texture2D(meadow,vGround*.21).rgb;
   vec3 dirt=texture2D(roadDirt,vGround*.32).rgb;
   vec3 paving=texture2D(roadStone,vGround*.34).rgb;
   float edge=sin(vGround.x*4.1+sin(vGround.y*2.3))*.16+sin(vGround.y*6.3)*.075;
   float road=1.-smoothstep(vSurface.w-.3,vSurface.w+.45,vSurface.x+edge);
   float apron=(1.-smoothstep(2.7,4.4,vSurface.z))*.72;
   vec3 land=mix(turf,dirt,apron);
   float wear=.82+.18*terrainNoise(vGround*.8)+.07*terrainNoise(vGround*4.);
   vec3 roadColor=mix(dirt*wear,paving,step(1.5,vSurface.y));
   diffuseColor.rgb*=mix(land,roadColor,road);
  `);
 };
 material.customProgramCacheKey=()=> 'chemlab-terrain-surface-2';
 const geo=new T.PlaneGeometry(220,220,220,220);geo.rotateX(-Math.PI/2);geo.translate(90,0,90);const positions=geo.attributes.position,surface=[];
 const pads=buildings.map(point);
 for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i),road=roadDistance(x,z,roads);positions.setY(i,groundHeight(x,z));let pad=100;for(const p of pads)pad=Math.min(pad,Math.max(Math.abs(x-p.x),Math.abs(z-p.z)));surface.push(Math.min(road.distance,100),road.level,pad,road.width);}
 geo.setAttribute('surface',new T.Float32BufferAttribute(surface,4));geo.computeVertexNormals();const mesh=new T.Mesh(geo,material);mesh.receiveShadow=true;mesh.userData.extraTextures=[dirt,paving];return mesh;
}

import * as T from '../vendor/three/three.module.js';

// Bake static construction detail by material: hundreds of boards remain a few draws.
export function batchStatic(group){
 group.updateMatrixWorld(true);const buckets=new Map(),result=new T.Group();result.userData=group.userData;
 group.traverse(mesh=>{if(!mesh.isMesh)return;const geometry=(mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone()).applyMatrix4(mesh.matrixWorld);let bucket=buckets.get(mesh.material);if(!bucket){bucket={p:[],n:[],uv:[]};buckets.set(mesh.material,bucket);}for(const v of geometry.attributes.position.array)bucket.p.push(v);for(const v of geometry.attributes.normal.array)bucket.n.push(v);
  const scale=mesh.material.userData.surfaceScale,position=geometry.attributes.position,normal=geometry.attributes.normal;
  for(let i=0;i<position.count;i++){
   if(scale){const x=position.getX(i),y=position.getY(i),z=position.getZ(i),nx=Math.abs(normal.getX(i)),ny=Math.abs(normal.getY(i)),nz=Math.abs(normal.getZ(i));if(ny>Math.max(nx,nz))bucket.uv.push(x*scale,z*scale);else if(nx>nz)bucket.uv.push(z*scale,y*scale);else bucket.uv.push(x*scale,y*scale);}
   else bucket.uv.push(geometry.attributes.uv?.getX(i)||0,geometry.attributes.uv?.getY(i)||0);
  }geometry.dispose();});
 for(const [material,b]of buckets){const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(b.p,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));const mesh=new T.Mesh(geometry,material);mesh.castShadow=mesh.receiveShadow=true;result.add(mesh);}return result;
}

export function triangleGeometry(vertices){const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(vertices.flatMap((_,i)=>i%3===0?[vertices[i],vertices[i+1]]:[]),2));geometry.computeVertexNormals();return geometry;}

// A compact, period-appropriate construction scene for the visual sandbox.
// Geometry is projected from the same tile corners as roads and buildings.
export function drawConstructionSite(ctx, project, x, y, zoom=1) {
 const origin=project(x,y), east=project(x+1,y);
 const unit=Math.hypot(east.x-origin.x,east.y-origin.y);
 if(!Number.isFinite(unit)||unit<=0)return;
 const p=(a,b,h=0)=>{const v=project(x+a,y+b);return {x:v.x,y:v.y-h*unit};};
 const polygon=(coords,fill)=>{ctx.beginPath();coords.forEach((v,i)=>{const q=p(...v);ctx[i?'lineTo':'moveTo'](q.x,q.y);});ctx.closePath();ctx.fillStyle=fill;ctx.fill();};
 const beam=(a,b,width=.045)=>{const q=p(...a),r=p(...b);ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(r.x,r.y);ctx.lineCap='round';ctx.strokeStyle='#493523';ctx.lineWidth=Math.max(1,unit*width*1.5);ctx.stroke();ctx.strokeStyle='#a07b50';ctx.lineWidth=Math.max(.7,unit*width*.72);ctx.stroke();};
 const block=(a,b,w,d,h,top='#aaa18c')=>{
  polygon([[a,b+d,0],[a+w,b+d,0],[a+w,b+d,h],[a,b+d,h]],'#786d5a');
  polygon([[a+w,b,0],[a+w,b+d,0],[a+w,b+d,h],[a+w,b,h]],'#5d584c');
  polygon([[a,b,h],[a+w,b,h],[a+w,b+d,h],[a,b+d,h]],top);
 };
 ctx.save();
 // The site is a grounded footprint, not the former floating gray diamond.
 polygon([[.03,.03,0],[.97,.03,0],[.97,.97,0],[.03,.97,0]],'rgba(96,76,51,.48)');
 polygon([[.13,.13,.025],[.87,.13,.025],[.87,.87,.025],[.13,.87,.025]],'#82745d');
 for(const [a,b,w,d] of [[.12,.12,.76,.11],[.12,.77,.76,.11],[.12,.23,.11,.54],[.77,.23,.11,.54]])block(a,b,w,d,.17,'#aaa18b');
 // Rear posts and diagonal bracing establish the same isometric volume as houses.
 for(const [a,b] of [[.19,.19],[.81,.19],[.19,.81],[.81,.81]])beam([a,b,.17],[a,b,1.22],.065);
 for(const b of [.19,.81])beam([.19,b,1.2],[.81,b,1.2],.055);
 for(const a of [.19,.81])beam([a,.19,1.2],[a,.81,1.2],.055);
 beam([.19,.19,.26],[.19,.19,1.16],.01);
 beam([.19,.19,.26],[.19,.81,1.12],.036);
 beam([.81,.19,.26],[.81,.81,1.12],.036);
 // Gable roof skeleton: exposed rafters rather than a modern flat platform.
 for(const a of [.19,.5,.81]){
  beam([a,.19,1.2],[a,.5,1.63],.05);
  beam([a,.5,1.63],[a,.81,1.2],.05);
 }
 beam([.19,.5,1.63],[.81,.5,1.63],.055);
 // Wooden scaffold and work platform on the visible frontage.
 for(const a of [.09,.91])beam([a,.95,0],[a,.95,1.0],.043);
 beam([.09,.95,.8],[.91,.95,.8],.045);
 polygon([[.06,.87,.73],[.94,.87,.73],[.94,.99,.73],[.06,.99,.73]],'#98754d');
 for(const a of [.22,.47,.72])beam([a,.87,.74],[a,.99,.74],.025);
 // Stone and timber supplies remain within the footprint.
 block(.07,.89,.2,.14,.12,'#b4aa91');
 block(.29,.89,.18,.13,.09,'#9d927e');
 for(let i=0;i<3;i++)beam([.61+i*.07,.88,.09+i*.025],[.89+i*.02,.88,.09+i*.025],.045);
 ctx.restore();
}

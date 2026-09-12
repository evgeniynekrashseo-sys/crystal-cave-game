// Independent source-art sprites, sorted by map depth. No flattened town backdrop.
const art=new Image();art.src=new URL('./settlement-art.png',import.meta.url).href;
const atlas=new Image();atlas.src=new URL('./settlement-sprites.png',import.meta.url).href;
const names=['house','lab','farm','well','tree','rock','lumber','ranch','clinic','granary','mine','factory','energy','person','worker','truck'];
const sprites={};let grass,prepared=false;
function prepare(){
 if(!grass&&art.complete&&art.naturalWidth){const tile=document.createElement('canvas');tile.width=384;tile.height=256;const g=tile.getContext('2d');for(let x=0;x<2;x++)for(let y=0;y<2;y++){g.save();g.translate(x?384:0,y?256:0);g.scale(x?-1:1,y?-1:1);g.drawImage(art,240,245,192,128,0,0,192,128);g.restore();}grass=tile;}
 if(prepared||!atlas.complete||!atlas.naturalWidth)return;
 for(let i=0;i<16;i++){
 const x=Math.round(i%4*atlas.width/4),y=Math.round(Math.floor(i/4)*atlas.height/4),w=Math.round((i%4+1)*atlas.width/4)-x,h=Math.round((Math.floor(i/4)+1)*atlas.height/4)-y;
 const cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(atlas,x,y,w,h,0,0,w,h);const pixels=g.getImageData(0,0,w,h);let left=w,top=h,right=0,bottom=0;
 for(let j=0;j<pixels.data.length;j+=4){const d=pixels.data,spill=Math.min(d[j],d[j+2])-d[j+1];if(spill>65&&d[j]>140&&d[j+2]>130)d[j+3]=Math.round(255*(1-Math.min(1,(spill-65)/45)));if(d[j+3]>40){const px=j/4%w,py=Math.floor(j/4/w);left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);}}
 g.putImageData(pixels,0,0);const sprite=document.createElement('canvas');sprite.width=right-left+1;sprite.height=bottom-top+1;sprite.getContext('2d').drawImage(cv,left,top,sprite.width,sprite.height,0,0,sprite.width,sprite.height);sprites[names[i]]=sprite;
 }prepared=true;
}
export function drawSettlement(ctx,canvas,c,{zoom,pan,selected,tool,time,reduced}){
 prepare();const W=canvas.clientWidth,H=canvas.clientHeight,u=58*zoom;
 const project=(x,y)=>({x:W/2+(x-y)*u+pan.x,y:H*.5+(x+y-10)*u*.56+pan.y});
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#aecb75';ctx.fillRect(0,0,W,H);
 if(grass){ctx.save();ctx.translate(pan.x%384,pan.y%256);ctx.fillStyle=ctx.createPattern(grass,'repeat');ctx.globalAlpha=.42;ctx.fillRect(-384,-256,W+768,H+512);ctx.restore();}
 const diamond=(x,y,color,stroke)=>{const pts=[project(x,y),project(x+1,y),project(x+1,y+1),project(x,y+1)];ctx.beginPath();pts.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();}};
 // Roads are map geometry and also determine delivery speeds in the simulation.
 for(const r of c.roads)diamond(r.x,r.y,c.tech.includes('motor')?'#aaa99bd0':'#d8c399c9');
 if(tool)for(let x=0;x<c.extent;x++)for(let y=0;y<c.extent;y++)diamond(x,y,'#ffffff05','#ffffff35');
 const objects=[],hits=[];
 for(let x=0;x<c.extent;x++)for(let y=0;y<c.extent;y++){
 if(c.buildings.some(b=>b.x===x&&b.y===y)||x===4&&y===2)continue;
 if((x*11+y*3)%19===0)objects.push({x,y,kind:'rock',width:70});
 else if((x<2||y<2||x>7||y>8)&&(x*13+y*7)%9<2)objects.push({x,y,kind:'tree',width:106,sway:true});
 }
 if(!c.buildings.some(b=>b.x===4&&b.y===2))objects.push({x:4,y:2,kind:'lab',width:150,lab:true});
 const kind={house:'house',lumber:'lumber',farm:'farm',well:'well',quarry:'rock',ranch:'ranch',clinic:'clinic',granary:'granary',mine:'mine',smelter:'factory',factory:'factory',energy:'energy'};
 for(const b of c.buildings)objects.push({x:b.x,y:b.y,kind:kind[b.type],width:b.type==='farm'?116:b.type==='well'?74:112,b});
 for(const a of c.agents)objects.push({x:a.x,y:a.y,kind:a.truck?'truck':'person',width:a.truck?48:18,a});
 const drawSprite=(obj)=>{const moving=obj.a?.path.length;const frame=moving&&!reduced?Math.floor(time*5+obj.a.id)%2:0;const img=sprites[obj.kind==='person'&&frame?'worker':obj.kind];if(!img)return;const p=project(obj.x+.5,obj.y+.6);let width=obj.width*zoom,height=width*img.height/img.width;let bob=0,angle=0;if(!reduced){if(obj.sway)angle=Math.sin(time*.9+obj.x)*.013;if(obj.a?.path.length)bob=Math.abs(Math.sin(time*10+obj.a.id))*.45*zoom;else if(obj.a?.state==='work')angle=Math.sin(time*3)*.025;}
 ctx.save();ctx.fillStyle='#24432226';ctx.filter='blur(3px)';ctx.beginPath();ctx.ellipse(p.x+5*zoom,p.y-2*zoom,width*.34,width*.10,0,0,Math.PI*2);ctx.fill();ctx.restore();if(obj.b||obj.lab)hits.push({left:p.x-width/2,top:p.y-height,width,height,x:obj.x,y:obj.y,lab:obj.lab});ctx.save();ctx.translate(p.x,p.y-bob);ctx.rotate(angle);if(obj.b?.ready>c.seconds){const progress=1-(obj.b.ready-c.seconds)/8;ctx.globalAlpha=.45+.55*Math.max(0,progress);}if(obj.a){const dest=obj.a.path[0];const direction=dest?(dest.x-obj.a.x)-(dest.y-obj.a.y):1;if((direction<0)!==!!frame)ctx.scale(-1,1);}ctx.drawImage(img,-width/2,-height,width,height);ctx.restore();
 if(obj.b&&(obj.b.level>1||obj.b.ready>c.seconds)){ctx.font=`600 ${10*zoom}px system-ui`;ctx.textAlign='center';ctx.fillStyle='#163d4b';ctx.fillText(obj.b.ready>c.seconds?`${Math.ceil(obj.b.ready-c.seconds)} с`:`Рівень ${obj.b.level}`,p.x,p.y+12*zoom);}
 if(obj.b&&['factory','smelter'].includes(obj.b.type)&&!reduced&&c.agents.some(a=>a.job===obj.b.id&&a.state==='work')){for(let i=0;i<4;i++){const f=(time*.2+i*.25)%1;ctx.fillStyle=`rgba(243,240,222,${(1-f)*.35})`;ctx.beginPath();ctx.arc(p.x+width*.20+f*12*zoom,p.y-height*.90-f*28*zoom,(3+f*7)*zoom,0,Math.PI*2);ctx.fill();}}
 if(obj.kind==='lab'&&!reduced){ctx.fillStyle='#d2ffffb0';for(let i=0;i<4;i++){const v=(time*.28+i*.23)%1;ctx.beginPath();ctx.arc(p.x+width*.08+Math.sin(time+i)*2,p.y-height*.25-v*height*.42,1.3*zoom,0,Math.PI*2);ctx.fill();}}
 };
 if(selected)diamond(selected.x,selected.y,'#54ecdc20','#b7ffff');
 objects.sort((a,b)=>a.x+a.y-b.x-b.y).forEach(drawSprite);
 // Animated water surface at the actual river cells. It remains impassable.
 for(let y=0;y<c.extent;y++)if(c.extent>14){const p=project(14,y);ctx.save();ctx.globalAlpha=.85;ctx.drawImage(art,772,647,70,250,p.x-u,p.y-u*.5,u*1.8,u*1.7);ctx.restore();if(!reduced){ctx.fillStyle='#efffff80';ctx.fillRect(p.x-10,p.y+Math.sin(time+y)*3,13*zoom,1);}}
 return hits;
}
export function mapTile(canvas,zoom,pan,x,y){const u=58*zoom,a=(x-canvas.clientWidth/2-pan.x)/u,b=(y-canvas.clientHeight*.5-pan.y)/(u*.56)+10;return {x:Math.floor((a+b)/2),y:Math.floor((b-a)/2)};}

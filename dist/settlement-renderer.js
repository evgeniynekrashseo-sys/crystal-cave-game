// Independent source-art sprites, sorted by map depth. No flattened town backdrop.
const art=new Image();art.src=new URL('./settlement-art.png',import.meta.url).href;
const regions={
 lab:{box:[165,385,344,316],path:[[171,608],[211,549],[224,492],[266,470],[268,432],[287,430],[299,467],[341,478],[356,400],[377,388],[419,409],[438,467],[486,442],[494,555],[474,588],[508,623],[478,661],[332,701],[216,657]]},
 house:{box:[18,728,333,257],path:[[19,907],[57,841],[87,803],[135,762],[142,731],[165,735],[169,771],[218,782],[263,829],[282,852],[309,866],[334,877],[350,942],[217,984],[92,958]]},
 lumber:{box:[483,666,255,250],path:[[485,824],[518,762],[548,724],[557,680],[578,673],[589,704],[637,671],[694,711],[719,749],[732,815],[735,873],[611,915],[525,875]]},
 farm:{box:[113,1087,285,216],path:[[116,1195],[159,1153],[156,1117],[186,1124],[208,1090],[241,1107],[307,1136],[367,1168],[380,1231],[398,1252],[274,1302],[168,1267]]},
 well:{box:[553,1016,152,205],path:[[552,1190],[581,1128],[586,1077],[600,1052],[625,1041],[645,1017],[681,1045],[691,1085],[679,1106],[694,1138],[704,1200],[649,1221],[582,1210]]},
 tree:{box:[0,212,174,271],path:[[3,267],[32,246],[47,217],[91,220],[118,250],[162,271],[174,313],[150,359],[127,381],[117,447],[100,483],[48,466],[64,404],[20,371],[0,342]]},
 rock:{box:[607,380,153,151],path:[[607,489],[637,440],[661,392],[683,380],[711,400],[727,447],[753,474],[760,510],[688,531],[631,520]]},
 person:{box:[351,891,47,87],path:[[354,970],[357,950],[364,935],[364,913],[370,900],[379,891],[388,899],[388,912],[394,933],[388,948],[397,970],[389,977],[377,951],[367,976]]},
 worker:{box:[227,951,60,88],path:[[231,1027],[241,1005],[241,983],[251,970],[251,959],[262,951],[270,961],[268,974],[278,990],[285,1004],[277,1011],[268,995],[265,1028],[251,1038],[240,1036]]},
 cart:{box:[388,930,65,80],path:[[389,959],[403,931],[426,934],[450,946],[453,987],[441,1008],[422,1005],[405,989],[390,979]]}
};
const sprites={};let grass;
function prepare(){if(grass||!art.complete||!art.naturalWidth)return;for(const [name,r] of Object.entries(regions)){const [x,y,w,h]=r.box,cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');g.beginPath();r.path.forEach(([px,py],i)=>g[i?'lineTo':'moveTo'](px-x,py-y));g.closePath();g.clip();g.drawImage(art,-x,-y);sprites[name]=cv;}
 const tile=document.createElement('canvas');tile.width=384;tile.height=256;const g=tile.getContext('2d');for(let x=0;x<2;x++)for(let y=0;y<2;y++){g.save();g.translate(x?384:0,y?256:0);g.scale(x?-1:1,y?-1:1);g.drawImage(art,240,245,192,128,0,0,192,128);g.restore();}grass=tile;
}
export function drawSettlement(ctx,canvas,c,{zoom,pan,selected,tool,time,reduced}){
 prepare();const W=canvas.clientWidth,H=canvas.clientHeight,u=58*zoom;
 const project=(x,y)=>({x:W/2+(x-y)*u+pan.x,y:H*.5+(x+y-10)*u*.56+pan.y});
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#aecb75';ctx.fillRect(0,0,W,H);
 if(grass){ctx.save();ctx.translate(pan.x%384,pan.y%256);ctx.fillStyle=ctx.createPattern(grass,'repeat');ctx.fillRect(-384,-256,W+768,H+512);ctx.restore();}
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
 const kind={house:'house',lumber:'lumber',farm:'farm',well:'well',quarry:'rock',ranch:'lumber',clinic:'house',granary:'lumber',mine:'rock',smelter:'lab',factory:'lab',energy:'lab'};
 for(const b of c.buildings)objects.push({x:b.x,y:b.y,kind:kind[b.type],width:b.type==='farm'?116:b.type==='well'?74:112,b});
 for(const a of c.agents)objects.push({x:a.x,y:a.y,kind:a.id%2?'worker':'person',width:17,a});
 const drawSprite=(obj)=>{const img=sprites[obj.kind];if(!img)return;const p=project(obj.x+.5,obj.y+.6);let width=obj.width*zoom,height=width*img.height/img.width;let bob=0,angle=0;if(!reduced){if(obj.sway)angle=Math.sin(time*.9+obj.x)*.013;if(obj.a?.path.length)bob=Math.abs(Math.sin(time*9+obj.a.id))*1.5*zoom;else if(obj.a?.state==='work')angle=Math.sin(time*6)*.08;}
 if(obj.b||obj.lab)hits.push({left:p.x-width/2,top:p.y-height,width,height,x:obj.x,y:obj.y,lab:obj.lab});ctx.save();ctx.translate(p.x,p.y-bob);ctx.rotate(angle);if(obj.b?.ready>c.seconds){const progress=1-(obj.b.ready-c.seconds)/8;ctx.globalAlpha=.45+.55*Math.max(0,progress);}if(obj.a?.path[0]?.x<obj.a?.x)ctx.scale(-1,1);ctx.drawImage(img,-width/2,-height,width,height);ctx.restore();
 if(obj.a?.truck||obj.a&&Object.keys(obj.a.cargo).length){const cart=sprites.cart;if(cart)ctx.drawImage(cart,p.x+4*zoom,p.y-22*zoom,20*zoom,25*zoom);}
 if(obj.b&&(obj.b.level>1||obj.b.ready>c.seconds)){ctx.font=`600 ${10*zoom}px system-ui`;ctx.textAlign='center';ctx.fillStyle='#163d4b';ctx.fillText(obj.b.ready>c.seconds?`${Math.ceil(obj.b.ready-c.seconds)} с`:`Рівень ${obj.b.level}`,p.x,p.y+12*zoom);}
 if(obj.kind==='lab'&&!reduced){ctx.fillStyle='#d2ffffb0';for(let i=0;i<4;i++){const v=(time*.28+i*.23)%1;ctx.beginPath();ctx.arc(p.x+width*.08+Math.sin(time+i)*2,p.y-height*.25-v*height*.42,1.3*zoom,0,Math.PI*2);ctx.fill();}}
 };
 if(selected)diamond(selected.x,selected.y,'#54ecdc20','#b7ffff');
 objects.sort((a,b)=>a.x+a.y-b.x-b.y).forEach(drawSprite);
 // Animated water surface at the actual river cells. It remains impassable.
 for(let y=0;y<c.extent;y++)if(c.extent>14){const p=project(14,y);ctx.save();ctx.globalAlpha=.85;ctx.drawImage(art,772,647,70,250,p.x-u,p.y-u*.5,u*1.8,u*1.7);ctx.restore();if(!reduced){ctx.fillStyle='#efffff80';ctx.fillRect(p.x-10,p.y+Math.sin(time+y)*3,13*zoom,1);}}
 return hits;
}
export function mapTile(canvas,zoom,pan,x,y){const u=58*zoom,a=(x-canvas.clientWidth/2-pan.x)/u,b=(y-canvas.clientHeight*.5-pan.y)/(u*.56)+10;return {x:Math.floor((a+b)/2),y:Math.floor((b-a)/2)};}

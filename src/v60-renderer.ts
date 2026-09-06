import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export type PremiumSymbol = string;
export type PremiumTube = PremiumSymbol[];
export type PremiumGeometry={w:number;h:number};

export function drawPremiumTube(parent:Container,tube:PremiumTube,colorOf:(s:PremiumSymbol)=>number,g:PremiumGeometry,selected:boolean){
  const wrap=new Container();
  const w=g.w,h=g.h;
  const left=9,right=w-9,top=10,bottom=h-18,neckY=24,roundStart=h-56;

  const floor=new Graphics();
  floor.ellipse(w/2,h+11,w*.28,4.8).fill({color:0x00050a,alpha:.72});
  floor.ellipse(w/2,h+10,w*.19,3.2).fill({color:selected?0x42dfff:0x12384d,alpha:selected?.24:.13});
  wrap.addChild(floor);

  const outerGlow=new Graphics();
  outerGlow.moveTo(left-1,neckY).lineTo(left-1,roundStart).bezierCurveTo(left-1,h-27,w*.28,bottom,w/2,bottom+2).bezierCurveTo(w*.72,bottom,right+1,h-27,right+1,roundStart).lineTo(right+1,neckY)
    .stroke({color:selected?0x4ee7ff:0x36b8ed,width:selected?3.2:1.6,alpha:selected?.18:.08});
  wrap.addChild(outerGlow);

  const glass=new Graphics();
  glass.moveTo(left,neckY).lineTo(left,roundStart).bezierCurveTo(left,h-29,w*.29,bottom,w/2,bottom+1).bezierCurveTo(w*.71,bottom,right,h-29,right,roundStart).lineTo(right,neckY)
    .fill({color:0x02131e,alpha:.24}).stroke({color:selected?0xe6fbff:0xbcecff,width:selected?1.55:1.0,alpha:selected?.96:.62});
  glass.moveTo(left+4,31).bezierCurveTo(left+1,h*.38,left+4,h*.73,left+9,h-43).stroke({color:0xffffff,width:1.3,alpha:.38});
  glass.moveTo(right-5,34).bezierCurveTo(right-1,h*.44,right-4,h*.72,right-10,h-46).stroke({color:0x6ee2ff,width:.8,alpha:.17});
  glass.moveTo(w*.30,bottom-4).bezierCurveTo(w*.40,bottom,w*.60,bottom,w*.70,bottom-4).stroke({color:0xffffff,width:1.0,alpha:.18});
  wrap.addChild(glass);

  if(tube.length){
    const innerX=13,innerW=w-26,slot=(h-50)/4,liquidBottom=h-22;
    for(let i=0;i<tube.length;i++){
      const sym=tube[i],color=colorOf(sym),y=liquidBottom-(i+1)*slot+2,bh=slot+2;
      const liquid=new Graphics();
      liquid.roundRect(innerX,y,innerW,bh,Math.min(8,bh*.13)).fill({color,alpha:.96});
      liquid.rect(innerX,y+bh*.56,innerW,bh*.44).fill({color:0x00111a,alpha:.10});
      liquid.ellipse(w/2,y+2,innerW*.48,4.1).fill({color,alpha:1});
      liquid.ellipse(w/2,y+1.8,innerW*.35,1.9).stroke({color:0xffffff,width:.75,alpha:.44});
      liquid.moveTo(innerX+3,y+8).bezierCurveTo(innerX+8,y+3,innerX+14,y+4,innerX+18,y+8).stroke({color:0xffffff,width:.8,alpha:.18});
      if(i===0)liquid.ellipse(w/2,liquidBottom,innerW*.48,3.8).fill({color,alpha:.93});
      wrap.addChild(liquid);

      const label=new Text({text:sym,style:new TextStyle({fontFamily:'Inter,system-ui,sans-serif',fontSize:Math.max(13,w*.17),fontWeight:'800',fill:0x061018,align:'center'})});
      label.anchor.set(.5);label.x=w/2;label.y=y+bh/2;wrap.addChild(label);
    }
  }

  const rimGlow=new Graphics();
  rimGlow.ellipse(w/2,top,w*.49,5.9).stroke({color:0x58dfff,width:3.2,alpha:.10});
  wrap.addChild(rimGlow);

  const rim=new Graphics();
  rim.ellipse(w/2,top,w*.48,5.4).fill({color:0x06131d,alpha:.98}).stroke({color:0xe7fbff,width:1.55,alpha:.95});
  rim.ellipse(w/2,top,w*.38,3.2).fill({color:0x020b12,alpha:.96}).stroke({color:0x75dfff,width:.85,alpha:.62});
  rim.moveTo(w*.29,7.9).bezierCurveTo(w*.41,4.5,w*.59,4.5,w*.71,7.9).stroke({color:0xffffff,width:.9,alpha:.78});
  wrap.addChild(rim);

  if(selected){
    const select=new Graphics();
    select.moveTo(left-3,neckY).lineTo(left-3,roundStart).bezierCurveTo(left-3,h-27,w*.28,bottom+3,w/2,bottom+5).bezierCurveTo(w*.72,bottom+3,right+3,h-27,right+3,roundStart).lineTo(right+3,neckY)
      .stroke({color:0x55e9ff,width:2.0,alpha:.38});
    wrap.addChildAt(select,0);
  }

  parent.addChild(wrap);
  return wrap;
}

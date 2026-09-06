import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export type PremiumSymbol = string;
export type PremiumTube = PremiumSymbol[];
export type PremiumGeometry={w:number;h:number};

export function drawPremiumTube(parent:Container,tube:PremiumTube,colorOf:(s:PremiumSymbol)=>number,g:PremiumGeometry,selected:boolean){
  const wrap=new Container();
  const w=g.w,h=g.h;

  const floor=new Graphics();
  floor.ellipse(w/2,h+13,w*.36,7).fill({color:0x07111b,alpha:.74});
  floor.ellipse(w/2,h+11,w*.25,4).fill({color:selected?0x39d7ff:0x14384c,alpha:selected?.30:.16});
  wrap.addChild(floor);

  const outerGlow=new Graphics();
  outerGlow.roundRect(3,5,w-6,h-8,w*.36).stroke({color:selected?0x54e5ff:0x5abde9,width:selected?4:2,alpha:selected?.20:.10});
  wrap.addChild(outerGlow);

  const glass=new Graphics();
  glass.roundRect(5,7,w-10,h-10,w*.34).fill({color:0x03131f,alpha:.28}).stroke({color:selected?0xd9fbff:0xbcecff,width:selected?1.7:1.15,alpha:selected?.96:.70});
  glass.roundRect(9,15,w-18,h-28,w*.28).fill({color:0x001019,alpha:.26});
  glass.moveTo(10,30).bezierCurveTo(7,h*.38,9,h*.72,16,h-38).stroke({color:0xffffff,width:1.5,alpha:.43});
  glass.moveTo(w-12,34).bezierCurveTo(w-8,h*.42,w-10,h*.72,w-16,h-42).stroke({color:0x64dfff,width:1,alpha:.20});
  wrap.addChild(glass);

  if(tube.length){
    const innerX=11,innerW=w-22,slot=(h-43)/4,bottom=h-17;
    for(let i=0;i<tube.length;i++){
      const sym=tube[i],color=colorOf(sym),y=bottom-(i+1)*slot+2,bh=slot+4;
      const liquid=new Graphics();
      liquid.roundRect(innerX,y,innerW,bh,Math.min(11,bh*.20)).fill({color,alpha:.96});
      liquid.rect(innerX,y+bh*.50,innerW,bh*.50).fill({color:0x00111a,alpha:.13});
      liquid.ellipse(w/2,y+2,innerW/2,5.8).fill({color,alpha:1});
      liquid.ellipse(w/2,y+1.6,innerW*.39,2.8).stroke({color:0xffffff,width:1,alpha:.55});
      liquid.moveTo(innerX+2,y+8).bezierCurveTo(innerX+7,y+1,innerX+13,y+3,innerX+16,y+7).stroke({color:0xffffff,width:1.1,alpha:.24});
      if(i===0)liquid.ellipse(w/2,bottom,innerW/2,5.2).fill({color,alpha:.94});
      wrap.addChild(liquid);

      const label=new Text({text:sym,style:new TextStyle({fontFamily:'Inter,system-ui,sans-serif',fontSize:Math.max(15,w*.22),fontWeight:'800',fill:0x061018,align:'center'})});
      label.anchor.set(.5);label.x=w/2;label.y=y+bh/2+1;wrap.addChild(label);
    }
  }

  const rimGlow=new Graphics();
  rimGlow.ellipse(w/2,8,w*.63,8.8).stroke({color:0x62ddff,width:4,alpha:.12});
  wrap.addChild(rimGlow);

  const rim=new Graphics();
  rim.ellipse(w/2,8,w*.62,8).fill({color:0x06131d,alpha:.98}).stroke({color:0xe7fbff,width:2,alpha:.96});
  rim.ellipse(w/2,8,w*.50,4.6).fill({color:0x020b12,alpha:.95}).stroke({color:0x75dfff,width:1.1,alpha:.70});
  rim.moveTo(w*.24,5.4).bezierCurveTo(w*.40,1.5,w*.60,1.5,w*.76,5.4).stroke({color:0xffffff,width:1.2,alpha:.85});
  wrap.addChild(rim);

  if(selected){
    const select=new Graphics();
    select.roundRect(0,2,w,h,w*.38).stroke({color:0x55e9ff,width:2.2,alpha:.46});
    select.ellipse(w/2,h+11,w*.32,5).fill({color:0x31dfff,alpha:.16});
    wrap.addChildAt(select,0);
  }

  parent.addChild(wrap);
  return wrap;
}

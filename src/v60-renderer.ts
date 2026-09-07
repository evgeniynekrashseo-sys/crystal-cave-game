import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export type PremiumSymbol = string;
export type PremiumTube = PremiumSymbol[];
export type PremiumGeometry={w:number;h:number};

export function drawPremiumTube(parent:Container,tube:PremiumTube,colorOf:(s:PremiumSymbol)=>number,g:PremiumGeometry,selected:boolean){
  const wrap=new Container();
  const w=g.w,h=g.h;
  const left=w*.16,right=w*.84,top=8,bottom=h-11,neckY=17,roundStart=h-45;
  const innerX=w*.205,innerW=w*.59;
  const bottomColor=tube.length?colorOf(tube[0]):0x58dfff;
  const topColor=tube.length?colorOf(tube[tube.length-1]):0x58dfff;

  const floor=new Graphics();
  floor.ellipse(w/2,h+7,w*.31,4.6).fill({color:0x00040a,alpha:.58});
  floor.ellipse(w/2,h+5,w*.22,2.8).fill({color:tube.length?bottomColor:0x4865ff,alpha:tube.length?.20:.08});
  wrap.addChild(floor);

  if(selected){
    const halo=new Graphics();
    halo.ellipse(w/2,h*.52,w*.52,h*.43).fill({color:0x52e7ff,alpha:.035});
    halo.moveTo(left-3,neckY).lineTo(left-3,roundStart).bezierCurveTo(left-3,h-25,w*.29,bottom+3,w/2,bottom+4).bezierCurveTo(w*.71,bottom+3,right+3,h-25,right+3,roundStart).lineTo(right+3,neckY)
      .stroke({color:0x77edff,width:2.0,alpha:.34});
    wrap.addChild(halo);
  }

  const glassBack=new Graphics();
  glassBack.moveTo(left,neckY).lineTo(left,roundStart).bezierCurveTo(left,h-24,w*.31,bottom,w/2,bottom+1).bezierCurveTo(w*.69,bottom,right,h-24,right,roundStart).lineTo(right,neckY)
    .fill({color:0x061520,alpha:.31})
    .stroke({color:selected?0xf3fdff:0xc8f2ff,width:selected?1.45:1.0,alpha:selected?.97:.68});
  glassBack.moveTo(left+4,25).bezierCurveTo(left+1,h*.37,left+4,h*.72,left+9,h-36).stroke({color:0xffffff,width:1.35,alpha:.44});
  glassBack.moveTo(right-4,28).bezierCurveTo(right-1,h*.42,right-4,h*.72,right-9,h-38).stroke({color:0x8eeaff,width:.75,alpha:.17});
  glassBack.moveTo(w*.30,bottom-3).bezierCurveTo(w*.40,bottom+1,w*.60,bottom+1,w*.70,bottom-3).stroke({color:0xffffff,width:.9,alpha:.20});
  wrap.addChild(glassBack);

  if(tube.length){
    const liquidBottom=h-17;
    const usableH=h-43;
    const slot=usableH/4;

    for(let i=0;i<tube.length;i++){
      const sym=tube[i],color=colorOf(sym);
      const y=liquidBottom-(i+1)*slot;
      const bh=slot+1.1;
      const liquid=new Graphics();

      liquid.rect(innerX,y+2,innerW,bh-2).fill({color,alpha:.96});
      liquid.rect(innerX,y+bh*.57,innerW,bh*.43).fill({color:0x00111b,alpha:.09});
      liquid.rect(innerX+innerW*.055,y+5,Math.max(1.2,innerW*.045),Math.max(4,bh-9)).fill({color:0xffffff,alpha:.15});
      liquid.rect(innerX+innerW*.86,y+5,Math.max(1,innerW*.035),Math.max(4,bh-9)).fill({color:0x001018,alpha:.10});

      liquid.moveTo(innerX,y+3.2)
        .bezierCurveTo(innerX+innerW*.16,y+.4,innerX+innerW*.29,y+6.0,innerX+innerW*.44,y+3.0)
        .bezierCurveTo(innerX+innerW*.59,y+.3,innerX+innerW*.73,y+5.5,innerX+innerW,y+2.2)
        .lineTo(innerX+innerW,y+7.6)
        .bezierCurveTo(innerX+innerW*.72,y+10.4,innerX+innerW*.28,y+9.4,innerX,y+10.8)
        .closePath().fill({color,alpha:.995});
      liquid.moveTo(innerX+1,y+3.2)
        .bezierCurveTo(innerX+innerW*.18,y+.9,innerX+innerW*.31,y+5.6,innerX+innerW*.45,y+2.8)
        .bezierCurveTo(innerX+innerW*.61,y+.6,innerX+innerW*.77,y+5.1,innerX+innerW-1,y+2.1)
        .stroke({color:0xffffff,width:.75,alpha:.36});

      if(i===0)liquid.ellipse(w/2,liquidBottom,innerW*.49,3.2).fill({color,alpha:.93});

      if(i===tube.length-1){
        liquid.ellipse(innerX+innerW*.31,y+bh*.27,Math.max(1.1,innerW*.022),Math.max(1.1,innerW*.022)).fill({color:0xffffff,alpha:.28});
        liquid.ellipse(innerX+innerW*.68,y+bh*.19,Math.max(1.0,innerW*.018),Math.max(1.0,innerW*.018)).fill({color:0xffffff,alpha:.22});
        liquid.ellipse(innerX+innerW*.77,y+bh*.38,Math.max(.9,innerW*.015),Math.max(.9,innerW*.015)).fill({color:0xffffff,alpha:.18});
      }
      wrap.addChild(liquid);

      const label=new Text({text:sym,style:new TextStyle({
        fontFamily:'Inter,system-ui,sans-serif',
        fontSize:Math.max(11,w*.155),
        fontWeight:'900',
        fill:0x061018,
        stroke:{color:0xffffff,width:.55},
        align:'center'
      })});
      label.alpha=.98;
      label.anchor.set(.5);
      label.x=w/2;
      label.y=y+bh/2+1;
      wrap.addChild(label);
    }
  }

  const glassFront=new Graphics();
  glassFront.moveTo(left+1,neckY+1).lineTo(left+1,roundStart).bezierCurveTo(left+1,h-25,w*.32,bottom+1,w/2,bottom+2).bezierCurveTo(w*.68,bottom+1,right-1,h-25,right-1,roundStart).lineTo(right-1,neckY+1)
    .stroke({color:0xffffff,width:.55,alpha:.24});
  glassFront.moveTo(left+7,27).bezierCurveTo(left+4,h*.40,left+7,h*.68,left+11,h-39).stroke({color:0xffffff,width:1.55,alpha:.25});
  glassFront.moveTo(left+10,31).bezierCurveTo(left+8,h*.42,left+10,h*.57,left+12,h*.66).stroke({color:0xb8f5ff,width:.6,alpha:.18});
  wrap.addChild(glassFront);

  const rimGlow=new Graphics();
  rimGlow.ellipse(w/2,top,w*.45,5.8).stroke({color:tube.length?topColor:0x91efff,width:3.2,alpha:tube.length?.16:.12});
  wrap.addChild(rimGlow);

  const rim=new Graphics();
  rim.ellipse(w/2,top,w*.45,5.6).fill({color:0x10202b,alpha:.93}).stroke({color:0xf4fdff,width:1.7,alpha:.98});
  rim.ellipse(w/2,top,w*.35,3.3).fill({color:0x02080d,alpha:.99}).stroke({color:0xa9efff,width:.75,alpha:.70});
  rim.moveTo(w*.30,7.6).bezierCurveTo(w*.40,4.6,w*.60,4.6,w*.70,7.6).stroke({color:0xffffff,width:1.0,alpha:.82});
  rim.moveTo(w*.35,10.2).bezierCurveTo(w*.43,12.0,w*.57,12.0,w*.65,10.2).stroke({color:0x7cdfff,width:.6,alpha:.30});
  wrap.addChild(rim);

  parent.addChild(wrap);
  return wrap;
}

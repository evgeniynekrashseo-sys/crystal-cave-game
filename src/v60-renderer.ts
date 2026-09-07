import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export type PremiumSymbol=string;
export type PremiumTube=PremiumSymbol[];
export type PremiumGeometry={w:number;h:number};

export function drawPremiumTube(parent:Container,tube:PremiumTube,colorOf:(s:PremiumSymbol)=>number,g:PremiumGeometry,selected:boolean){
  const wrap=new Container();
  const w=g.w,h=g.h,cx=w/2;
  const rimY=11;
  const outerL=w*.085,outerR=w*.915;
  const neckY=19;
  const bottomY=h-10;
  const roundY=h-w*.48;
  const innerL=w*.145,innerR=w*.855,innerW=innerR-innerL;
  const liquidBottom=bottomY-7;
  const liquidTop=neckY+10;
  const usableH=liquidBottom-liquidTop;
  const slot=usableH/4;
  const topColor=tube.length?colorOf(tube[tube.length-1]):0x77e7ff;
  const bottomColor=tube.length?colorOf(tube[0]):0x77e7ff;

  const floor=new Graphics();
  floor.ellipse(cx,h+8,w*.44,6.4).fill({color:0x00040a,alpha:.55});
  floor.ellipse(cx,h+5,w*.31,3.8).fill({color:tube.length?bottomColor:0x5d7dff,alpha:tube.length?.30:.10});
  if(tube.length) floor.ellipse(cx,h+2,w*.18,2.4).fill({color:bottomColor,alpha:.28});
  wrap.addChild(floor);

  if(selected){
    const halo=new Graphics();
    halo.ellipse(cx,h*.52,w*.72,h*.48).fill({color:0x4ce6ff,alpha:.045});
    halo.moveTo(outerL-3,neckY).lineTo(outerL-3,roundY)
      .bezierCurveTo(outerL-3,h-24,w*.27,bottomY+6,cx,bottomY+7)
      .bezierCurveTo(w*.73,bottomY+6,outerR+3,h-24,outerR+3,roundY).lineTo(outerR+3,neckY)
      .stroke({color:0x73edff,width:2.5,alpha:.46});
    wrap.addChild(halo);
  }

  const glassMass=new Graphics();
  glassMass.moveTo(outerL,neckY).lineTo(outerL,roundY)
    .bezierCurveTo(outerL,h-24,w*.255,bottomY,cx,bottomY+3)
    .bezierCurveTo(w*.745,bottomY,outerR,h-24,outerR,roundY).lineTo(outerR,neckY)
    .fill({color:0x0a1c2a,alpha:.34})
    .stroke({color:selected?0xf8feff:0xe5faff,width:selected?2.0:1.55,alpha:selected?.99:.92});
  glassMass.moveTo(outerL+4,24).bezierCurveTo(outerL+1,h*.34,outerL+4,h*.70,outerL+11,h-35)
    .stroke({color:0xffffff,width:2.25,alpha:.66});
  glassMass.moveTo(outerL+9,29).bezierCurveTo(outerL+6,h*.43,outerL+10,h*.64,outerL+14,h*.74)
    .stroke({color:0xa7f0ff,width:.9,alpha:.34});
  glassMass.moveTo(outerR-5,26).bezierCurveTo(outerR-1,h*.40,outerR-4,h*.68,outerR-11,h-38)
    .stroke({color:0xc8f7ff,width:1.15,alpha:.30});
  glassMass.moveTo(w*.25,bottomY-5).bezierCurveTo(w*.38,bottomY+4,w*.62,bottomY+4,w*.75,bottomY-5)
    .stroke({color:0xffffff,width:1.25,alpha:.42});
  wrap.addChild(glassMass);

  if(tube.length){
    for(let i=0;i<tube.length;i++){
      const sym=tube[i],color=colorOf(sym),y=liquidBottom-(i+1)*slot,bh=slot+1.5;
      const isBottom=i===0,isTop=i===tube.length-1;
      const liquid=new Graphics();

      if(isBottom){
        liquid.moveTo(innerL,y).lineTo(innerR,y).lineTo(innerR,liquidBottom-w*.17)
          .bezierCurveTo(innerR,liquidBottom-w*.045,w*.69,liquidBottom+2,cx,liquidBottom+3)
          .bezierCurveTo(w*.31,liquidBottom+2,innerL,liquidBottom-w*.045,innerL,liquidBottom-w*.17)
          .closePath().fill({color,alpha:.975});
      }else{
        liquid.rect(innerL,y,innerW,bh+1).fill({color,alpha:.975});
      }

      liquid.rect(innerL,y+bh*.58,innerW,bh*.42).fill({color:0x001018,alpha:.095});
      liquid.rect(innerL+innerW*.05,y+3,innerW*.08,Math.max(6,bh-6)).fill({color:0xffffff,alpha:.18});
      liquid.rect(innerL+innerW*.18,y+2,innerW*.025,Math.max(5,bh-5)).fill({color:0xffffff,alpha:.055});
      liquid.rect(innerR-innerW*.06,y+4,innerW*.035,Math.max(5,bh-8)).fill({color:0x001018,alpha:.13});

      if(isTop){
        liquid.moveTo(innerL,y+4)
          .bezierCurveTo(innerL+innerW*.12,y+.4,innerL+innerW*.27,y+6.6,innerL+innerW*.43,y+3)
          .bezierCurveTo(innerL+innerW*.59,y-.2,innerL+innerW*.75,y+6.4,innerR,y+2.6)
          .lineTo(innerR,y+10)
          .bezierCurveTo(innerL+innerW*.74,y+12.4,innerL+innerW*.29,y+11.2,innerL,y+12.4)
          .closePath().fill({color,alpha:1});
        liquid.moveTo(innerL+1,y+4)
          .bezierCurveTo(innerL+innerW*.14,y+1.1,innerL+innerW*.29,y+6,innerL+innerW*.44,y+3)
          .bezierCurveTo(innerL+innerW*.60,y+.7,innerL+innerW*.76,y+5.7,innerR-1,y+2.6)
          .stroke({color:0xffffff,width:1.05,alpha:.62});
        liquid.ellipse(innerL+innerW*.27,y+bh*.30,Math.max(1.2,w*.014),Math.max(1.2,w*.014)).fill({color:0xffffff,alpha:.38});
        liquid.ellipse(innerL+innerW*.72,y+bh*.22,Math.max(1.0,w*.012),Math.max(1.0,w*.012)).fill({color:0xffffff,alpha:.30});
        liquid.ellipse(innerL+innerW*.61,y+bh*.39,Math.max(.9,w*.010),Math.max(.9,w*.010)).fill({color:0xffffff,alpha:.22});
      }else{
        liquid.moveTo(innerL,y+1).bezierCurveTo(innerL+innerW*.25,y-1,innerL+innerW*.75,y+2,innerR,y)
          .stroke({color:0xffffff,width:.58,alpha:.24});
      }

      if(isBottom){
        liquid.ellipse(cx,liquidBottom-1,innerW*.48,4.1).fill({color,alpha:.92});
        liquid.ellipse(cx,liquidBottom+1,innerW*.36,2.4).fill({color:0xffffff,alpha:.09});
      }
      wrap.addChild(liquid);

      const label=new Text({text:sym,style:new TextStyle({
        fontFamily:'Inter,system-ui,sans-serif',fontSize:Math.max(12,w*.195),fontWeight:'900',
        fill:0x071018,align:'center'
      })});
      label.anchor.set(.5);label.x=cx;label.y=y+bh/2+1;label.alpha=.99;
      wrap.addChild(label);
    }
  }

  const glassFront=new Graphics();
  glassFront.moveTo(outerL+2,neckY+1).lineTo(outerL+2,roundY)
    .bezierCurveTo(outerL+2,h-24,w*.28,bottomY+2,cx,bottomY+4)
    .bezierCurveTo(w*.72,bottomY+2,outerR-2,h-24,outerR-2,roundY).lineTo(outerR-2,neckY+1)
    .stroke({color:0xffffff,width:.72,alpha:.30});
  glassFront.moveTo(outerL+7,27).bezierCurveTo(outerL+3,h*.36,outerL+7,h*.69,outerL+14,h-41)
    .stroke({color:0xffffff,width:1.8,alpha:.34});
  glassFront.moveTo(outerL+12,34).bezierCurveTo(outerL+10,h*.42,outerL+12,h*.56,outerL+15,h*.66)
    .stroke({color:0xbaf6ff,width:.62,alpha:.20});
  glassFront.moveTo(outerR-10,33).bezierCurveTo(outerR-7,h*.43,outerR-9,h*.59,outerR-13,h*.70)
    .stroke({color:0x8deaff,width:.62,alpha:.16});
  wrap.addChild(glassFront);

  const rimGlow=new Graphics();
  rimGlow.ellipse(cx,rimY,w*.56,9.6).stroke({color:tube.length?topColor:0x7fe8ff,width:4.4,alpha:tube.length?.18:.14});
  wrap.addChild(rimGlow);

  const rim=new Graphics();
  rim.ellipse(cx,rimY,w*.555,9.0).fill({color:0xd5f6ff,alpha:.20}).stroke({color:0xffffff,width:2.35,alpha:1});
  rim.ellipse(cx,rimY,w*.455,5.55).fill({color:0x03101a,alpha:.985}).stroke({color:0xb7f3ff,width:1.25,alpha:.88});
  rim.moveTo(w*.235,rimY-1.8).bezierCurveTo(w*.36,rimY-6.8,w*.64,rimY-6.8,w*.765,rimY-1.8)
    .stroke({color:0xffffff,width:1.45,alpha:.96});
  rim.moveTo(w*.295,rimY+2.5).bezierCurveTo(w*.39,rimY+5.6,w*.61,rimY+5.6,w*.705,rimY+2.5)
    .stroke({color:0x6de4ff,width:.9,alpha:.58});
  wrap.addChild(rim);

  parent.addChild(wrap);
  return wrap;
}

import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export type PremiumSymbol=string;
export type PremiumTube=PremiumSymbol[];
export type PremiumGeometry={w:number;h:number};

export function drawPremiumTube(parent:Container,tube:PremiumTube,colorOf:(s:PremiumSymbol)=>number,g:PremiumGeometry,selected:boolean){
  const wrap=new Container();
  const w=g.w,h=g.h,cx=w/2;
  const rimY=12;
  const outerL=w*.105,outerR=w*.895;
  const neckY=20;
  const roundY=h-w*.44;
  const bottomY=h-12;
  const innerL=w*.17,innerR=w*.83,innerW=innerR-innerL;
  const liquidBottom=bottomY-6;
  const liquidTop=neckY+12;
  const usableH=liquidBottom-liquidTop;
  const slot=usableH/4;
  const topColor=tube.length?colorOf(tube[tube.length-1]):0x6fdfff;
  const bottomColor=tube.length?colorOf(tube[0]):0x6fdfff;

  // soft laboratory reflection below vessel
  const floor=new Graphics();
  floor.ellipse(cx,h+7,w*.39,5.8).fill({color:0x00050a,alpha:.52});
  floor.ellipse(cx,h+5,w*.29,3.7).fill({color:tube.length?bottomColor:0x6c5cff,alpha:tube.length?.24:.11});
  if(tube.length) floor.ellipse(cx,h+2,w*.18,2.3).fill({color:bottomColor,alpha:.22});
  wrap.addChild(floor);

  if(selected){
    const glow=new Graphics();
    glow.ellipse(cx,h*.52,w*.62,h*.42).fill({color:0x4fe5ff,alpha:.035});
    glow.moveTo(outerL-3,neckY).lineTo(outerL-3,roundY)
      .bezierCurveTo(outerL-3,h-24,w*.29,bottomY+5,cx,bottomY+6)
      .bezierCurveTo(w*.71,bottomY+5,outerR+3,h-24,outerR+3,roundY).lineTo(outerR+3,neckY)
      .stroke({color:0x67eaff,width:2.3,alpha:.42});
    wrap.addChild(glow);
  }

  // glass mass: broad transparent wall with strong edge refraction
  const body=new Graphics();
  body.moveTo(outerL,neckY).lineTo(outerL,roundY)
    .bezierCurveTo(outerL,h-25,w*.27,bottomY,cx,bottomY+2)
    .bezierCurveTo(w*.73,bottomY,outerR,h-25,outerR,roundY).lineTo(outerR,neckY)
    .fill({color:0x071725,alpha:.30})
    .stroke({color:selected?0xf5feff:0xd8f7ff,width:selected?1.85:1.35,alpha:selected?.98:.86});
  body.moveTo(outerL+4,25).bezierCurveTo(outerL+1,h*.34,outerL+4,h*.70,outerL+10,h-36)
    .stroke({color:0xffffff,width:2.0,alpha:.58});
  body.moveTo(outerL+8,30).bezierCurveTo(outerL+6,h*.43,outerL+9,h*.63,outerL+12,h*.74)
    .stroke({color:0x8eeaff,width:.85,alpha:.30});
  body.moveTo(outerR-5,28).bezierCurveTo(outerR-1,h*.43,outerR-4,h*.69,outerR-10,h-39)
    .stroke({color:0xbaf4ff,width:1.05,alpha:.27});
  body.moveTo(w*.27,bottomY-4).bezierCurveTo(w*.39,bottomY+3,w*.61,bottomY+3,w*.73,bottomY-4)
    .stroke({color:0xffffff,width:1.15,alpha:.38});
  wrap.addChild(body);

  if(tube.length){
    for(let i=0;i<tube.length;i++){
      const sym=tube[i], color=colorOf(sym);
      const y=liquidBottom-(i+1)*slot;
      const bh=slot+1.2;
      const isBottom=i===0;
      const isTop=i===tube.length-1;
      const liquid=new Graphics();

      // continuous liquid volume: no card-like rounded rectangles
      if(isBottom){
        liquid.moveTo(innerL,y).lineTo(innerR,y).lineTo(innerR,liquidBottom-w*.16)
          .bezierCurveTo(innerR,liquidBottom-w*.045,w*.69,liquidBottom+1,cx,liquidBottom+2)
          .bezierCurveTo(w*.31,liquidBottom+1,innerL,liquidBottom-w*.045,innerL,liquidBottom-w*.16)
          .closePath().fill({color,alpha:.97});
      }else{
        liquid.rect(innerL,y,innerW,bh+1).fill({color,alpha:.97});
      }

      // depth/refraction inside the liquid
      liquid.rect(innerL,y+bh*.54,innerW,bh*.46).fill({color:0x001018,alpha:.09});
      liquid.rect(innerL+innerW*.055,y+3,innerW*.075,Math.max(5,bh-6)).fill({color:0xffffff,alpha:.16});
      liquid.rect(innerL+innerW*.78,y+3,innerW*.10,Math.max(5,bh-6)).fill({color:0xffffff,alpha:.045});
      liquid.rect(innerR-innerW*.055,y+4,innerW*.035,Math.max(5,bh-8)).fill({color:0x001018,alpha:.12});

      // only the actual surface gets a wavy meniscus
      if(isTop){
        liquid.moveTo(innerL,y+3.8)
          .bezierCurveTo(innerL+innerW*.13,y+.8,innerL+innerW*.27,y+6.3,innerL+innerW*.43,y+3.1)
          .bezierCurveTo(innerL+innerW*.58,y+.2,innerL+innerW*.74,y+6.1,innerR,y+2.6)
          .lineTo(innerR,y+9.5)
          .bezierCurveTo(innerL+innerW*.75,y+11.7,innerL+innerW*.28,y+10.8,innerL,y+12)
          .closePath().fill({color,alpha:1});
        liquid.moveTo(innerL+1,y+3.8)
          .bezierCurveTo(innerL+innerW*.15,y+1.0,innerL+innerW*.29,y+5.9,innerL+innerW*.44,y+3)
          .bezierCurveTo(innerL+innerW*.60,y+.8,innerL+innerW*.76,y+5.5,innerR-1,y+2.5)
          .stroke({color:0xffffff,width:1.0,alpha:.58});

        // subtle bubbles only at free surface
        liquid.ellipse(innerL+innerW*.28,y+bh*.29,Math.max(1.2,w*.013),Math.max(1.2,w*.013)).fill({color:0xffffff,alpha:.32});
        liquid.ellipse(innerL+innerW*.71,y+bh*.22,Math.max(1.0,w*.011),Math.max(1.0,w*.011)).fill({color:0xffffff,alpha:.25});
        liquid.ellipse(innerL+innerW*.62,y+bh*.38,Math.max(.9,w*.009),Math.max(.9,w*.009)).fill({color:0xffffff,alpha:.18});
      }else{
        liquid.moveTo(innerL,y+.7).lineTo(innerR,y+.7).stroke({color:0xffffff,width:.55,alpha:.22});
      }

      if(isBottom){
        liquid.ellipse(cx,liquidBottom-1,innerW*.47,3.8).fill({color,alpha:.90});
        liquid.ellipse(cx,liquidBottom+1,innerW*.35,2.3).fill({color:0xffffff,alpha:.08});
      }
      wrap.addChild(liquid);

      // approved reference: bold black symbol directly on liquid, no badges
      const label=new Text({text:sym,style:new TextStyle({
        fontFamily:'Inter,system-ui,sans-serif',fontSize:Math.max(12,w*.205),fontWeight:'900',
        fill:0x061018,align:'center'
      })});
      label.anchor.set(.5);label.x=cx;label.y=y+bh/2+1;label.alpha=.98;
      wrap.addChild(label);
    }
  }

  // front glass reflections over liquid
  const glassFront=new Graphics();
  glassFront.moveTo(outerL+2,neckY+2).lineTo(outerL+2,roundY)
    .bezierCurveTo(outerL+2,h-25,w*.29,bottomY+1,cx,bottomY+3)
    .bezierCurveTo(w*.71,bottomY+1,outerR-2,h-25,outerR-2,roundY).lineTo(outerR-2,neckY+2)
    .stroke({color:0xffffff,width:.65,alpha:.26});
  glassFront.moveTo(outerL+7,28).bezierCurveTo(outerL+3,h*.37,outerL+7,h*.68,outerL+13,h-42)
    .stroke({color:0xffffff,width:1.65,alpha:.29});
  glassFront.moveTo(outerR-9,34).bezierCurveTo(outerR-6,h*.43,outerR-8,h*.59,outerR-12,h*.70)
    .stroke({color:0x86e8ff,width:.62,alpha:.14});
  wrap.addChild(glassFront);

  // thick luminous rim from approved master reference
  const rimGlow=new Graphics();
  rimGlow.ellipse(cx,rimY,w*.51,7.8).stroke({color:tube.length?topColor:0x7bdfff,width:4.0,alpha:tube.length?.15:.12});
  wrap.addChild(rimGlow);

  const rim=new Graphics();
  rim.ellipse(cx,rimY,w*.50,7.3).fill({color:0xbbefff,alpha:.16}).stroke({color:0xf7feff,width:2.15,alpha:1});
  rim.ellipse(cx,rimY,w*.405,4.65).fill({color:0x03101a,alpha:.98}).stroke({color:0xa9edff,width:1.15,alpha:.82});
  rim.moveTo(w*.265,rimY-1.6).bezierCurveTo(w*.38,rimY-6.1,w*.62,rimY-6.1,w*.735,rimY-1.6)
    .stroke({color:0xffffff,width:1.35,alpha:.94});
  rim.moveTo(w*.31,rimY+2.1).bezierCurveTo(w*.40,rimY+5.0,w*.60,rimY+5.0,w*.69,rimY+2.1)
    .stroke({color:0x65dfff,width:.85,alpha:.52});
  wrap.addChild(rim);

  parent.addChild(wrap);
  return wrap;
}

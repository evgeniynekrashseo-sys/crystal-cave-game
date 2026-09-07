import { Container, Graphics, Sprite, Text, TextStyle, Texture } from 'pixi.js';
import { APPROVED_TUBE } from './v91-approved-assets';

export type PremiumSymbol=string;
export type PremiumTube=PremiumSymbol[];
export type PremiumGeometry={w:number;h:number};

const approvedTubeTexture=Texture.from(APPROVED_TUBE);
const APPROVED_ASPECT=267/108;

export function drawPremiumTube(parent:Container,tube:PremiumTube,colorOf:(s:PremiumSymbol)=>number,g:PremiumGeometry,selected:boolean){
  const wrap=new Container();
  const w=g.w;
  const h=w*APPROVED_ASPECT;
  const cx=w/2;

  if(selected){
    const halo=new Graphics();
    halo.ellipse(cx,h*.52,w*.60,h*.43).fill({color:0x3fe4ff,alpha:.075});
    halo.ellipse(cx,h*.52,w*.51,h*.405).stroke({color:0x65eaff,width:2,alpha:.26});
    wrap.addChild(halo);
  }

  // Lossless 108×267 crop from the approved visual. Uniform scale only.
  const glassBack=new Sprite(approvedTubeTexture);
  glassBack.x=0;glassBack.y=0;glassBack.width=w;glassBack.height=h;glassBack.alpha=.78;
  wrap.addChild(glassBack);

  if(tube.length){
    const innerL=w*.218,innerR=w*.782,innerW=innerR-innerL;
    const liquidTop=h*.142,liquidBottom=h*.866;
    const slot=(liquidBottom-liquidTop)/4;
    for(let i=0;i<tube.length;i++){
      const sym=tube[i],color=colorOf(sym);
      const y=liquidBottom-(i+1)*slot;
      const bh=slot+.8;
      const isBottom=i===0,isTop=i===tube.length-1;
      const liquid=new Graphics();

      if(isBottom){
        liquid.moveTo(innerL,y).lineTo(innerR,y).lineTo(innerR,liquidBottom-w*.105)
          .bezierCurveTo(innerR,liquidBottom-w*.025,w*.66,liquidBottom+1,cx,liquidBottom+2)
          .bezierCurveTo(w*.34,liquidBottom+1,innerL,liquidBottom-w*.025,innerL,liquidBottom-w*.105)
          .closePath().fill({color,alpha:.975});
      }else{
        liquid.rect(innerL,y,innerW,bh+1).fill({color,alpha:.975});
      }

      liquid.rect(innerL,y+bh*.59,innerW,bh*.41).fill({color:0x001018,alpha:.075});
      liquid.rect(innerL+innerW*.055,y+3,innerW*.065,Math.max(5,bh-6)).fill({color:0xffffff,alpha:.17});
      liquid.rect(innerR-innerW*.052,y+4,innerW*.028,Math.max(5,bh-8)).fill({color:0x001018,alpha:.11});

      if(isTop){
        liquid.moveTo(innerL,y+3.6)
          .bezierCurveTo(innerL+innerW*.15,y+.7,innerL+innerW*.29,y+5.7,innerL+innerW*.45,y+2.8)
          .bezierCurveTo(innerL+innerW*.61,y+.5,innerL+innerW*.77,y+5.3,innerR,y+2.4)
          .lineTo(innerR,y+8.8)
          .bezierCurveTo(innerL+innerW*.74,y+10.8,innerL+innerW*.28,y+10.0,innerL,y+10.9)
          .closePath().fill({color,alpha:1});
        liquid.moveTo(innerL+1,y+3.6)
          .bezierCurveTo(innerL+innerW*.16,y+1,innerL+innerW*.30,y+5.3,innerL+innerW*.45,y+2.9)
          .bezierCurveTo(innerL+innerW*.62,y+.9,innerL+innerW*.77,y+5,innerR-1,y+2.5)
          .stroke({color:0xffffff,width:.9,alpha:.46});
        liquid.circle(innerL+innerW*.29,y+bh*.28,Math.max(1,w*.009)).fill({color:0xffffff,alpha:.28});
        liquid.circle(innerL+innerW*.70,y+bh*.22,Math.max(.8,w*.007)).fill({color:0xffffff,alpha:.21});
      }else{
        liquid.moveTo(innerL,y+.8).lineTo(innerR,y+.8).stroke({color:0xffffff,width:.5,alpha:.16});
      }

      wrap.addChild(liquid);
      const label=new Text({text:sym,style:new TextStyle({fontFamily:'Inter,system-ui,sans-serif',fontSize:Math.max(11,w*.18),fontWeight:'900',fill:0x050a0e,align:'center'})});
      label.anchor.set(.5);label.x=cx;label.y=y+bh/2+1;wrap.addChild(label);
    }
  }

  // The same approved PNG is composited again as a front optical layer.
  // Screen blend makes the original bright rim/reflections survive over the liquid without redrawing them.
  const glassFront=new Sprite(approvedTubeTexture);
  glassFront.x=0;glassFront.y=0;glassFront.width=w;glassFront.height=h;
  glassFront.alpha=tube.length?.76:1;
  glassFront.blendMode='screen';
  wrap.addChild(glassFront);

  const floor=new Graphics();
  floor.ellipse(cx,h+3,w*.28,3).fill({color:tube.length?colorOf(tube[0]):0x55dfff,alpha:tube.length?.14:.06});
  wrap.addChildAt(floor,0);
  parent.addChild(wrap);
  return wrap;
}

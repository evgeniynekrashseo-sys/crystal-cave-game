import { Container, Graphics, Sprite, Text, TextStyle, Texture } from 'pixi.js';
import { APPROVED_TUBE } from './v91-approved-assets';

export type PremiumSymbol=string;
export type PremiumTube=PremiumSymbol[];
export type PremiumGeometry={w:number;h:number};

const approvedTubeTexture=Texture.from(APPROVED_TUBE);
const APPROVED_ASPECT=267/108;

function shade(color:number,factor:number){
  const r=(color>>16)&255,g=(color>>8)&255,b=color&255;
  const q=(v:number)=>Math.max(0,Math.min(255,Math.round(v*factor)));
  return (q(r)<<16)|(q(g)<<8)|q(b);
}

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

  // Exact approved tube pixels remain the glass silhouette.
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
      const wave=(i%2===0?1:-1)*(selected?2.6:1.45);
      const dark=shade(color,.64);
      const deep=shade(color,.42);

      // Each reagent is drawn as a volume with curved interfaces instead of a flat rectangle.
      liquid.moveTo(innerL,y+3)
        .bezierCurveTo(innerL+innerW*.18,y+wave,innerL+innerW*.34,y+5-wave*.5,cx,y+3-wave*.35)
        .bezierCurveTo(innerL+innerW*.67,y+1+wave*.5,innerL+innerW*.83,y+5-wave*.25,innerR,y+3)
        .lineTo(innerR,y+bh-(isBottom?w*.09:0));

      if(isBottom){
        liquid.bezierCurveTo(innerR,liquidBottom-w*.025,w*.66,liquidBottom+1,cx,liquidBottom+2)
          .bezierCurveTo(w*.34,liquidBottom+1,innerL,liquidBottom-w*.025,innerL,liquidBottom-w*.105);
      }else{
        liquid.lineTo(innerL,y+bh);
      }
      liquid.closePath().fill({color,alpha:.965});

      // Vertical density gradient illusion, edge absorption and glass refraction cue.
      liquid.rect(innerL,y+bh*.58,innerW,bh*.42).fill({color:dark,alpha:.22});
      liquid.rect(innerL,y+bh*.80,innerW,bh*.20).fill({color:deep,alpha:.12});
      liquid.rect(innerL+innerW*.045,y+5,innerW*.07,Math.max(5,bh-9)).fill({color:0xffffff,alpha:.16});
      liquid.rect(innerR-innerW*.055,y+5,innerW*.03,Math.max(5,bh-10)).fill({color:0x001018,alpha:.14});

      // Meniscus highlight gives the layer a readable surface even when stacked.
      liquid.moveTo(innerL+1,y+3)
        .bezierCurveTo(innerL+innerW*.18,y+wave+.4,innerL+innerW*.34,y+4.6-wave*.5,cx,y+3-wave*.35)
        .bezierCurveTo(innerL+innerW*.67,y+1.4+wave*.5,innerL+innerW*.83,y+4.7-wave*.25,innerR-1,y+3)
        .stroke({color:0xffffff,width:isTop?1.15:.7,alpha:isTop?.48:.22});

      // Micro-bubbles / suspended particles are deterministic so rerenders do not visually jump.
      const bubbleSeed=(sym.charCodeAt(0)+(sym.charCodeAt(1)||0)+i*17)%29;
      const bubbleCount=isTop?3:2;
      for(let b=0;b<bubbleCount;b++){
        const bx=innerL+innerW*(.22+(((bubbleSeed+b*11)%53)/100));
        const by=y+bh*(.24+(((bubbleSeed+b*7)%46)/100));
        const br=Math.max(.75,w*(.006+(b%2)*.003));
        liquid.circle(bx,by,br).fill({color:0xffffff,alpha:.18+(b===0?.08:0)});
        liquid.circle(bx-br*.25,by-br*.28,br*.28).fill({color:0xffffff,alpha:.38});
      }

      wrap.addChild(liquid);

      // Chemical symbol behaves like a suspended marker inside the fluid rather than UI pasted on top.
      const marker=new Graphics();
      marker.roundRect(cx-w*.15,y+bh*.5-w*.105,w*.30,w*.21,w*.075)
        .fill({color:0xffffff,alpha:.16})
        .stroke({color:0xffffff,width:.65,alpha:.23});
      marker.rotation=(i%2===0?-.012:.012)+(selected?(i%2===0?-.012:.012):0);
      marker.pivot.set(cx,y+bh*.5);
      marker.position.set(cx,y+bh*.5);
      wrap.addChild(marker);

      const label=new Text({text:sym,style:new TextStyle({fontFamily:'Inter,system-ui,sans-serif',fontSize:Math.max(11,w*.17),fontWeight:'900',fill:0x061017,align:'center'})});
      label.anchor.set(.5);label.x=cx;label.y=y+bh/2+1;
      label.rotation=marker.rotation*.65;
      wrap.addChild(label);
    }
  }

  // Approved crop is composited again as the front optical layer, preserving the original rim/reflections.
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

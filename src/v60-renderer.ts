import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export type PremiumSymbol = string;
export type PremiumTube = PremiumSymbol[];
export type PremiumGeometry={w:number;h:number};

export function drawPremiumTube(parent:Container,tube:PremiumTube,colorOf:(s:PremiumSymbol)=>number,g:PremiumGeometry,selected:boolean){
  const wrap=new Container();
  const w=g.w,h=g.h;
  const left=w*.21,right=w*.79,top=8,bottom=h-14,neckY=18,roundStart=h-40;
  const innerX=w*.245,innerW=w*.51;
  const bottomColor=tube.length?colorOf(tube[0]):0x1d8fbd;
  const topColor=tube.length?colorOf(tube[tube.length-1]):0x1d8fbd;

  const shadow=new Graphics();
  shadow.ellipse(w/2,h+5,w*.24,3.8).fill({color:0x00050a,alpha:.52});
  if(tube.length)shadow.ellipse(w/2,h+4,w*.16,2.2).fill({color:bottomColor,alpha:.10});
  wrap.addChild(shadow);

  if(selected){
    const halo=new Graphics();
    halo.moveTo(left-2,neckY).lineTo(left-2,roundStart).bezierCurveTo(left-2,h-22,w*.33,bottom+2,w/2,bottom+3).bezierCurveTo(w*.67,bottom+2,right+2,h-22,right+2,roundStart).lineTo(right+2,neckY)
      .stroke({color:0x56e8ff,width:2.2,alpha:.30});
    wrap.addChild(halo);
  }

  const body=new Graphics();
  body.moveTo(left,neckY).lineTo(left,roundStart).bezierCurveTo(left,h-23,w*.33,bottom,w/2,bottom+1).bezierCurveTo(w*.67,bottom,right,h-23,right,roundStart).lineTo(right,neckY)
    .fill({color:0x03131c,alpha:.22})
    .stroke({color:selected?0xe7fbff:0xaadfee,width:selected?1.25:.72,alpha:selected?.92:.46});
  body.moveTo(left+4,25).bezierCurveTo(left+2,h*.40,left+5,h*.72,left+8,h-31).stroke({color:0xffffff,width:.85,alpha:.22});
  body.moveTo(right-4,28).bezierCurveTo(right-2,h*.45,right-5,h*.68,right-8,h-34).stroke({color:0x69dfff,width:.52,alpha:.09});
  wrap.addChild(body);

  if(tube.length){
    const liquidBottom=h-18;
    const usableH=h-42;
    const slot=usableH/4;

    for(let i=0;i<tube.length;i++){
      const sym=tube[i],color=colorOf(sym);
      const y=liquidBottom-(i+1)*slot;
      const bh=slot+.7;
      const liquid=new Graphics();

      liquid.rect(innerX,y,innerW,bh).fill({color,alpha:.91});
      liquid.rect(innerX,y+bh*.58,innerW,bh*.42).fill({color:0x001018,alpha:.10});
      liquid.rect(innerX+innerW*.07,y+3,Math.max(1,innerW*.055),Math.max(3,bh-6)).fill({color:0xffffff,alpha:.11});
      liquid.rect(innerX+innerW*.83,y+3,Math.max(1,innerW*.04),Math.max(3,bh-6)).fill({color:0x001018,alpha:.11});

      if(i===tube.length-1){
        liquid.ellipse(w/2,y+1.6,innerW*.49,3.1).fill({color,alpha:.98});
        liquid.moveTo(innerX+1,y+2)
          .bezierCurveTo(innerX+innerW*.22,y-.8,innerX+innerW*.34,y+3.8,innerX+innerW*.50,y+1.4)
          .bezierCurveTo(innerX+innerW*.65,y-.4,innerX+innerW*.78,y+3.1,innerX+innerW-1,y+1)
          .stroke({color:0xffffff,width:.55,alpha:.28});
      }

      if(i===0)liquid.ellipse(w/2,liquidBottom,innerW*.48,2.8).fill({color,alpha:.88});
      wrap.addChild(liquid);

      const label=new Text({text:sym,style:new TextStyle({
        fontFamily:'Inter,system-ui,sans-serif',
        fontSize:Math.max(10,w*.135),
        fontWeight:'800',
        fill:0xffffff,
        stroke:{color:0x061018,width:2},
        align:'center'
      })});
      label.alpha=.96;
      label.anchor.set(.5);
      label.x=w/2;
      label.y=y+bh/2+.5;
      wrap.addChild(label);
    }
  }

  const glassFront=new Graphics();
  glassFront.moveTo(left+1,neckY+2).lineTo(left+1,roundStart).bezierCurveTo(left+1,h-24,w*.34,bottom+1,w/2,bottom+2).bezierCurveTo(w*.66,bottom+1,right-1,h-24,right-1,roundStart).lineTo(right-1,neckY+2)
    .stroke({color:0xffffff,width:.38,alpha:.16});
  glassFront.moveTo(left+6,26).bezierCurveTo(left+4,h*.42,left+6,h*.68,left+9,h-34).stroke({color:0xffffff,width:1.05,alpha:.13});
  wrap.addChild(glassFront);

  const rim=new Graphics();
  rim.ellipse(w/2,top,w*.32,3.4).fill({color:0x06121a,alpha:.98}).stroke({color:0xe7fbff,width:1.0,alpha:.88});
  rim.ellipse(w/2,top,w*.25,2.0).fill({color:0x01080d,alpha:.98}).stroke({color:tube.length?topColor:0x69dfff,width:.48,alpha:tube.length?.34:.46});
  rim.moveTo(w*.39,6.5).bezierCurveTo(w*.46,4.9,w*.54,4.9,w*.61,6.5).stroke({color:0xffffff,width:.55,alpha:.56});
  wrap.addChild(rim);

  parent.addChild(wrap);
  return wrap;
}

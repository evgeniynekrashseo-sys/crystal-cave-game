import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export type PremiumSymbol = string;
export type PremiumTube = PremiumSymbol[];

export type PremiumGeometry={w:number;h:number};

export function drawPremiumTube(
  parent:Container,
  tube:PremiumTube,
  colorOf:(s:PremiumSymbol)=>number,
  g:PremiumGeometry,
  selected:boolean,
){
  const wrap=new Container();
  const w=g.w,h=g.h;

  const floor=new Graphics()
    .ellipse(w/2,h+10,w*.29,4.5)
    .fill({color:0x000000,alpha:.34});
  wrap.addChild(floor);

  const glass=new Graphics();
  glass.roundRect(5,6,w-10,h-8,w*.33)
    .fill({color:0x071015,alpha:.20})
    .stroke({color:selected?0xbcefff:0xd7eef5,width:selected?1.6:.75,alpha:selected?.62:.22});
  glass.roundRect(9,12,w-18,h-22,w*.27)
    .fill({color:0x0a1419,alpha:.13});
  wrap.addChild(glass);

  if(tube.length){
    const innerX=11;
    const innerW=w-22;
    const slot=(h-39)/4;
    const bottom=h-16;
    let runStart=0;
    for(let i=0;i<tube.length;i++){
      const isEnd=i===tube.length-1||tube[i+1]!==tube[i];
      if(!isEnd)continue;
      const sym=tube[i];
      const count=i-runStart+1;
      const y=bottom-(i+1)*slot;
      const bh=count*slot+2;
      const color=colorOf(sym);
      const liquid=new Graphics();
      liquid.roundRect(innerX,y,innerW,bh,Math.min(9,bh*.14)).fill({color,alpha:.82});
      liquid.rect(innerX,y+bh*.52,innerW,bh*.48).fill({color:0x000000,alpha:.11});
      liquid.ellipse(w/2,y+1,innerW/2,4.4).fill({color,alpha:.96});
      liquid.ellipse(w/2,y+1,innerW*.36,2.1).stroke({color:0xffffff,width:.65,alpha:.24});
      liquid.rect(innerX+2,y+4,1.8,Math.max(4,bh-8)).fill({color:0xffffff,alpha:.11});
      if(runStart===0)liquid.ellipse(w/2,bottom,innerW/2,3.7).fill({color,alpha:.86});
      wrap.addChild(liquid);

      const label=new Text({text:sym,style:new TextStyle({
        fontFamily:'Inter,system-ui,sans-serif',
        fontSize:Math.max(12,w*.16),
        fontWeight:'600',
        fill:0xffffff,
        align:'center',
      })});
      label.alpha=.86;
      label.anchor.set(.5);
      label.x=w/2;
      label.y=y+bh/2;
      wrap.addChild(label);
      runStart=i+1;
    }
  }

  const caustic=new Graphics();
  caustic.moveTo(13,28).bezierCurveTo(8,h*.37,10,h*.67,15,h-42)
    .stroke({color:0xffffff,width:1,alpha:.20});
  caustic.moveTo(w-14,34).bezierCurveTo(w-9,h*.42,w-10,h*.66,w-14,h-48)
    .stroke({color:0x9be8ff,width:.7,alpha:.08});
  wrap.addChild(caustic);

  const rim=new Graphics();
  rim.ellipse(w/2,7,w*.57,6.4)
    .fill({color:0x071015,alpha:.92})
    .stroke({color:0xe1f5fb,width:.8,alpha:.28});
  rim.ellipse(w/2,7,w*.44,3.5)
    .stroke({color:0x9be8ff,width:.55,alpha:.20});
  wrap.addChild(rim);

  if(selected){
    const selectGlow=new Graphics()
      .roundRect(2,3,w-4,h-2,w*.36)
      .stroke({color:0x82e9ff,width:3,alpha:.10});
    wrap.addChildAt(selectGlow,0);
  }

  parent.addChild(wrap);
  return wrap;
}

import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export type PremiumSymbol = string;
export type PremiumTube = PremiumSymbol[];
export type PremiumGeometry={w:number;h:number};

export function drawPremiumTube(parent:Container,tube:PremiumTube,colorOf:(s:PremiumSymbol)=>number,g:PremiumGeometry,selected:boolean){
  const wrap=new Container();
  const w=g.w,h=g.h;
  const left=w*.17,right=w*.83,top=9,bottom=h-18,neckY=22,roundStart=h-58;
  const bottomColor=tube.length?colorOf(tube[0]):0x1d8fbd;
  const topColor=tube.length?colorOf(tube[tube.length-1]):0x1d8fbd;

  const materialLight=new Graphics();
  if(tube.length){
    materialLight.ellipse(w/2,h+8,w*.44,7.6).fill({color:bottomColor,alpha:selected?.18:.085});
    materialLight.ellipse(w/2,h*.67,w*.48,h*.25).fill({color:bottomColor,alpha:.022});
    materialLight.ellipse(w/2,h*.30,w*.40,h*.17).fill({color:topColor,alpha:.018});
  }
  wrap.addChild(materialLight);

  const floor=new Graphics();
  floor.ellipse(w/2,h+11,w*.29,5.1).fill({color:0x00050a,alpha:.76});
  floor.ellipse(w/2,h+9,w*.21,3.2).fill({color:tube.length?bottomColor:(selected?0x42dfff:0x16384c),alpha:tube.length?.12:(selected?.24:.12)});
  wrap.addChild(floor);

  const ambient=new Graphics();
  ambient.moveTo(left-2,neckY).lineTo(left-2,roundStart).bezierCurveTo(left-2,h-28,w*.30,bottom+2,w/2,bottom+3).bezierCurveTo(w*.70,bottom+2,right+2,h-28,right+2,roundStart).lineTo(right+2,neckY)
    .stroke({color:selected?0x56e8ff:0x2cb4e8,width:selected?3.2:1.35,alpha:selected?.20:.068});
  wrap.addChild(ambient);

  const glassBack=new Graphics();
  glassBack.moveTo(left,neckY).lineTo(left,roundStart).bezierCurveTo(left,h-29,w*.30,bottom,w/2,bottom+1).bezierCurveTo(w*.70,bottom,right,h-29,right,roundStart).lineTo(right,neckY)
    .fill({color:0x02131e,alpha:.26}).stroke({color:selected?0xe8fcff:0xbcecff,width:selected?1.45:.88,alpha:selected?.98:.54});
  glassBack.moveTo(left+4,30).bezierCurveTo(left+1,h*.38,left+4,h*.72,left+8,h-44).stroke({color:0xffffff,width:1.15,alpha:.34});
  glassBack.moveTo(right-5,33).bezierCurveTo(right-1,h*.43,right-4,h*.72,right-9,h-47).stroke({color:0x72e2ff,width:.75,alpha:.14});
  glassBack.moveTo(w*.32,bottom-4).bezierCurveTo(w*.41,bottom,w*.59,bottom,w*.68,bottom-4).stroke({color:0xffffff,width:.82,alpha:.15});
  wrap.addChild(glassBack);

  if(tube.length){
    const innerX=w*.205,innerW=w*.59,slot=(h-52)/4,liquidBottom=h-23;
    for(let i=0;i<tube.length;i++){
      const sym=tube[i],color=colorOf(sym),y=liquidBottom-(i+1)*slot+3,bh=slot+1;
      const liquid=new Graphics();
      const radius=Math.min(7,bh*.11);
      liquid.roundRect(innerX,y,innerW,bh,radius).fill({color,alpha:.93});
      liquid.rect(innerX,y+bh*.52,innerW,bh*.48).fill({color:0x000b12,alpha:.13});
      liquid.rect(innerX+innerW*.08,y+bh*.10,innerW*.17,bh*.76).fill({color:0xffffff,alpha:.035});
      liquid.rect(innerX+innerW*.72,y+bh*.10,innerW*.14,bh*.75).fill({color:0x00131f,alpha:.10});
      liquid.moveTo(innerX,y+4)
        .bezierCurveTo(innerX+innerW*.15,y+.8,innerX+innerW*.29,y+6.2,innerX+innerW*.44,y+3.1)
        .bezierCurveTo(innerX+innerW*.59,y+.3,innerX+innerW*.73,y+5.8,innerX+innerW,y+2)
        .lineTo(innerX+innerW,y+8)
        .bezierCurveTo(innerX+innerW*.70,y+11.3,innerX+innerW*.30,y+9.3,innerX,y+11)
        .closePath().fill({color,alpha:.99});
      liquid.moveTo(innerX+2,y+3.9)
        .bezierCurveTo(innerX+innerW*.17,y+1.1,innerX+innerW*.31,y+5.7,innerX+innerW*.45,y+3)
        .bezierCurveTo(innerX+innerW*.60,y+.5,innerX+innerW*.76,y+5.2,innerX+innerW-2,y+2.3)
        .stroke({color:0xffffff,width:.72,alpha:.37});
      liquid.ellipse(innerX+innerW*.34,y+bh*.31,innerW*.16,bh*.10).fill({color:0xffffff,alpha:.035});
      liquid.ellipse(innerX+innerW*.68,y+bh*.69,innerW*.13,bh*.08).fill({color:0x000d15,alpha:.07});
      liquid.rect(innerX+2.4,y+8,1.15,Math.max(5,bh-13)).fill({color:0xffffff,alpha:.11});
      if(i===0)liquid.ellipse(w/2,liquidBottom,innerW*.49,3.5).fill({color,alpha:.91});
      wrap.addChild(liquid);

      const badgeW=Math.max(24,w*.31),badgeH=Math.max(16,w*.18);
      const badge=new Graphics();
      badge.roundRect(w/2-badgeW/2,y+bh/2-badgeH/2,badgeW,badgeH,badgeH*.42)
        .fill({color:0x021018,alpha:.60})
        .stroke({color:0xffffff,width:.5,alpha:.24});
      badge.moveTo(w/2-badgeW*.30,y+bh/2-badgeH*.22).lineTo(w/2-badgeW*.30,y+bh/2+badgeH*.22).stroke({color:0xffffff,width:.65,alpha:.16});
      wrap.addChild(badge);

      const label=new Text({text:sym,style:new TextStyle({fontFamily:'Inter,system-ui,sans-serif',fontSize:Math.max(11,w*.142),fontWeight:'800',fill:0xf7fcff,stroke:{color:0x010508,width:1},align:'center'})});
      label.alpha=.98;label.anchor.set(.5);label.x=w/2;label.y=y+bh/2+.5;wrap.addChild(label);
    }
  }

  const frontGlass=new Graphics();
  frontGlass.moveTo(left+1,neckY+3).lineTo(left+1,roundStart).bezierCurveTo(left+1,h-30,w*.31,bottom+1,w/2,bottom+2).bezierCurveTo(w*.69,bottom+1,right-1,h-30,right-1,roundStart).lineTo(right-1,neckY+3)
    .stroke({color:0xffffff,width:.44,alpha:.19});
  frontGlass.moveTo(left+7,34).bezierCurveTo(left+3,h*.39,left+6,h*.66,left+10,h-52).stroke({color:0xffffff,width:1.42,alpha:.16});
  frontGlass.moveTo(w*.41,27).bezierCurveTo(w*.39,h*.30,w*.40,h*.42,w*.43,h*.51).stroke({color:0xffffff,width:.55,alpha:.075});
  frontGlass.moveTo(w*.61,30).bezierCurveTo(w*.64,h*.34,w*.63,h*.48,w*.60,h*.58).stroke({color:0x74e8ff,width:.44,alpha:.06});
  wrap.addChild(frontGlass);

  const rimGlow=new Graphics();
  rimGlow.ellipse(w/2,top,w*.43,5.2).stroke({color:tube.length?topColor:0x58dfff,width:3,alpha:tube.length?.085:.10});
  wrap.addChild(rimGlow);

  const rim=new Graphics();
  rim.ellipse(w/2,top,w*.43,5.0).fill({color:0x07131d,alpha:.99}).stroke({color:0xe9fcff,width:1.3,alpha:.93});
  rim.ellipse(w/2,top,w*.34,2.9).fill({color:0x020a11,alpha:.98}).stroke({color:tube.length?topColor:0x78ddff,width:.70,alpha:tube.length?.40:.58});
  rim.moveTo(w*.34,7.4).bezierCurveTo(w*.43,4.7,w*.57,4.7,w*.66,7.4).stroke({color:0xffffff,width:.78,alpha:.72});
  wrap.addChild(rim);

  if(selected){
    const select=new Graphics();
    select.moveTo(left-3,neckY).lineTo(left-3,roundStart).bezierCurveTo(left-3,h-27,w*.29,bottom+3,w/2,bottom+5).bezierCurveTo(w*.71,bottom+3,right+3,h-27,right+3,roundStart).lineTo(right+3,neckY)
      .stroke({color:0x55e9ff,width:1.75,alpha:.40});
    select.ellipse(w/2,h+9,w*.24,3.7).fill({color:tube.length?bottomColor:0x31dfff,alpha:.15});
    wrap.addChildAt(select,0);
  }

  parent.addChild(wrap);
  return wrap;
}

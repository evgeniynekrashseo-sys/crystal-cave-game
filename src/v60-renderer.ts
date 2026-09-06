import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export type PremiumSymbol = string;
export type PremiumTube = PremiumSymbol[];
export type PremiumGeometry={w:number;h:number};

export function drawPremiumTube(parent:Container,tube:PremiumTube,colorOf:(s:PremiumSymbol)=>number,g:PremiumGeometry,selected:boolean){
  const wrap=new Container();
  const w=g.w,h=g.h;
  const left=w*.17,right=w*.83,top=9,bottom=h-18,neckY=22,roundStart=h-58;

  const floor=new Graphics();
  floor.ellipse(w/2,h+11,w*.27,4.6).fill({color:0x00050a,alpha:.72});
  floor.ellipse(w/2,h+9,w*.18,2.9).fill({color:selected?0x42dfff:0x16384c,alpha:selected?.24:.12});
  wrap.addChild(floor);

  const ambient=new Graphics();
  ambient.moveTo(left-2,neckY).lineTo(left-2,roundStart).bezierCurveTo(left-2,h-28,w*.30,bottom+2,w/2,bottom+3).bezierCurveTo(w*.70,bottom+2,right+2,h-28,right+2,roundStart).lineTo(right+2,neckY)
    .stroke({color:selected?0x56e8ff:0x2cb4e8,width:selected?3.2:1.4,alpha:selected?.20:.075});
  wrap.addChild(ambient);

  const glassBack=new Graphics();
  glassBack.moveTo(left,neckY).lineTo(left,roundStart).bezierCurveTo(left,h-29,w*.30,bottom,w/2,bottom+1).bezierCurveTo(w*.70,bottom,right,h-29,right,roundStart).lineTo(right,neckY)
    .fill({color:0x02131e,alpha:.30}).stroke({color:selected?0xe8fcff:0xbcecff,width:selected?1.45:.9,alpha:selected?.98:.56});
  glassBack.moveTo(left+4,30).bezierCurveTo(left+1,h*.38,left+4,h*.72,left+8,h-44).stroke({color:0xffffff,width:1.15,alpha:.34});
  glassBack.moveTo(right-5,33).bezierCurveTo(right-1,h*.43,right-4,h*.72,right-9,h-47).stroke({color:0x72e2ff,width:.75,alpha:.15});
  glassBack.moveTo(w*.32,bottom-4).bezierCurveTo(w*.41,bottom,w*.59,bottom,w*.68,bottom-4).stroke({color:0xffffff,width:.85,alpha:.16});
  wrap.addChild(glassBack);

  if(tube.length){
    const innerX=w*.205,innerW=w*.59,slot=(h-52)/4,liquidBottom=h-23;
    for(let i=0;i<tube.length;i++){
      const sym=tube[i],color=colorOf(sym),y=liquidBottom-(i+1)*slot+3,bh=slot+1;
      const liquid=new Graphics();
      const radius=Math.min(7,bh*.11);
      liquid.roundRect(innerX,y,innerW,bh,radius).fill({color,alpha:.965});
      liquid.rect(innerX,y+bh*.58,innerW,bh*.42).fill({color:0x00111a,alpha:.085});
      liquid.moveTo(innerX,y+4)
        .bezierCurveTo(innerX+innerW*.16,y+1,innerX+innerW*.28,y+6,innerX+innerW*.43,y+3)
        .bezierCurveTo(innerX+innerW*.58,y,innerX+innerW*.72,y+5,innerX+innerW,y+2)
        .lineTo(innerX+innerW,y+8)
        .bezierCurveTo(innerX+innerW*.70,y+11,innerX+innerW*.30,y+9,innerX,y+11)
        .closePath().fill({color,alpha:.98});
      liquid.moveTo(innerX+2,y+4)
        .bezierCurveTo(innerX+innerW*.18,y+1.5,innerX+innerW*.31,y+6,innerX+innerW*.45,y+3.2)
        .bezierCurveTo(innerX+innerW*.60,y+.7,innerX+innerW*.76,y+5.4,innerX+innerW-2,y+2.5)
        .stroke({color:0xffffff,width:.72,alpha:.34});
      liquid.rect(innerX+2.4,y+8,1.2,Math.max(5,bh-13)).fill({color:0xffffff,alpha:.12});
      liquid.rect(innerX+innerW-3.6,y+10,1,Math.max(4,bh-16)).fill({color:0x042739,alpha:.12});
      if(i===0)liquid.ellipse(w/2,liquidBottom,innerW*.49,3.5).fill({color,alpha:.93});
      wrap.addChild(liquid);

      const label=new Text({text:sym,style:new TextStyle({fontFamily:'Inter,system-ui,sans-serif',fontSize:Math.max(12,w*.155),fontWeight:'800',fill:0x061018,align:'center'})});
      label.anchor.set(.5);label.x=w/2;label.y=y+bh/2+.5;wrap.addChild(label);
    }
  }

  const frontGlass=new Graphics();
  frontGlass.moveTo(left+1,neckY+3).lineTo(left+1,roundStart).bezierCurveTo(left+1,h-30,w*.31,bottom+1,w/2,bottom+2).bezierCurveTo(w*.69,bottom+1,right-1,h-30,right-1,roundStart).lineTo(right-1,neckY+3)
    .stroke({color:0xffffff,width:.45,alpha:.20});
  frontGlass.moveTo(left+7,34).bezierCurveTo(left+3,h*.39,left+6,h*.66,left+10,h-52).stroke({color:0xffffff,width:1.45,alpha:.16});
  wrap.addChild(frontGlass);

  const rimGlow=new Graphics();
  rimGlow.ellipse(w/2,top,w*.43,5.2).stroke({color:0x58dfff,width:3,alpha:.10});
  wrap.addChild(rimGlow);

  const rim=new Graphics();
  rim.ellipse(w/2,top,w*.43,5.0).fill({color:0x07131d,alpha:.99}).stroke({color:0xe9fcff,width:1.35,alpha:.96});
  rim.ellipse(w/2,top,w*.34,2.9).fill({color:0x020a11,alpha:.98}).stroke({color:0x78ddff,width:.72,alpha:.58});
  rim.moveTo(w*.34,7.4).bezierCurveTo(w*.43,4.7,w*.57,4.7,w*.66,7.4).stroke({color:0xffffff,width:.8,alpha:.72});
  wrap.addChild(rim);

  if(selected){
    const select=new Graphics();
    select.moveTo(left-3,neckY).lineTo(left-3,roundStart).bezierCurveTo(left-3,h-27,w*.29,bottom+3,w/2,bottom+5).bezierCurveTo(w*.71,bottom+3,right+3,h-27,right+3,roundStart).lineTo(right+3,neckY)
      .stroke({color:0x55e9ff,width:1.8,alpha:.42});
    select.ellipse(w/2,h+9,w*.22,3.4).fill({color:0x31dfff,alpha:.12});
    wrap.addChildAt(select,0);
  }

  parent.addChild(wrap);
  return wrap;
}

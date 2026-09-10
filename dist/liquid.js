// Presentation-only shallow surface simulation. Never changes puzzle state.
import {ORDER,tint} from './progression.js';

export function surface(size=14){
  return {y:Array(size).fill(0),v:Array(size).fill(0)};
}

export function stepSurface(s,dt){
  const n=s.y.length,next=[];
  for(let i=0;i<n;i++){
    const left=s.y[Math.max(0,i-1)],right=s.y[Math.min(n-1,i+1)];
    next[i]=s.v[i]+(-25*s.y[i]+65*(left+right-2*s.y[i])-5.5*s.v[i])*dt;
  }
  for(let i=0;i<n;i++){
    s.v[i]=Math.max(-70,Math.min(70,next[i]));
    s.y[i]=Math.max(-8,Math.min(8,s.y[i]+s.v[i]*dt));
  }
}

export function impulse(s,at=0.5,power=20){
  const i=Math.max(0,Math.min(s.y.length-1,Math.round(at*(s.y.length-1))));
  s.v[i]+=power;
}

export function liquidPalette(symbol){
  const index=Math.max(0,ORDER.indexOf(symbol));
  const referenceHues={Li:140,Au:46,He:190,Cl:330,Fe:30,Na:255};
  const hue=referenceHues[symbol]??(index*137.508+28)%360;
  return {
    top:`hsl(${hue} 100% 72%)`,
    middle:`hsl(${hue} 94% 61%)`,
    bottom:`hsl(${hue} 86% 48%)`,
    glow:`hsl(${hue} 100% 66% / .62)`
  };
}

// Geometry is exported so the visual contract can be tested without a browser.
// Every occupied slot becomes its own soft liquid portion; empty slots stay empty.
export function segmentGeometry(tokens,unit,height,weights=null,gap=1.5){
  let used=0;
  return tokens.map((symbol,index)=>{
    const fill=Math.max(0,unit*(weights?.[index]??1));
    const rawBottom=height-used;
    used+=fill;
    const rawTop=height-used;
    const inset=Math.min(gap/2,fill*.09);
    return {symbol,index,fill,top:rawTop+inset,bottom:rawBottom-inset};
  });
}

function segmentPath(c,item,layer){
  const {w,wave}=item;
  const left=.5,right=w-.5;
  const innerLeft=left+2.5,innerRight=right-2.5;
  const visibleHeight=Math.max(0,layer.bottom-layer.top);
  const bottomRadius=Math.min(layer.index===0?w/2:2,visibleHeight*.65);
  const topRadius=Math.min(3,visibleHeight*.12);
  const isSurface=layer.index===item.tokens.length-1;
  const waveStrength=isSurface?1:.16;
  const rippleStrength=isSurface?.7:.18;
  const points=[];

  for(let j=0;j<wave.y.length;j++){
    const ratio=j/(wave.y.length-1);
    const x=innerLeft+ratio*(innerRight-innerLeft);
    const motion=item.reduced?0:(wave.y[j]*waveStrength+Math.sin(item.phase*2+j*.75+layer.index*.8)*rippleStrength+(item.tilt||0)*(x-w/2));
    points.push({x,y:layer.top+motion});
  }

  c.beginPath();
  c.moveTo(left,points[0].y+topRadius);
  c.quadraticCurveTo(left,points[0].y,points[0].x,points[0].y);
  for(let j=1;j<points.length;j++)c.lineTo(points[j].x,points[j].y);
  const last=points.at(-1);
  c.quadraticCurveTo(right,last.y,right,last.y+topRadius);
  c.lineTo(right,layer.bottom-bottomRadius);
  c.quadraticCurveTo(right,layer.bottom,right-bottomRadius,layer.bottom);
  c.lineTo(left+bottomRadius,layer.bottom);
  c.quadraticCurveTo(left,layer.bottom,left,layer.bottom-bottomRadius);
  c.closePath();
  return points;
}

export class LiquidRenderer{
  constructor(){
    this.items=[];
    this.last=0;
    this.selected=-1;
    this.reduced=matchMedia('(prefers-reduced-motion: reduce)');
    this.tick=this.tick.bind(this);
    this.raf=0;
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){cancelAnimationFrame(this.raf);this.raf=0;}
      else{this.last=0;this.start();}
    });
  }

  start(){
    if(!this.raf&&!document.hidden)this.raf=requestAnimationFrame(this.tick);
  }

  sync(tubes,selected){
    const old=this.items;
    this.items=[...document.querySelectorAll('.liquid-canvas')].map((canvas,i)=>{
      const c=canvas.getContext('2d');
      const el=canvas.parentElement,w=el.clientWidth,h=el.clientHeight;
      const dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=w*dpr;
      canvas.height=h*dpr;
      c?.setTransform(dpr,0,0,dpr,0,0);
      const unit=el.querySelector('.token')?.clientHeight||h*.22;
      return {
        canvas,c,w,h,unit,tokens:[...tubes[i]],
        wave:old[i]?.wave||surface(),
        bubbles:old[i]?.bubbles||[],
        spawn:old[i]?.spawn||0,
        phase:i*1.7,
        weights:null,
        reduced:this.reduced.matches
      };
    });
    if(selected!==this.selected){
      if(selected>=0)this.kick(selected,28);
      if(this.selected>=0)this.kick(this.selected,-16);
    }
    this.selected=selected;
    for(const item of this.items)this.draw(item,0);
    this.start();
  }

  kick(index,power=28){
    const item=this.items[index];
    if(!item)return;
    impulse(item.wave,.15,power);
    impulse(item.wave,.85,-power*.7);
  }

  tick(now){
    this.raf=0;
    if(document.hidden)return;
    if(this.last&&now-this.last<30){this.start();return;}
    const dt=Math.min(.04,(now-(this.last||now-16))/1000);
    this.last=now;
    for(const item of this.items){
      item.reduced=this.reduced.matches;
      if(!item.reduced){
        stepSurface(item.wave,dt/2);
        stepSurface(item.wave,dt/2);
        item.phase+=dt;
        item.spawn+=dt;
        if(item.tokens.length&&item.spawn>.65&&item.bubbles.length<14){
          item.spawn=0;
          item.bubbles.push({x:7+Math.random()*(item.w-14),y:item.h-5,v:8+Math.random()*14,r:1+Math.random()*1.5,phase:Math.random()*6});
        }
      }
      this.draw(item,dt);
    }
    if(!this.reduced.matches||this.items.some(i=>i.weights))this.start();
  }

  draw(item,dt){
    const {c,w,h,unit,tokens,wave}=item;
    if(!c)return;
    c.clearRect(0,0,w,h);
    const layers=segmentGeometry(tokens,unit,h,item.weights);

    for(const layer of layers){
      if(layer.bottom-layer.top<.2)continue;
      const palette=liquidPalette(layer.symbol);
      const points=segmentPath(c,item,layer);
      const gradient=c.createLinearGradient(0,layer.top,0,layer.bottom);
      gradient.addColorStop(0,palette.top);
      gradient.addColorStop(.18,palette.middle);
      gradient.addColorStop(.72,palette.middle);
      gradient.addColorStop(1,palette.bottom);
      c.fillStyle=gradient;
      c.save();
      c.shadowBlur=8;
      c.shadowColor=palette.glow;
      c.fill();
      c.restore();

      // A glassy highlight and a darker far edge give each portion real volume.
      c.save();
      c.clip();
      const volume=c.createLinearGradient(0,0,w,0);
      volume.addColorStop(0,'#ffffff4f');
      volume.addColorStop(.2,'#ffffff12');
      volume.addColorStop(.67,'#ffffff00');
      volume.addColorStop(1,'#00182742');
      c.fillStyle=volume;
      c.fillRect(0,layer.top-8,w,layer.bottom-layer.top+16);
      c.restore();

      c.strokeStyle='#ffffff20';
      c.lineWidth=.55;
      segmentPath(c,item,layer);
      c.stroke();
      // Elliptical meniscus makes each boundary read as a liquid surface.
      c.beginPath();
      c.ellipse(w/2,layer.top+1,w/2-1.5,2.6,0,0,Math.PI*2);
      c.fillStyle=palette.glow;
      c.fill();
      c.strokeStyle='#edffffa0';
      c.lineWidth=.7;
      c.stroke();

      // Only the actual liquid surface gets a bright meniscus; no grid is drawn.
      c.strokeStyle=layer.index===layers.length-1?'#efffffcc':'#eaffff66';
      c.lineWidth=layer.index===layers.length-1?1.15:.65;
      c.beginPath();
      c.moveTo(points[0].x,points[0].y);
      for(let j=1;j<points.length;j++)c.lineTo(points[j].x,points[j].y);
      c.stroke();
    }

    const liquidTop=layers.length?Math.min(...layers.map(layer=>layer.top)):h;
    const remaining=[];
    for(const b of item.bubbles){
      if(!item.reduced){b.v+=dt*3;b.y-=b.v*dt;b.phase+=dt*3;}
      if(b.y<liquidTop+4){
        if(!item.reduced)impulse(wave,b.x/w,-3);
        continue;
      }
      remaining.push(b);
      c.beginPath();
      c.arc(b.x+Math.sin(b.phase)*2,b.y,b.r,0,Math.PI*2);
      c.fillStyle='#ffffff18';
      c.fill();
      c.strokeStyle='#efffffaa';
      c.lineWidth=.7;
      c.stroke();
      c.beginPath();
      c.arc(b.x-.5+Math.sin(b.phase)*2,b.y-.6,.6,0,Math.PI*2);
      c.fillStyle='#ffffffc7';
      c.fill();
    }
    item.bubbles=remaining;
  }

  async pour(a,b,next,playSound){
    const source=document.querySelector(`[data-tube="${a}"]`),dest=document.querySelector(`[data-tube="${b}"]`);
    if(!source||!dest)return;
    this.kick(a,48);
    this.kick(b,30);
    playSound();
    if(this.reduced.matches)return;
    const from=this.items[a],to=this.items[b];
    const originalTo=to.tokens.length;
    to.tokens=[...next[b]];
    to.weights=to.tokens.map((_,i)=>i<originalTo?1:0);
    const transferred=from.tokens.length-next[a].length;
    const sr=source.getBoundingClientRect(),dr=dest.getBoundingClientRect();
    const dx=dr.left+dr.width/2-(sr.left+sr.width/2)-27,dy=dr.top-sr.top-57;
    const overlay=document.createElement('canvas');
    overlay.className='pour-stream';
    overlay.width=innerWidth*Math.min(devicePixelRatio||1,2);
    overlay.height=innerHeight*Math.min(devicePixelRatio||1,2);
    const c=overlay.getContext('2d'),dpr=Math.min(devicePixelRatio||1,2);
    c?.setTransform(dpr,0,0,dpr,0,0);
    document.body.append(overlay);
    source.classList.add('liquid-moving');
    let animation,frame,watchdog;

    try{
      animation=source.animate([
        {transform:'translateY(-19px) rotate(0deg)'},
        {transform:`translate(${dx}px,${dy}px) rotate(65deg)`,offset:.28},
        {transform:`translate(${dx}px,${dy}px) rotate(65deg)`,offset:.77},
        {transform:'translate(0,0) rotate(0deg)'}
      ],{duration:1000,easing:'ease-in-out',fill:'forwards'});
      await new Promise(resolve=>{
        const start=performance.now();
        watchdog=setTimeout(resolve,1400);
        const draw=now=>{
          const elapsed=now-start;
          from.tilt=-.9*Math.max(0,Math.min(1,elapsed/280,(1000-elapsed)/230));
          const p=Math.max(0,Math.min(1,(now-start-280)/480));
          from.weights=from.tokens.map((_,i)=>i<from.tokens.length-transferred?1:1-p);
          to.weights=to.tokens.map((_,i)=>i<originalTo?1:p);
          if(c){
            c.clearRect(0,0,innerWidth,innerHeight);
            if(p>0&&p<1){
              const lip=source.querySelector('.rim').getBoundingClientRect();
              const target=dest.querySelector('.rim').getBoundingClientRect();
              const x=lip.left+lip.width/2,y=lip.top+lip.height/2;
              const tx=target.left+target.width/2,ty=target.bottom+12;
              c.lineCap='round';
              c.strokeStyle=tint(next[b].at(-1));
              c.lineWidth=5+Math.sin(p*40);
              c.shadowBlur=8;
              c.shadowColor=c.strokeStyle;
              c.beginPath();
              c.moveTo(x,y);
              c.bezierCurveTo(x+20,y+5,tx,ty-30,tx,ty);
              c.stroke();
              c.shadowBlur=0;
              c.lineWidth=1.2;
              c.strokeStyle='#ffffffaa';
              c.stroke();
              if(Math.random()<.25){
                this.kick(b,8);
                to.bubbles.push({x:to.w/2,y:to.h-to.unit*to.tokens.length*p+14,v:17,r:1.7,phase:p*8});
              }
            }
          }
          if(now-start>=1000){resolve();return;}
          frame=requestAnimationFrame(draw);
        };
        frame=requestAnimationFrame(draw);
      });
    }finally{
      clearTimeout(watchdog);
      cancelAnimationFrame(frame);
      animation?.cancel();
      overlay.remove();
      source.classList.remove('liquid-moving');
      from.weights=null;
      from.tilt=0;
      to.weights=null;
      this.kick(b,35);
    }
  }
}

export function bubblingSound(context){
  const now=context.currentTime;
  for(let i=0;i<7;i++){
    const start=now+i*.09,osc=context.createOscillator(),gain=context.createGain();
    osc.type='sine';
    const f=220+Math.random()*340;
    osc.frequency.setValueAtTime(f,start);
    osc.frequency.exponentialRampToValueAtTime(f*1.8,start+.025);
    osc.frequency.exponentialRampToValueAtTime(f*.55,start+.12);
    gain.gain.setValueAtTime(0,start);
    gain.gain.linearRampToValueAtTime(.04,start+.01);
    gain.gain.exponentialRampToValueAtTime(.001,start+.15);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(start);
    osc.stop(start+.16);
    osc.onended=()=>{osc.disconnect();gain.disconnect();};
  }
}

// Shared art direction: stable footprints, architectural stages and regional scenery.
export const architecturalStage=level=>Math.min(4,Math.max(1,level>=5?4:level>=3?3:level||1));
export const buildingFamily=type=>({house:'home',lumber:'craft',factory:'craft',school:'civic',granary:'barn',farm:'barn'}[type]);
// Legacy saves predate start timestamps. Their original durations remain 6/8s.
export function constructionState(b,seconds){
 const upgrading=b.level>1;
 const start=Number.isFinite(b.started)?Math.min(b.started,b.ready):b.ready-(upgrading?8:6);
 const progress=b.ready>seconds?Math.max(0,Math.min(1,(seconds-start)/Math.max(.001,b.ready-start))):1;
 return {progress,upgrading,stage:progress<.25?'foundation':progress<.55?'frame':progress<1?'assembly':'complete'};
}
export function regionAt(x,y){
 if(y<2)return 'coast';
 if(x>=22&&y>=16)return 'highlands';
 if(x>=16)return 'woodland';
 if(y>=19)return 'meadows';
 return 'valley';
}
export const REGIONS=[
 {id:'valley',name:'Долина',x:5,y:5,text:'Житло, ремесла та центральна площа'},
 {id:'coast',name:'Узбережжя',x:6,y:0,text:'Пристані, рибальство та морські експедиції'},
 {id:'woodland',name:'Заріччя',x:18,y:6,text:'Ліси й нові квартали за мостом'},
 {id:'meadows',name:'Луки',x:8,y:23,text:'Вільні землі для господарства'},
 {id:'highlands',name:'Височини',x:26,y:24,text:'Кам’янистий ландшафт і нові родовища'}
];
export function landscapeSeed(x,y){let n=(Math.imul(x+101,73856093)^Math.imul(y+137,19349663));n=Math.imul(n^(n>>>16),0x7feb352d);n=Math.imul(n^(n>>>15),0x846ca68b);return ((n^(n>>>16))>>>0)/4294967296;}
export function forestCover(x,y){
 const region=regionAt(x,y);
 if(!(region==='woodland'||region==='highlands'||x<2||y>8||x>7))return false;
 const grove=.5+.5*Math.sin(x*.75+Math.sin(y*.55))*Math.cos(y*.62);
 return landscapeSeed(x,y)<(region==='woodland'?.48+grove*.4:.12+grove*.5);
}
// Relief rises only in the new, previously inaccessible region. Old saves retain geometry.
export function elevation(x,y){
 const ramp=Math.max(0,Math.min(1,(x-20)/6))*Math.max(0,Math.min(1,(y-14)/6));
 return ramp*(.65+.27*Math.sin(x*.3)*Math.cos(y*.24));
}

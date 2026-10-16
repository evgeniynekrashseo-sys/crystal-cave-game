import {footprintSize} from './settlement-footprints.js?v=44';
// Authored crop rows run along world Y (up-right/down-left on screen).
export const FIELD_ROWS=12;
export function fieldWorkPoint(b,progress){
 const [w,h]=footprintSize(b),q=Math.max(0,Math.min(.999999,progress))*w*FIELD_ROWS,row=Math.floor(q),t=q-row;
 const x=b.x+Math.floor(row/FIELD_ROWS)+.12+(row%FIELD_ROWS)*.067;
 const reverse=row%2===1,along=Math.min(1,t/.88),y=b.y+.12+(reverse?1-along:along)*(h-.24);
 const nextX=b.x+Math.floor((row+1)/FIELD_ROWS)+.12+((row+1)%FIELD_ROWS)*.067;
 const turn=row<w*FIELD_ROWS-1&&t>.88?(t-.88)/.12:0;
 return {x:x+(nextX-x)*turn,y,heading:turn?{x:1,y:0}:{x:0,y:reverse?-1:1}};
}
export function fieldCellProgress(b,dx,progress){const [w]=footprintSize(b);return Math.max(0,Math.min(1,progress*w-dx));}


import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('../dist/city-art-sandbox.html',import.meta.url),'utf8');
const source=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];

test('city sandbox module remains syntactically valid',()=>{
 assert(source,'module script must exist');
 const withoutImports=source.replace(/^import .*;\s*$/gm,'');
 assert.doesNotThrow(()=>new vm.Script(withoutImports));
});

test('static city sandbox never repaints in an idle animation loop',()=>{
 assert.equal((source.match(/requestAnimationFrame\s*\(/g)||[]).length,1);
 assert.match(source,/function invalidate\(\)\{if\(framePending\)return;/);
 assert.doesNotMatch(source,/requestAnimationFrame\(draw\)/);
 assert.match(source,/\}\s*invalidate\(\);\s*document\.querySelectorAll/);
});

test('camera gestures, canvas resize, and atlas loads invalidate the scene',()=>{
 assert.match(source,/im\.addEventListener\('load',invalidate\)/);
 assert.match(source,/function size\(\)[\s\S]*?frameScene\(\);invalidate\(\)/);
 assert.match(source,/canvas\.addEventListener\('pointermove',[\s\S]*?start=null\}invalidate\(\)/);
 assert.match(source,/touches\.delete\(e\.pointerId\);start=null;invalidate\(\)/);
 assert.match(source,/canvas\.addEventListener\('wheel',[\s\S]*?invalidate\(\)/);
 assert.match(source,/document\.querySelector\('#upgrade'\)\.onclick=[\s\S]*?invalidate\(\)/);
});

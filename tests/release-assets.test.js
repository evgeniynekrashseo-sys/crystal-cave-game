import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';

test('offline release contains every cached file and the complete versioned module graph',()=>{
 const root=new URL('../dist/',import.meta.url);
 const sw=readFileSync(new URL('sw.js',root),'utf8');
 const version=sw.match(/chemlab-release-(\d+)-/)[1];
 const assets=vm.runInNewContext(sw.match(/const ASSETS=(\[[\s\S]*?\]);/)[1]);
 for(const asset of assets){
  const file=asset==='./'?'index.html':asset.split('?')[0];
  assert(existsSync(new URL(file,root)),`Missing offline asset: ${asset}`);
 }
 const scripts=assets.filter(a=>a.endsWith(`.js?v=${version}`));
 for(const file of scripts){
  const text=readFileSync(new URL(file.split('?')[0],root),'utf8');
  for(const [,dependency]of text.matchAll(/from ['"]\.\/([^'"]+)['"]/g)){
   assert(dependency.endsWith(`?v=${version}`),`${file} has stale dependency ${dependency}`);
   assert(assets.includes(dependency),`${dependency} is not available offline`);
  }
 }
 const html=readFileSync(new URL('index.html',root),'utf8');
 assert(html.includes(`src="app.js?v=${version}"`));
 assert(html.includes(`href="settlement.css?v=${version}"`));
 for(const file of ['city-hud.js','settlement-ground-v16.png','resource-wood-v16.png','resource-food-v16.png','resource-coin-v16.png']){
  assert(assets.includes(file.endsWith('.js')?`${file}?v=${version}`:file));
 }
});

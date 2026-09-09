import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const fail=(m)=>{console.error(`[ChemLab preflight] FAIL: ${m}`);process.exitCode=1};
const pass=(m)=>console.log(`[ChemLab preflight] PASS: ${m}`);
const pkg=JSON.parse(read('package.json'));
const main=read('src/main.ts'),certified=read('src/certified-puzzles.ts'),diagnostics=read('src/diagnostics.ts'),bootstrap=read('src/v92-bootstrap.ts'),art=read('src/v111-lab-art.ts'),artCss=read('src/v111-lab-art.css'),postbuild=read('scripts/postbuild-smoke.mjs');
if(pkg.version!=='111.0.0')fail(`package version must be 111.0.0, got ${pkg.version}`);else pass('release version 111.0.0');
if(!diagnostics.includes("build:'V111'"))fail('diagnostics must be V111');else pass('diagnostics V111');
for(const token of ["await import('./v111-lab-art')","ChemLab V111"]){if(!bootstrap.includes(token))fail(`bootstrap missing ${token}`);else pass(`bootstrap contains ${token}`)}
for(const token of ['v111-art','<svg','reactor','dataset.chemlabVisual=\'v111\'']){if(!art.includes(token))fail(`lab art missing ${token}`);else pass(`lab art contains ${token}`)}
for(const token of ['.v111-art','.game-canvas','min-height:520px']){if(!artCss.includes(token))fail(`lab art css missing ${token}`);else pass(`lab art css contains ${token}`)}
if(!postbuild.includes("bundleText.includes('V111')"))fail('postbuild must verify V111');else pass('postbuild verifies V111');
const keys=[...main.matchAll(/chemlab_v\d+/g)].map(m=>m[0]);if(!keys.length||keys.some(k=>k!=='chemlab_v50'))fail('core save key drift');else pass('core save remains chemlab_v50');
for(const n of [3,4,5,6])if(!certified.includes(`${n}:[`))fail(`certified bank ${n} missing`);else pass(`certified bank ${n} present`);
for(const inv of ["import { createCertifiedPuzzle } from './certified-puzzles'",'solution=puzzle.solution','retrySame.onclick=()=>start(P.level,seed,true)',"localStorage.setItem('chemlab_v50',JSON.stringify(P))"])if(!main.includes(inv))fail(`core invariant missing ${inv}`);else pass('core invariant retained');
const forbidden=[/\bgrams?\b.{0,40}\b(?:mix|combine|heat)\b/i,/\b(?:°c|celsius)\b.{0,50}\b(?:mix|combine|react)\b/i];if(forbidden.some(r=>r.test([main,certified,art,bootstrap].join('\n'))))fail('operational chemistry instruction detected');else pass('chemistry remains non-operational game abstraction');
if(process.exitCode)process.exit(process.exitCode);console.log('[ChemLab preflight] Release integrity gate passed.');

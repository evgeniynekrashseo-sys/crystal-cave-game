import fs from 'node:fs';

const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const fail=(message)=>{console.error(`\n[ChemLab preflight] FAIL: ${message}`);process.exitCode=1};
const pass=(message)=>console.log(`[ChemLab preflight] PASS: ${message}`);

const pkg=JSON.parse(read('package.json'));
const main=read('src/main.ts');
const certified=read('src/certified-puzzles.ts');
const diagnostics=read('src/diagnostics.ts');
const cosmeticOwnership=read('src/v103-cosmetic-ownership.ts');
const cosmeticCelebration=read('src/v104-unlock-celebration.ts');
const cosmeticLadder=read('src/v98-cosmetic-preview.ts');
const postbuild=read('scripts/postbuild-smoke.mjs');

const build=`V${String(pkg.version).split('.')[0]}`;

if(pkg.version!=='106.0.0') fail(`package version must be 106.0.0, got ${pkg.version}`); else pass(`release version ${pkg.version}`);
if(!diagnostics.includes(`build:'${build}'`)) fail(`diagnostics build must match ${build}`); else pass(`diagnostics synced to ${build}`);
if(!pkg.scripts?.build?.includes('npm run postbuild')) fail('build must execute production artifact validation'); else pass('build executes production artifact validation');
if(!postbuild.includes("bundleText.includes('V106')")) fail('postbuild validator must verify V106 marker'); else pass('postbuild validator checks compiled release marker');
if(!postbuild.includes("from 'node:url'")) fail('postbuild validator must import fileURLToPath from node:url'); else pass('postbuild path conversion uses node:url');

const saveKeyMatches=[...main.matchAll(/chemlab_v\d+/g)].map(m=>m[0]);
if(!saveKeyMatches.length||saveKeyMatches.some(k=>k!=='chemlab_v50')) fail(`core save key drift detected: ${[...new Set(saveKeyMatches)].join(', ')||'missing'}`); else pass('core save schema remains chemlab_v50');
if(cosmeticOwnership.includes("localStorage.setItem(CORE_KEY")||cosmeticOwnership.includes("localStorage.setItem('chemlab_v50'")||cosmeticOwnership.includes('localStorage.setItem("chemlab_v50"')) fail('cosmetic ownership must not write core save'); else pass('cosmetic ownership is isolated from core save');
if(cosmeticCelebration.includes("localStorage.setItem(CORE_KEY")||cosmeticCelebration.includes("localStorage.setItem('chemlab_v50'")||cosmeticCelebration.includes('localStorage.setItem("chemlab_v50"')) fail('unlock celebration must not write core save'); else pass('unlock celebration is isolated from core save');
if(!cosmeticCelebration.includes("chemlab_ui_v104_unlock_ack")) fail('unlock celebration acknowledgement key missing'); else pass('unlock celebration uses isolated acknowledgement state');
if(!cosmeticLadder.includes('Number(save.nug??0)')) fail('cosmetic ladder must use mastery nug as unlock source of truth'); else pass('cosmetic unlocks are backed by mastery progress');

for(const n of [3,4,5,6]){
  if(!certified.includes(`${n}:[`)) fail(`certified puzzle bank missing difficulty ${n}`); else pass(`certified bank ${n} present`);
}
const templateCount=(certified.match(/\{state:\[/g)||[]).length;
const solutionCount=(certified.match(/solution:\[\[/g)||[]).length;
if(templateCount<24||solutionCount<templateCount) fail(`certified template integrity suspicious: templates=${templateCount}, solutions=${solutionCount}`); else pass(`${templateCount} certified templates expose solution paths`);

const requiredCore=[
  "import { createCertifiedPuzzle } from './certified-puzzles'",
  'solution=puzzle.solution',
  'tubes=generate(P.level,s,repeatExact)',
  'retrySame.onclick=()=>start(P.level,seed,true)',
  "localStorage.setItem('chemlab_v50',JSON.stringify(P))",
];
for(const invariant of requiredCore){
  if(!main.includes(invariant)) fail(`core invariant missing: ${invariant}`); else pass(`core invariant retained: ${invariant.slice(0,64)}`);
}

const forbiddenOperationalPatterns=[/\bgrams?\b.{0,40}\b(?:mix|combine|heat)\b/i,/\b(?:mix|combine|heat)\b.{0,40}\bgrams?\b/i,/\b(?:°c|celsius)\b.{0,50}\b(?:mix|combine|react)\b/i];
const sourceBundle=[main,certified,cosmeticOwnership,cosmeticCelebration,cosmeticLadder].join('\n');
if(forbiddenOperationalPatterns.some(r=>r.test(sourceBundle))) fail('potentially operational real-world chemistry instruction detected in release sources'); else pass('no operational chemistry quantities/instructions detected in release sources');

if(process.exitCode){console.error('\n[ChemLab preflight] Release blocked.');process.exit(process.exitCode)}
console.log('\n[ChemLab preflight] Release integrity gate passed.');

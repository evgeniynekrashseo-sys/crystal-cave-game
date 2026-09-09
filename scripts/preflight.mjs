import fs from 'node:fs';

const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const fail=(message)=>{console.error(`\n[ChemLab preflight] FAIL: ${message}`);process.exitCode=1};
const pass=(message)=>console.log(`[ChemLab preflight] PASS: ${message}`);

const pkg=JSON.parse(read('package.json'));
const main=read('src/main.ts');
const certified=read('src/certified-puzzles.ts');
const diagnostics=read('src/diagnostics.ts');
const bootstrap=read('src/v92-bootstrap.ts');
const visualScene=read('src/v110-scene.ts');
const visualCss=read('src/v110-visual-rebuild.css');
const cosmeticOwnership=read('src/v103-cosmetic-ownership.ts');
const cosmeticCelebration=read('src/v104-unlock-celebration.ts');
const cosmeticLadder=read('src/v98-cosmetic-preview.ts');
const cosmeticOwnershipCss=read('src/v103-cosmetic-ownership.css');
const postbuild=read('scripts/postbuild-smoke.mjs');

const build=`V${String(pkg.version).split('.')[0]}`;

if(pkg.version!=='110.0.0') fail(`package version must be 110.0.0, got ${pkg.version}`); else pass(`release version ${pkg.version}`);
if(!diagnostics.includes(`build:'${build}'`)) fail(`diagnostics build must match ${build}`); else pass(`diagnostics synced to ${build}`);
if(!pkg.scripts?.build?.includes('npm run postbuild')) fail('build must execute production artifact validation'); else pass('build executes production artifact validation');
if(!postbuild.includes("bundleText.includes('V110')")) fail('postbuild validator must verify V110 marker'); else pass('postbuild validator checks compiled release marker');
if(!postbuild.includes("from 'node:url'")) fail('postbuild validator must import fileURLToPath from node:url'); else pass('postbuild path conversion uses node:url');

const requiredRuntimeLayers=[
  "await import('./v99-economy-readiness')",
  "await import('./v101-mobile-focus')",
  "await import('./v103-cosmetic-ownership')",
  "await import('./v104-unlock-celebration')",
  "await import('./v110-scene')",
];
for(const layer of requiredRuntimeLayers){if(!bootstrap.includes(layer)) fail(`production runtime layer missing: ${layer}`); else pass(`runtime layer wired: ${layer}`)}
if(!bootstrap.includes('ChemLab V110')) fail('settings runtime marker must expose ChemLab V110'); else pass('settings runtime marker exposes V110');
if(!visualScene.includes("import './v110-visual-rebuild.css'")) fail('V110 scene must load the visual rebuild stylesheet'); else pass('V110 visual stylesheet wired');
if(!visualScene.includes("dataset.chemlabVisual='v110'")) fail('V110 scene runtime marker missing'); else pass('V110 scene runtime marker present');
for(const token of ['.board-shell:before','.v110-bench','.v110-lamp','@media(max-width:760px)']){if(!visualCss.includes(token)) fail(`V110 visual system missing ${token}`); else pass(`V110 visual system contains ${token}`)}

if(bootstrap.includes("await import('./v102-cosmetic-equip-preview')")) fail('V102 interaction runtime must not boot beside V103 ownership'); else pass('cosmetic interaction has a single runtime owner');
if(cosmeticOwnership.includes("import('./v104-unlock-celebration')")) fail('V103 must not orchestrate V104'); else pass('runtime orchestration is centralized in bootstrap');
if(cosmeticOwnership.includes('ChemLab V104')) fail('stale release marker detected in cosmetic ownership layer'); else pass('cosmetic ownership has no stale release marker');
if(!cosmeticOwnership.includes("card.classList.toggle('is-locked',!owned)")) fail('cosmetic cards must expose explicit locked state'); else pass('cosmetic cards expose locked state');
if(!cosmeticOwnershipCss.includes("content:'LOCKED'")) fail('locked cosmetic state must have visible treatment'); else pass('locked cosmetic state has visible treatment');

const saveKeyMatches=[...main.matchAll(/chemlab_v\d+/g)].map(m=>m[0]);
if(!saveKeyMatches.length||saveKeyMatches.some(k=>k!=='chemlab_v50')) fail(`core save key drift detected: ${[...new Set(saveKeyMatches)].join(', ')||'missing'}`); else pass('core save schema remains chemlab_v50');
if(cosmeticOwnership.includes("localStorage.setItem(CORE_KEY")||cosmeticOwnership.includes("localStorage.setItem('chemlab_v50'")||cosmeticOwnership.includes('localStorage.setItem("chemlab_v50"')) fail('cosmetic ownership must not write core save'); else pass('cosmetic ownership is isolated from core save');
if(cosmeticCelebration.includes("localStorage.setItem(CORE_KEY")||cosmeticCelebration.includes("localStorage.setItem('chemlab_v50'")||cosmeticCelebration.includes('localStorage.setItem("chemlab_v50"')) fail('unlock celebration must not write core save'); else pass('unlock celebration is isolated from core save');
if(!cosmeticCelebration.includes('chemlab_ui_v104_unlock_ack')) fail('unlock celebration acknowledgement key missing'); else pass('unlock celebration uses isolated acknowledgement state');
if(!cosmeticLadder.includes('Number(save.nug??0)')) fail('cosmetic ladder must use mastery nug as unlock source of truth'); else pass('cosmetic unlocks are backed by mastery progress');

for(const n of [3,4,5,6]){if(!certified.includes(`${n}:[`)) fail(`certified puzzle bank missing difficulty ${n}`); else pass(`certified bank ${n} present`)}
const templateCount=(certified.match(/\{state:\[/g)||[]).length;
const solutionCount=(certified.match(/solution:\[\[/g)||[]).length;
if(templateCount<24||solutionCount<templateCount) fail(`certified template integrity suspicious: templates=${templateCount}, solutions=${solutionCount}`); else pass(`${templateCount} certified templates expose solution paths`);

const requiredCore=["import { createCertifiedPuzzle } from './certified-puzzles'",'solution=puzzle.solution','tubes=generate(P.level,s,repeatExact)','retrySame.onclick=()=>start(P.level,seed,true)',"localStorage.setItem('chemlab_v50',JSON.stringify(P))"];
for(const invariant of requiredCore){if(!main.includes(invariant)) fail(`core invariant missing: ${invariant}`); else pass(`core invariant retained: ${invariant.slice(0,64)}`)}

const forbiddenOperationalPatterns=[/\bgrams?\b.{0,40}\b(?:mix|combine|heat)\b/i,/\b(?:mix|combine|heat)\b.{0,40}\bgrams?\b/i,/\b(?:°c|celsius)\b.{0,50}\b(?:mix|combine|react)\b/i];
const sourceBundle=[main,certified,cosmeticOwnership,cosmeticCelebration,cosmeticLadder,bootstrap,visualScene].join('\n');
if(forbiddenOperationalPatterns.some(r=>r.test(sourceBundle))) fail('potentially operational real-world chemistry instruction detected in release sources'); else pass('no operational chemistry quantities/instructions detected in release sources');

if(process.exitCode){console.error('\n[ChemLab preflight] Release blocked.');process.exit(process.exitCode)}
console.log('\n[ChemLab preflight] Release integrity gate passed.');

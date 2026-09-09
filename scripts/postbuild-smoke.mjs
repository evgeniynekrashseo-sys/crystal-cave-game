import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=new URL('../dist/',import.meta.url);
const fail=(message)=>{console.error(`\n[ChemLab postbuild] FAIL: ${message}`);process.exitCode=1};
const pass=(message)=>console.log(`[ChemLab postbuild] PASS: ${message}`);

if(!fs.existsSync(root)){fail('dist directory missing');process.exit(1)}
const indexUrl=new URL('index.html',root);
if(!fs.existsSync(indexUrl)){fail('dist/index.html missing');process.exit(1)}
const html=fs.readFileSync(indexUrl,'utf8');
const refs=[...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m=>m[1]).filter(v=>!v.startsWith('data:')&&!v.startsWith('http')&&!v.startsWith('#'));
if(!refs.length) fail('no production asset references found'); else pass(`${refs.length} production asset references found`);
for(const ref of refs){if(ref.startsWith('/')){fail(`absolute asset path is unsafe for repository Pages: ${ref}`);continue}const clean=ref.replace(/^\.\//,'').split(/[?#]/)[0];const file=new URL(clean,root);if(!fs.existsSync(file)) fail(`referenced production asset missing: ${ref}`)}
if(!process.exitCode) pass('all referenced production assets exist');

const files=[];const walk=(dir)=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);entry.isDirectory()?walk(p):files.push(p)}};walk(fileURLToPath(root));
const js=files.filter(f=>f.endsWith('.js')),css=files.filter(f=>f.endsWith('.css'));
if(!js.length) fail('production JavaScript bundle missing'); else pass(`${js.length} JavaScript bundle(s) present`);
if(!css.length) fail('production CSS bundle missing'); else pass(`${css.length} CSS bundle(s) present`);
const bundleText=js.map(f=>fs.readFileSync(f,'utf8')).join('\n');
const cssText=css.map(f=>fs.readFileSync(f,'utf8')).join('\n');
if(!bundleText.includes('V110')) fail('V110 diagnostics marker missing from production JavaScript'); else pass('V110 diagnostics marker present in production bundle');
if(bundleText.includes('ION CHROME')&&bundleText.includes('VIOLET PHASE')&&bundleText.includes('AURUM CORE')) pass('cosmetic progression layers are compiled into production'); else fail('cosmetic progression runtime layers missing from compiled production bundle');
if(bundleText.includes('is-locked')&&cssText.includes('LOCKED')) pass('compiled cosmetic ownership states are explicit'); else fail('compiled locked cosmetic treatment missing');
if(bundleText.includes('chemlabVisual')&&cssText.includes('v110-bench')&&cssText.includes('v110-lamp')) pass('V110 cinematic laboratory scene compiled into production'); else fail('V110 cinematic scene missing from compiled production');
if(bundleText.includes('localStorage.setItem("chemlab_v50"')||bundleText.includes("localStorage.setItem('chemlab_v50'")) pass('core save writer present in compiled gameplay bundle'); else fail('core save persistence missing from compiled gameplay bundle');

if(process.exitCode){console.error('\n[ChemLab postbuild] Production artifact validation failed.');process.exit(process.exitCode)}
console.log('\n[ChemLab postbuild] Production artifact validation passed.');

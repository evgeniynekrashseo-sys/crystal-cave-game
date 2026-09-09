import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=new URL('../dist/',import.meta.url);const fail=(m)=>{console.error(`[ChemLab postbuild] FAIL: ${m}`);process.exitCode=1};const pass=(m)=>console.log(`[ChemLab postbuild] PASS: ${m}`);
if(!fs.existsSync(root)){fail('dist missing');process.exit(1)}const indexUrl=new URL('index.html',root);if(!fs.existsSync(indexUrl)){fail('index missing');process.exit(1)}const html=fs.readFileSync(indexUrl,'utf8');
const refs=[...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m=>m[1]).filter(v=>!v.startsWith('data:')&&!v.startsWith('http')&&!v.startsWith('#'));for(const ref of refs){if(ref.startsWith('/')){fail(`unsafe absolute asset ${ref}`);continue}const file=new URL(ref.replace(/^\.\//,'').split(/[?#]/)[0],root);if(!fs.existsSync(file))fail(`missing asset ${ref}`)}
const files=[];const walk=(d)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?walk(p):files.push(p)}};walk(fileURLToPath(root));const js=files.filter(f=>f.endsWith('.js')),css=files.filter(f=>f.endsWith('.css'));const bundleText=js.map(f=>fs.readFileSync(f,'utf8')).join('\n'),cssText=css.map(f=>fs.readFileSync(f,'utf8')).join('\n');
if(!bundleText.includes('V111'))fail('V111 marker missing');else pass('V111 marker compiled');
if(bundleText.includes('v111-art')&&bundleText.includes('<svg')&&bundleText.includes('chemlabVisual'))pass('illustrated laboratory scene compiled');else fail('illustrated scene missing');
if(cssText.includes('.v111-art')&&cssText.includes('min-height:520px'))pass('dominant V111 scene styling compiled');else fail('V111 scene styling missing');
if(bundleText.includes('localStorage.setItem("chemlab_v50"')||bundleText.includes("localStorage.setItem('chemlab_v50'"))pass('core save writer present');else fail('core save writer missing');
if(process.exitCode)process.exit(process.exitCode);console.log('[ChemLab postbuild] Production artifact validation passed.');

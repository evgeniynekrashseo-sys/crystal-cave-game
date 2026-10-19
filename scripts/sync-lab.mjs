import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import './build-lab.mjs';
const file=new URL('../capacitor.config.json',import.meta.url),original=await readFile(file,'utf8');
const platform=process.argv[2];if(!['ios','android'].includes(platform))throw Error('Choose ios or android');
try{await writeFile(file,JSON.stringify({...JSON.parse(original),webDir:'dist/lab'},null,2));const r=spawnSync('npx',['--no-install','cap','sync',platform],{cwd:new URL('..',import.meta.url),stdio:'inherit'});if(r.error)throw r.error;process.exitCode=r.status??1;}finally{await writeFile(file,original);}

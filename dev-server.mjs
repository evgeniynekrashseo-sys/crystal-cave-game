import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';

const args=process.argv.slice(2);
const value=(name,fallback)=>{
  const index=args.indexOf(name);
  return index>=0&&args[index+1]?args[index+1]:fallback;
};
const host=value('--host','0.0.0.0');
const port=Number(value('--port',process.env.PORT||4173));
const root=resolve('dist');
const mime={
  '.html':'text/html; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.webmanifest':'application/manifest+json; charset=utf-8',
  '.svg':'image/svg+xml',
  '.png':'image/png',
  '.webp':'image/webp'
};

createServer(async(request,response)=>{
  try{
    const url=new URL(request.url||'/',`http://${request.headers.host||'localhost'}`);
    if(url.pathname==='/__mobile'){response.writeHead(200,{'content-type':'text/html'}).end('<!doctype html><style>body{margin:0;background:#e0e8e6;display:grid;place-items:center;min-height:100vh}iframe{width:390px;height:844px;border:0;box-shadow:0 0 24px #5676}</style><iframe title="Mobile ChemLab" src="/?'+url.searchParams.toString()+'"></iframe>');return;}
    const pathname=decodeURIComponent(url.pathname)==='/'?'/index.html':decodeURIComponent(url.pathname);
    let filename=resolve(root,`.${pathname}`);
    if(filename!==root&&!filename.startsWith(root+sep)){
      response.writeHead(403).end('Forbidden');
      return;
    }
    if((await stat(filename)).isDirectory())filename=resolve(filename,'index.html');
    let body=await readFile(filename);
    const qaLevel=Math.max(0,Math.min(99,Number(url.searchParams.get('qaLevel'))||0));
    if(qaLevel&&filename.endsWith('index.html')){
      const discovered=['Na','Cl','Fe','O','C','H','Au','Li','He','Be'];
      const qaState=JSON.stringify({level:qaLevel,gold:8046,nug:12,xp:500,score:4200,discovered,streak:3,bestStreak:8,recentPuzzles:[]});
      const bootstrap=`<script>localStorage.setItem('chemlab_v50',${JSON.stringify(qaState)});</script>`;
      body=Buffer.from(body.toString().replace('<script type="module" src="app.js"></script>',bootstrap+'<script type="module" src="app.js"></script>'));
    }
    response.writeHead(200,{'content-type':mime[extname(filename)]||'application/octet-stream','cache-control':'no-store'});
    response.end(body);
  }catch{
    response.writeHead(404,{'content-type':'text/plain; charset=utf-8'}).end('Not found');
  }
}).listen(port,host,()=>console.log(`ChemLab preview ready on ${host}:${port}`));

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const port = Number(process.env.PORT || 18762);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
http.createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end();}
  let route;try{route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
  const target=path.resolve(root,'.'+route);
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  try{
    let stat=await fs.stat(target); let file=target;
    if(stat.isDirectory()){
      if(!route.endsWith('/')){res.writeHead(308,{Location:route+'/'});return res.end();}
      file=path.join(target,'index.html');
    }
    const data=await fs.readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});
    res.end(req.method==='HEAD'?undefined:data);
  }catch{
    const data=await fs.readFile(path.join(root,'404.html')).catch(()=>Buffer.from('Page introuvable'));
    res.writeHead(404,{'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex'});res.end(req.method==='HEAD'?undefined:data);
  }
}).listen(port,'127.0.0.1',()=>console.log(`100 Pilot local preview: http://127.0.0.1:${port}/`));

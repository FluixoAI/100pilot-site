import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {workflows} from './workflow-catalog.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const {origin,pages}=JSON.parse(await fs.readFile(path.join(root,'page-manifest.json'),'utf8'));
const config=JSON.parse(await fs.readFile(path.join(root,'site.config.json'),'utf8'));
const indexable=Boolean(config.indexable&&config.publicOrigin);
// The check reads the freshly built dist through serve.mjs on a free local port, never the live site.
// Canonicals, og:url and og:image are still compared with the public origin written in the pages.
const server=spawn(process.execPath,[path.join(root,'serve.mjs')],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','inherit']});
const base=await new Promise((resolve,reject)=>{
 let out='';const timer=setTimeout(()=>reject(new Error('serve.mjs did not start')),10000);
 server.stdout.on('data',chunk=>{out+=chunk;const m=out.match(/http:\/\/127\.0\.0\.1:\d+/);if(m){clearTimeout(timer);resolve(m[0]);}});
 server.on('exit',code=>{clearTimeout(timer);reject(new Error('serve.mjs exited with code '+code));});
});
try{
const failures=[];const links=new Set();const titles=new Set();const descriptions=new Set();let schemas=0;
const result=[];const pageHtml=new Map();const lengths=[];
const meta=(html,attr,name)=>html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`))?.[1];
for(const page of pages){
 const response=await fetch(base+page.url);const html=await response.text();
 pageHtml.set(page.id,html);
 if(response.status!==200)failures.push(`${page.url}: HTTP ${response.status}`);
 const title=html.match(/<title>([\s\S]*?)<\/title>/)?.[1];const desc=meta(html,'name','description');
 if(!title||titles.has(title))failures.push(`${page.url}: missing/duplicate title`);titles.add(title);
 if(!desc||descriptions.has(desc))failures.push(`${page.url}: missing/duplicate description`);descriptions.add(desc);
 const plain=(desc||'').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
 const length=[...plain].length;lengths.push(length);if(length<120||length>155)failures.push(`${page.url}: description is ${length} characters (expected 120-155)`);
 if(meta(html,'property','og:description')!==desc)failures.push(`${page.url}: og:description differs from description`);
 if((html.match(/<h1(?:\s[^>]*)?>/g)||[]).length!==1)failures.push(`${page.url}: expected one h1`);
 if(!html.includes(`rel="canonical" href="${origin+page.url}"`))failures.push(`${page.url}: canonical mismatch`);
 if(indexable){if(!html.includes('<meta name="robots" content="index, follow">'))failures.push(`${page.url}: robots meta should be index, follow`);}
 else if(!html.includes('content="noindex, nofollow"')||!response.headers.get('x-robots-tag')?.includes('noindex'))failures.push(`${page.url}: local indexing guard missing`);
 const og={image:meta(html,'property','og:image'),width:meta(html,'property','og:image:width'),height:meta(html,'property','og:image:height'),alt:meta(html,'property','og:image:alt'),locale:meta(html,'property','og:locale'),site:meta(html,'property','og:site_name'),url:meta(html,'property','og:url'),card:meta(html,'name','twitter:card')};
 if(og.image!==origin+'/assets/og-image.png'||og.width!=='1200'||og.height!=='630'||!og.alt||og.locale!=='fr_FR'||!og.site||og.url!==origin+page.url||og.card!=='summary_large_image')failures.push(`${page.url}: sharing tags incomplete ${JSON.stringify(og)}`);
 if(!html.includes('href="/mentions-legales/"')||!html.includes('href="/confidentialite/"'))failures.push(`${page.url}: legal links missing from footer`);
 // The legal pages must name the publisher company; every other page keeps the full exclusion list.
 const excluded=page.family==='Légal'?/fluixo|\bpvd\b|\bfava\b/i:/fluixo|\banfu\b|\bpvd\b|\bfava\b/i;
 if(excluded.test(html))failures.push(`${page.url}: excluded brand`);
 if(/TODO|lorem ipsum|placeholder content/i.test(html))failures.push(`${page.url}: draft placeholder`);
 for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
   try{const graph=JSON.parse(match[1]);schemas+=graph.length;if(page.url!=='/'&&!graph.some(g=>g['@type']==='BreadcrumbList'))failures.push(`${page.url}: breadcrumb missing`);}catch{failures.push(`${page.url}: invalid JSON-LD`);}
 }
 for(const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)){const u=match[1];if(u.startsWith('/')&&!u.startsWith('//'))links.add(new URL(u,origin).pathname);}
 const body=html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';const words=body.replace(/<[^>]+>/g,' ').trim().split(/\s+/).length;
 result.push({url:page.url,status:response.status,mainWords:words,descriptionLength:length});
}
for(const url of links){const response=await fetch(base+url,{method:'HEAD'});if(response.status!==200)failures.push(`Broken link/asset ${url}: ${response.status}`);}
const image=await fetch(base+'/assets/og-image.png');const png=Buffer.from(await image.arrayBuffer());
const imageSize=png.length>24&&png.toString('ascii',12,16)==='IHDR'?[png.readUInt32BE(16),png.readUInt32BE(20)]:null;
if(image.status!==200||image.headers.get('content-type')!=='image/png'||imageSize?.join('x')!=='1200x630')failures.push(`Sharing image: HTTP ${image.status}, ${image.headers.get('content-type')}, ${imageSize?.join('x')}`);
const bad=await fetch(base+'/page-qui-nexiste-pas/');if(bad.status!==404)failures.push('Unknown route should return HTTP 404');
const noSlash=await fetch(base+'/services',{redirect:'manual'});if(noSlash.status!==308||noSlash.headers.get('location')!=='/services/')failures.push('Trailing-slash redirect incorrect');
const robots=await(await fetch(base+'/robots.txt')).text();
if(indexable?!(robots.includes('Allow: /')&&robots.includes(`Sitemap: ${origin}/sitemap.xml`)):!robots.includes('Disallow: /'))failures.push(indexable?'robots.txt should allow crawling and list the sitemap':'Local robots policy');
const sitemap=await(await fetch(base+'/sitemap.xml')).text();if((sitemap.match(/<loc>/g)||[]).length!==pages.length)failures.push('Sitemap count differs from pages');
for(const page of pages)if(!sitemap.includes(`<loc>${origin+page.url}</loc>`))failures.push(`Sitemap misses ${page.url}`);
if((sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)||[]).length!==pages.length)failures.push('Sitemap lastmod missing');
const obsoleteRoutes=['/realisations/pvd-automatisation-odoo/','/etudes/fava-sport-automatisation/'];
for(const url of obsoleteRoutes){if((await fetch(base+url)).status!==404)failures.push(`Named route still exposed: ${url}`);}
if(/pvd|fava/i.test(sitemap))failures.push('Excluded names in sitemap');
const encode=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const w of workflows){if(!w.pageIds.some(id=>[w.title,w.example[1]].some(text=>pageHtml.get(id)?.includes(encode(text)))))failures.push(`Workflow ${w.id}: no visible task description or example`);}
const report={checkedAt:base,origin,indexable,pages:pages.length,visibleWorkflows:workflows.length,uniqueTitles:titles.size,uniqueDescriptions:descriptions.size,descriptionLength:{min:Math.min(...lengths),max:Math.max(...lengths)},sharingImage:imageSize?.join('x')||null,internalRoutesAndAssets:links.size,schemas,unknownRoute:bad.status,failures,result};
await fs.writeFile(path.join(root,'verification.json'),JSON.stringify({...report,checkedAt:'local dist via serve.mjs'},null,2));
console.log(JSON.stringify({...report,result:undefined},null,2));if(failures.length)process.exitCode=1;
}finally{server.kill();}

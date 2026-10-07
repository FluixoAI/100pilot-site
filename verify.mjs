import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {workflows} from './workflow-catalog.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const {origin,pages}=JSON.parse(await fs.readFile(path.join(root,'page-manifest.json'),'utf8'));
const failures=[];const links=new Set();const titles=new Set();const descriptions=new Set();let schemas=0;
const result=[];const pageHtml=new Map();
for(const page of pages){
 const response=await fetch(origin+page.url);const html=await response.text();
 pageHtml.set(page.id,html);
 if(response.status!==200)failures.push(`${page.url}: HTTP ${response.status}`);
 const title=html.match(/<title>([\s\S]*?)<\/title>/)?.[1];const desc=html.match(/<meta name="description" content="([^"]*)"/)?.[1];
 if(!title||titles.has(title))failures.push(`${page.url}: missing/duplicate title`);titles.add(title);
 if(!desc||descriptions.has(desc))failures.push(`${page.url}: missing/duplicate description`);descriptions.add(desc);
 if((html.match(/<h1(?:\s[^>]*)?>/g)||[]).length!==1)failures.push(`${page.url}: expected one h1`);
 if(!html.includes(`rel="canonical" href="${origin+page.url}"`))failures.push(`${page.url}: canonical mismatch`);
 if(!html.includes('content="noindex, nofollow"')||!response.headers.get('x-robots-tag')?.includes('noindex'))failures.push(`${page.url}: local indexing guard missing`);
 if(/fluixo|\banfu\b|\bpvd\b|\bfava\b/i.test(html))failures.push(`${page.url}: excluded brand`);
 if(/TODO|lorem ipsum|placeholder content/i.test(html))failures.push(`${page.url}: draft placeholder`);
 for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
   try{const graph=JSON.parse(match[1]);schemas+=graph.length;if(page.url!=='/'&&!graph.some(g=>g['@type']==='BreadcrumbList'))failures.push(`${page.url}: breadcrumb missing`);}catch{failures.push(`${page.url}: invalid JSON-LD`);}
 }
 for(const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)){const u=match[1];if(u.startsWith('/')&&!u.startsWith('//'))links.add(new URL(u,origin).pathname);}
 const body=html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';const words=body.replace(/<[^>]+>/g,' ').trim().split(/\s+/).length;
 result.push({url:page.url,status:response.status,mainWords:words});
}
for(const url of links){const response=await fetch(origin+url,{method:'HEAD'});if(response.status!==200)failures.push(`Broken link/asset ${url}: ${response.status}`);}
const bad=await fetch(origin+'/page-qui-nexiste-pas/');if(bad.status!==404)failures.push('Unknown route should return HTTP 404');
const noSlash=await fetch(origin+'/services',{redirect:'manual'});if(noSlash.status!==308||noSlash.headers.get('location')!=='/services/')failures.push('Trailing-slash redirect incorrect');
const robots=await(await fetch(origin+'/robots.txt')).text();if(!robots.includes('Disallow: /'))failures.push('Local robots policy');
const sitemap=await(await fetch(origin+'/sitemap.xml')).text();if((sitemap.match(/<loc>/g)||[]).length!==pages.length)failures.push('Sitemap count differs from pages');
const obsoleteRoutes=['/realisations/pvd-automatisation-odoo/','/etudes/fava-sport-automatisation/'];
for(const url of obsoleteRoutes){if((await fetch(origin+url)).status!==404)failures.push(`Named route still exposed: ${url}`);}
if(/pvd|fava/i.test(sitemap))failures.push('Excluded names in sitemap');
const encode=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const w of workflows){if(!w.pageIds.some(id=>[w.title,w.example[1]].some(text=>pageHtml.get(id)?.includes(encode(text)))))failures.push(`Workflow ${w.id}: no visible task description or example`);}
const report={pages:pages.length,visibleWorkflows:workflows.length,uniqueTitles:titles.size,uniqueDescriptions:descriptions.size,internalRoutesAndAssets:links.size,schemas,unknownRoute:bad.status,failures,result};
await fs.writeFile(path.join(root,'verification.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,result:undefined},null,2));if(failures.length)process.exitCode=1;

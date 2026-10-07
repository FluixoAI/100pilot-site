import fs from 'node:fs/promises';
import {workflows} from '../workflow-catalog.mjs';
import {workflows as oldWorkflows} from '../.editorial/before-brand-v5/workflow-catalog.mjs';
import {cases} from '../page-catalog.mjs';
import {cases as oldCases} from '../.editorial/before-brand-v5/page-catalog.mjs';
import {taskScenes} from '../task-visuals.mjs';
import {personas} from '../brand-system.mjs';
const root=new URL('../',import.meta.url);
const read=async p=>JSON.parse(await fs.readFile(new URL(p,root),'utf8'));
const manifest=await read('page-manifest.json');
const before=await read('.editorial/before-brand-v5/page-manifest.json');
const failures=[];
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=s=>s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const htmlByPath=new Map();
const anchors=new Map();
for(const p of manifest.pages){
 const html=await fs.readFile(new URL('dist/'+(p.url==='/'?'':p.url.slice(1))+'index.html',root),'utf8');
 htmlByPath.set(p.url,html);
 anchors.set(p.url,new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1])));
 const main=html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';
 const text=plain(main);
 if(/\bPersona\b/.test(text))failures.push(`${p.id}: internal page family visible`);
 if(/automation-studio\.png|services-engine\.png|data-workflows\.png/.test(html))failures.push(`${p.id}: old artwork visible`);
 if(!html.includes('/assets/logo-mark.svg')||!html.includes('class="brand-ai"'))failures.push(`${p.id}: brand missing`);
 if(cases[p.id]){
  if(JSON.stringify(cases[p.id])!==JSON.stringify(oldCases[p.id]))failures.push(`${p.id}: source case changed`);
  if(!main.includes(escape(cases[p.id].proof))||!main.includes(escape(cases[p.id].limit)))failures.push(`${p.id}: evidence absent`);
 }
 if(p.family==='Persona'&&!text.includes('Situation illustrative'))failures.push(`${p.id}: persona illustration not labelled`);
 if(p.family==='Persona'&&!main.includes('id="taches"'))failures.push(`${p.id}: task anchor absent`);
 if(p.id==='P070'&&(main.match(/class="scope-task"/g)||[]).length!==8)failures.push('P070: scenarios missing');
}
for(const p of before.pages){const current=manifest.pages.find(r=>r.id===p.id);if(!current||current.url!==p.url||current.status!==p.status)failures.push(`${p.id}: previous route/status changed`);}
for(const [url,html] of htmlByPath){
 for(const link of html.matchAll(/href="([^"\s]+)"/g)){
  if(!link[1].startsWith('/')&&!link[1].startsWith('#'))continue;
  const target=new URL(link[1],manifest.origin+url);
  if(target.hash&&anchors.has(target.pathname)&&!anchors.get(target.pathname).has(decodeURIComponent(target.hash.slice(1))))failures.push(`${url}: broken fragment ${link[1]}`);
 }
}
for(const w of workflows){
 if(JSON.stringify(w)!==JSON.stringify(oldWorkflows.find(r=>r.id===w.id)))failures.push(`${w.id}: workflow facts changed`);
 if(!taskScenes[w.id])failures.push(`${w.id}: task-specific illustration missing`);
}
const share=await read('.preview-tools/share-state.json');
const publicChecks=await Promise.all(['/',...personas.map(p=>p.url),'/services/','/assets/site.css','/assets/logo.svg'].map(async route=>{
 const response=await fetch(share.url+route);const body=await response.text();
 if(response.status!==200)failures.push(`Public ${route}: ${response.status}`);
 if(!response.headers.get('x-robots-tag')?.includes('noindex'))failures.push(`Public ${route}: index guard missing`);
 if(route==='/'&&!plain(body).includes(escape(manifest.pages[0].h1)))failures.push('Public homepage is stale');
 return {route,status:response.status};
}));
const report={
 version:'Brand V5',source:'Plateforme de marque V1 — 100pilot.ai, supplied by Pascal on 2026-10-02',
 pages:manifest.pages.length,previousRoutesRetained:before.pages.length,personaPages:personas.length,workflowsPreserved:workflows.length,casesPreserved:Object.keys(cases).length,taskIllustrations:Object.keys(taskScenes).length,
 direction:{positioning:'Help choose, build, deliver and follow the first task',promise:'Du pilotage manuel au pilote automatique',colours:['#04342C','#085041','#1D9E75','#E1F5EE'],typography:['Georgia','Segoe UI'],logo:['assets/logo.svg','assets/logo-mark.svg'],artwork:'Illustrative HTML/SVG inputs and outputs, no client screenshots'},
 editorialReview:{skills:['Humanizer','Copy-editing'],passes:['Clarity: roles, inputs and usable outputs','Tone: direct French, vous, familiar daily tasks','Benefit: preparation work delegated and decisions retained','Evidence: case statuses, proof and limits preserved','Specificity: distinct diagrams for 47 tasks','Emotion: everyday friction, no artificial urgency','Next step: describe a task, prepare and review an email'],excludedCommitments:['Fixed batches of three','Free audit','Two-week delivery','Unmeasured hours saved or ROI','No oversight or no risk'],perspectives:{type:'Single-agent editorial self-review, not an external customer test',conversion:8,ux:8,prospect:8,brand:8}},
 browserChecks:{desktop:[1280,900],mobile:[390,844],tabs:'Click and ArrowRight switch visible example and aria-selected',menu:'Opens, closes with Escape',journey:'Home example to commercial page to contact; role prefilled; synthetic message prepared for lucas.lenoir@100pilot.ai, no email sent',mobileJourney:'Home to operations page, no horizontal overflow observed'},
 shareUrl:share.url,publicChecks,failures
};
await fs.writeFile(new URL('qa/brand-review-v5.json',root),JSON.stringify(report,null,2));
console.log(JSON.stringify({pages:report.pages,previousRoutesRetained:report.previousRoutesRetained,workflows:report.workflowsPreserved,cases:report.casesPreserved,publicChecks,failures},null,2));
if(failures.length)process.exitCode=1;

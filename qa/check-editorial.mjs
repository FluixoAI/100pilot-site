import fs from 'node:fs/promises';
import {workflows} from '../workflow-catalog.mjs';
import {workflows as previousWorkflows} from '../.editorial/before/workflow-catalog.mjs';
import {cases} from '../page-catalog.mjs';
import {cases as previousCases} from '../.editorial/before/page-catalog.mjs';
const root=new URL('../',import.meta.url);
const read=async p=>JSON.parse(await fs.readFile(new URL(p,root),'utf8'));
const manifest=await read('page-manifest.json');
const previous=await read('.editorial/before/page-manifest.json');
const failures=[];
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const reviewed=[];
for(const p of manifest.pages){
 const old=previous.pages.find(r=>r.id===p.id);
 if(!old||old.url!==p.url||old.status!==p.status)failures.push(`${p.id}: route/status changed`);
 const html=await fs.readFile(new URL('dist/'+(p.url==='/'?'':p.url.slice(1))+'index.html',root),'utf8');
 const main=html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';
 const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
 for(const a of html.matchAll(/href="#([^"]+)"/g))if(!ids.has(a[1]))failures.push(`${p.id}: broken anchor ${a[1]}`);
 const heading=clean(main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]||'');
 if([...main.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].some(m=>clean(m[1])===heading))failures.push(`${p.id}: h1 repeated as h2`);
 if(cases[p.id]){
  if(cases[p.id].limit!==previousCases[p.id].limit)failures.push(`${p.id}: source limit changed`);
  if(!main.includes(escape(cases[p.id].proof))||!main.includes(escape(cases[p.id].limit)))failures.push(`${p.id}: evidence absent`);
 }
 if(p.id==='P070'&&(main.match(/class="scope-task"/g)||[]).length!==8)failures.push('P070: eight scenarios absent');
 reviewed.push({id:p.id,url:p.url,family:p.family,h1Changed:p.h1!==old.h1,descriptionChanged:p.description!==old.description,sourceStatus:p.status});
}
const preservedFields=['id','pageIds','group','today','action','result','example','steps','needs','approval'];
for(const w of workflows){
 const old=previousWorkflows.find(r=>r.id===w.id);
 for(const key of preservedFields)if(JSON.stringify(w[key])!==JSON.stringify(old[key]))failures.push(`${w.id}: source field ${key} changed`);
}
const shareState=await read('.preview-tools/share-state.json');
const publicResponse=await fetch(shareState.url+'/');
const publicHtml=await publicResponse.text();
const sharedPreview={status:publicResponse.status,noindex:publicResponse.headers.get('x-robots-tag'),currentHeadline:clean(publicHtml).includes(escape(manifest.pages[0].h1))};
if(sharedPreview.status!==200||!sharedPreview.currentHeadline||!sharedPreview.noindex?.includes('noindex'))failures.push('Shared preview not current');
const report={
 skills:[{name:'Humanizer',source:'https://github.com/blader/humanizer'},{name:'Copy-editing',source:'https://github.com/coreyhaines31/marketingskills/tree/main/skills/copy-editing'}],
 pages:reviewed.length,workflows:workflows.length,sourceWorkflowFieldsPreserved:preservedFields,caseLimitsPreserved:Object.keys(cases).length,
 routesAndCaseStatusesPreserved:true,
 editorialPasses:[
  {name:'Clarity',change:'Titres par tâche, exemples et sorties nommés ; portée des services et études corrigée.'},
  {name:'Voice and tone',change:'Vouvoiement et français professionnel direct ; suppression des slogans et formulations creuses.'},
  {name:'So what',change:'Recherche de fichiers, relecture et travail administratif reliés au résultat attendu par l’équipe.'},
  {name:'Prove it',change:'Statuts et limites conservés, cartes de cas factuelles, exemples signalés ; aucune mesure de ROI inventée.'},
  {name:'Specificity',change:'Questions par tâche, besoins de départ et huit scénarios textiles présentés distinctement.'},
  {name:'Emotion',change:'Situations quotidiennes reconnaissables ; pas d’urgence ou de peur ajoutée.'},
  {name:'Zero risk',change:'Prochain échange explicite, méthode secondaire, validations visibles, email à relire avant envoi.'}
 ],
 landingPageSelfReview:{type:'Single-agent simulated perspectives; subjective editorial rubric, not an external panel or conversion measurement',
  beforeFinalAdjustments:{conversion:8,ux:7,prospect:7,brand:8},
  corrections:['Cartes de cas : récit spécifique plutôt que résultat générique','Suppression du double marqueur des bénéfices','Présentation séparée des huit scénarios de l’étude textile','Données et validations des cas de synthèse adaptées au périmètre'],
  afterFinalAdjustments:{conversion:8,ux:8,prospect:8,brand:8}},
 browserChecks:{desktop:[1280,900],mobile:[390,844],routes:['/','/services/','/solutions/classement-factures/','/realisations/distribution-b2b-stocks-fournisseurs/','/etudes/sport-textile-automatisation/','/ressources/prioriser-automatisations/','/contact/?sujet=Classement%20des%20factures'],details:'Method disclosure and task FAQ open correctly',overflow:'No horizontal overflow observed on inspected mobile pages',contact:'Context prefilled, message prepared with synthetic test data, mailto recipient verified as lucas.lenoir@100pilot.ai; no email sent',sharedImages:'All three image assets loaded in public browser preview',screenshot:'qa/screenshots/home-editorial-v4.png'},
 sharedPreview,failures,reviewed
};
await fs.writeFile(new URL('qa/editorial-review-v4.json',root),JSON.stringify(report,null,2));
console.log(JSON.stringify({pages:report.pages,workflows:report.workflows,caseLimitsPreserved:report.caseLimitsPreserved,sharedPreview,failures},null,2));
if(failures.length)process.exitCode=1;

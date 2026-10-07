import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {content as sourceContent} from './content.mjs';
import {publicCopy,routeChanges} from './public-copy.mjs';
import {symbol} from './design.mjs';
import {coreCopy} from './human-copy.mjs';
import {agencyContent,methodContent} from './core-pages.mjs';
import {workflows} from './workflow-catalog.mjs';
import {readerDetail} from './reader-detail.mjs';
import {makePages,profiles,cases,coverage,groups,mergedPages} from './page-catalog.mjs';
import {catalogueHome,catalogueServices,catalogueHub} from './catalogue-ui.mjs';
import {brandLogo,personaPages,personaContent,personaContext,workflowPreview} from './brand-system.mjs';
import {overviewScenes} from './task-visuals.mjs';
const content=publicCopy(sourceContent);
const root=path.dirname(fileURLToPath(import.meta.url));const dist=path.join(root,'dist');
const config=JSON.parse(await fs.readFile(path.join(root,'site.config.json'),'utf8'));
const inventory=JSON.parse(await fs.readFile(path.join(root,'source-inventory.json'),'utf8'));
const pages=[...makePages(inventory),...personaPages];
for(const p of pages){if(coreCopy[p.id])p.h1=coreCopy[p.id].h1;if(profiles[p.id]&&['Service','Intégration','Secteur','Ressource'].includes(p.family))p.h1=profiles[p.id].title;}
const origin=(config.publicOrigin||config.previewOrigin).replace(/\/$/,'');
const indexable=Boolean(config.indexable&&config.publicOrigin);
const pageByUrl=Object.fromEntries(pages.map(p=>[p.url,p]));
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const button=(href,label,style='')=>`<a class="button ${style}" href="${href}">${label}</a>`;
export const brand=brandLogo;
const parents={Service:['Services','/services/'],Solution:['Solutions','/solutions/'],Réalisation:['Réalisations','/realisations/'],Étude:['Études','/etudes/'],Ressource:['Ressources','/ressources/'],Intégration:['Intégrations','/integrations/'],Secteur:['Secteurs','/secteurs/'],Persona:['Votre équipe','/pour-votre-equipe/']};
export function shell({title,description,url='/',body,type='Socle',h1=title}){
 const nav=[['/pour-votre-equipe/','Votre équipe'],['/services/','Services'],['/solutions/','Solutions'],['/realisations/','Réalisations'],['/etudes/','Études']];
 const current=nav.find(([u])=>url.startsWith(u))?.[0];
 const schema=[{'@context':'https://schema.org','@type':'Organization','@id':origin+'/#organization',name:'100 Pilot',url:origin+'/',description:'Agence d’automatisation et d’intelligence artificielle pour les PME.'},{'@context':'https://schema.org','@type':'WebSite','@id':origin+'/#website',name:'100 Pilot',url:origin+'/',inLanguage:'fr'}];
 if(url!=='/'){
   const items=[{name:'Accueil',item:origin+'/'}];if(parents[type])items.push({name:parents[type][0],item:origin+parents[type][1]});items.push({name:h1,item:origin+url});
   schema.push({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((it,i)=>({'@type':'ListItem',position:i+1,...it}))});
 }
 if(['Service','Solution'].includes(type))schema.push({'@context':'https://schema.org','@type':'Service',name:h1,description,url:origin+url,provider:{'@id':origin+'/#organization'}});
 if(['Réalisation','Étude','Ressource'].includes(type))schema.push({'@context':'https://schema.org','@type':'Article',headline:h1,description,inLanguage:'fr',mainEntityOfPage:origin+url,author:{'@type':'Organization',name:'100 Pilot'},publisher:{'@id':origin+'/#organization'}});
 if(type==='Persona'||url==='/pour-votre-equipe/')schema.push({'@context':'https://schema.org','@type':'WebPage',name:h1,description,url:origin+url,inLanguage:'fr',isPartOf:{'@id':origin+'/#website'}});
 return `<!doctype html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="${indexable?'index, follow':'noindex, nofollow'}"><link rel="canonical" href="${esc(origin+url)}"><meta name="theme-color" content="#04342C"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="${['Réalisation','Étude','Ressource'].includes(type)?'article':'website'}"><meta property="og:url" content="${esc(origin+url)}"><link rel="icon" type="image/svg+xml" href="/assets/logo-mark.svg"><link rel="stylesheet" href="/assets/site.css"><script src="/assets/site.js" defer></script><script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script></head><body><a class="skip" href="#main">Aller au contenu</a><header class="site-header"><div class="wrap header-inner">${brand}<button class="menu-toggle" data-menu-button aria-expanded="false" aria-controls="main-navigation">Menu</button><nav id="main-navigation" class="nav" aria-label="Navigation principale" data-menu>${nav.map(([u,l])=>`<a href="${u}" ${current===u?`aria-current="${url===u?'page':'true'}"`:''}>${l}</a>`).join('')}${button('/contact/','Parlons de votre projet')}</nav></div></header><main id="main">${body}</main><footer class="site-footer"><div class="wrap"><div class="footer-grid"><div>${brand}<p>Du pilotage manuel au pilote automatique. Nous vous aidons à choisir une première tâche, puis nous construisons et suivons la solution.</p></div><div><h3>Explorer</h3><div class="footer-links">${nav.map(([u,l])=>`<a href="${u}">${l}</a>`).join('')}</div></div><div><h3>100 Pilot</h3><div class="footer-links"><a href="/agence/">L’agence</a><a href="/ressources/">Les guides</a><a href="/methode/">Notre méthode</a><a href="/integrations/">Vos outils</a><a href="/secteurs/">Votre secteur</a><a href="/contact/">Préparer votre brief</a></div></div></div><div class="footer-base"><span>© 2026 100 Pilot</span><span>Automatisez vos tâches. Pilotez votre activité.</span></div></div></footer></body></html>`;
}
export function home(){return catalogueHome({button,cards,pages});}
function crumbs(p){const parent=parents[p.family];return `<nav class="breadcrumbs" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span aria-hidden="true">/</span>${parent?`<a href="${parent[1]}">${parent[0]}</a><span aria-hidden="true">/</span>`:''}<span aria-current="page">${esc(p.h1)}</span></nav>`;}
function hero(p,intro,badge=''){
 const illustrated=['Service','Solution','Réalisation','Étude','Intégration','Secteur'].includes(p.family);
 const group=profiles[p.id]?.group||'operations';
 const scene=overviewScenes[p.id];
 return `<div class="wrap">${crumbs(p)}</div><section class="page-hero ${illustrated?'illustrated-hero':''}"><div class="wrap hero-content-grid"><div>${badge?`<span class="tag ${p.family==='Étude'?'study':''}">${esc(badge)}${['Réalisation','Étude'].includes(p.family)?' · Cas anonymisé':''}</span>`:`<div class="eyebrow">${esc(p.role||(p.family==='Socle'?'100pilot':p.family))}</div>`}${illustrated?personaContext(group):''}<h1>${esc(p.h1)}</h1><p class="intro">${esc(intro)}</p>${p.family==='Persona'?`<div class="actions">${button('/contact/?sujet='+encodeURIComponent(p.role),'Décrire ma tâche')}${button('#taches','Voir les tâches','light')}</div>`:['Service','Solution','Intégration','Secteur'].includes(p.family)?`<div class="actions">${button('/contact/?sujet='+encodeURIComponent(p.h1),'Parlons de votre tâche')}${button('#livrable','Le résultat à préparer','light')}</div>`:''}</div>${illustrated?workflowPreview(profiles[p.id]?.id||group,{compact:true,scene}):''}</div></section>`;
}
function cards(rows){return `<div class="cards">${rows.map((p,i)=>{const c=profiles[p.id];const proof=cases[p.id];return `<a href="${p.url}" class="card">${symbol(c?groups[c.group][1]:'content')}<span class="card-index">${esc(proof?.status||p.family)}</span><h3>${esc(p.h1)}</h3><p>${esc(proof?.intro||c?.intro||p.angle)}</p>${c&&!proof&&p.family==='Solution'?`<div class="card-value">${esc(c.benefit[0])}</div>`:''}<span class="card-link">${p.family==='Ressource'?'Lire le guide':p.family==='Étude'?'Voir le scénario':p.family==='Réalisation'?'Lire le cas':'Voir le détail'}</span></a>`}).join('')}</div>`;}
function related(p){const profile=profiles[p.id];const relevant=pages.filter(r=>r.id!==p.id&&profiles[r.id]?.group===profile?.group&&(['Réalisation','Étude'].includes(p.family)?r.family==='Solution':r.family==='Réalisation')).map(r=>r.url);const urls=[...relevant,...p.links.split(' ; '),'/services/audit-automatisation/','/methode/','/ressources/prioriser-automatisations/'];const rows=[...new Set(urls)].filter(u=>u!==p.url&&u!=='/contact/'&&pageByUrl[u]).map(u=>pageByUrl[u]).slice(0,3);return `<section class="section related"><div class="wrap"><h2>Pour aller plus loin</h2>${cards(rows)}</div></section>`;}
function detail(p){
 const profile=profiles[p.id];if(!profile)throw Error('Missing reader profile: '+p.id);
 const children=(profile.children||[]).map(id=>pages.find(r=>r.id===id)).filter(Boolean);
 const studyScope={P070:['W14','W15','W16','W17','W18','W19','W20','W21'],P072:['W17','W18']};
 const siblings=workflows.filter(w=>studyScope[p.id]?studyScope[p.id].includes(w.id):w.pageIds.includes(p.id)&&w.id!==profile.id);
 const childCards=children.length?`<section class="section gray"><div class="wrap"><div class="section-head"><h2>Choisissez une tâche</h2></div>${cards(children)}</div></section>`:'';
 const workflowCards=siblings.length?`<section id="autres-taches"><h2>${p.family==='Étude'?'Les scénarios proposés':'Les tâches associées'}</h2>${siblings.map(w=>`<article class="scope-task"><h3>${esc(w.title)}</h3><p>${esc(p.family==='Étude'?w.intro:w.action)}</p><p><strong>${p.family==='Étude'?'Le résultat envisagé':'Le résultat'} :</strong> ${esc(w.result)}</p>${p.family==='Étude'?`<a class="text-link" href="${pages.find(r=>r.family==='Solution'&&w.pageIds.includes(r.id))?.url||'/solutions/'}">Voir les données et validations à prévoir</a>`:`<ul>${w.benefit.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><p class="plain-note">${esc(w.approval)}</p>`}</article>`).join('')}</section>`:'';
 return readerDetail({p,profile,legacy:content[p.id],caseInfo:cases[p.id],hero,button,esc,related,childCards,workflowCards});
}
function hub(p){return p.id==='P002'?catalogueServices({button,pages,esc}):catalogueHub({p,pages,hero,cards,button});}
function agency(p){return hero(p,coreCopy.P010.intro)+agencyContent({button,p,related});}
function method(p){return hero(p,coreCopy.P011.intro)+methodContent({button,p,related});}
function contact(p){return hero(p,coreCopy.P012.intro)+`<section class="section gray"><div class="wrap form-layout"><div><form class="brief-form" data-brief-form><div class="field"><label for="name">Votre nom</label><input id="name" name="name" autocomplete="name" required maxlength="120"></div><div class="field"><label for="company">Entreprise</label><input id="company" name="company" autocomplete="organization" required maxlength="150"></div><div class="field full"><label for="email">Email professionnel</label><input id="email" name="email" type="email" autocomplete="email" required maxlength="200"></div><div class="field full"><label for="topic">Sujet du projet</label><input id="topic" name="topic" placeholder="Stocks, catalogue, prospection, factures…" required maxlength="200"></div><div class="field full"><label for="tools">Vos outils actuels <span class="notice">(facultatif)</span></label><input id="tools" name="tools" placeholder="Odoo, Excel, Drive, CRM…" maxlength="350"></div><div class="field full"><label for="need">Quelle tâche souhaitez-vous automatiser ?</label><textarea id="need" name="need" required minlength="20" maxlength="5000" placeholder="Expliquez comment vous faites cette tâche et ce que vous aimeriez obtenir."></textarea><small>Quelques phrases suffisent. N’ajoutez pas de mot de passe ou de document confidentiel.</small></div><p class="form-note">Ce formulaire prépare un email à lucas.lenoir@100pilot.ai dans votre messagerie. Vous pouvez le relire avant de l’envoyer.</p><div class="field full"><button class="button" type="submit">Préparer mon message</button></div></form><section class="form-result" data-brief-result hidden tabindex="-1" aria-label="Brief préparé"><h2>Votre message est prêt.</h2><pre></pre><div class="actions"><a class="button" href="mailto:lucas.lenoir@100pilot.ai" data-email-brief>Ouvrir ma messagerie</a><button class="button light" data-download-brief type="button">Télécharger le brief</button><button class="button light" data-copy-brief type="button">Copier le texte</button></div><p class="notice" data-brief-notice role="status" aria-live="polite">Relisez votre message, puis ouvrez votre messagerie pour l’envoyer à 100 Pilot.</p></section></div><aside class="aside-panel"><h2>Écrivez-nous directement</h2><p><a class="text-link" href="mailto:lucas.lenoir@100pilot.ai">lucas.lenoir@100pilot.ai</a></p><h2 class="contact-aside-title">Un bon point de départ</h2><ul><li>Une tâche qui revient souvent.</li><li>Les outils et fichiers utilisés.</li><li>Les décisions que l’équipe prend aujourd’hui.</li><li>Le résultat que vous aimeriez utiliser.</li></ul><p class="notice">Vous hésitez entre plusieurs tâches ? L’audit permet de comparer les priorités et de choisir un premier pilote.</p><a class="text-link" href="/services/audit-automatisation/">Comprendre l’audit</a></aside></div></section>`;}
const intros={P010:agency,P011:method,P012:contact};
// Remove obsolete named routes so they cannot remain in the public output.
for(const original of inventory.pages){const current=pages.find(p=>p.id===original.id);if(!current||current.url!==original.url){const oldPath=path.resolve(dist,'.'+original.url);if(!oldPath.startsWith(dist+path.sep))throw Error('Invalid cleanup path');await fs.rm(oldPath,{recursive:true,force:true});}}
for(const oldRoute of Object.keys(routeChanges)){const oldPath=path.resolve(dist,'.'+oldRoute);if(!oldPath.startsWith(dist+path.sep))throw Error('Invalid cleanup path');await fs.rm(oldPath,{recursive:true,force:true});}
await fs.mkdir(path.join(dist,'assets'),{recursive:true});
for(const file of ['site.css','site.js','logo.svg','logo-mark.svg'])await fs.copyFile(path.join(root,'assets',file),path.join(dist,'assets',file));
const manifest=[];
for(const p of pages){
 const h1=p.h1;
 const body=p.id==='P001'?home():p.id.startsWith('B')?hero(p,p.intro)+personaContent(p,{button,cards,pages}):intros[p.id]?intros[p.id](p):p.family==='Socle'?hub(p):detail(p);
 const intro=p.intro||coreCopy[p.id]?.intro||cases[p.id]?.intro||profiles[p.id]?.intro||content[p.id]?.intro||p.angle;const desc=p.description||coreCopy[p.id]?.description||(intro.length>165?intro.slice(0,162).replace(/\s+\S*$/,'')+'…':intro);
 const title=p.id==='P001'?'100 Pilot | Automatisation et IA pour les PME':p.id==='P002'?'Services d’automatisation et IA pour les PME | 100 Pilot':p.title;
 const file=p.url==='/'?path.join(dist,'index.html'):path.join(dist,p.url,'index.html');await fs.mkdir(path.dirname(file),{recursive:true});
 const html=shell({title,description:desc,url:p.url,h1,type:p.family,body});
 if(/fluixo|\banfu\b|\bpvd\b|\bfava\b/i.test(html))throw Error('Excluded brand found in public copy');
 await fs.writeFile(file,html);
 manifest.push({id:p.id,url:p.url,family:p.family,title,h1,description:desc,sourceIds:p.refs,status:cases[p.id]?.status||null,workflowIds:workflows.filter(w=>w.pageIds.includes(p.id)).map(w=>w.id)});
}
await fs.writeFile(path.join(dist,'404.html'),shell({title:'Page introuvable | 100 Pilot',description:'Retrouvez les services et solutions 100 Pilot.',body:'<section class="section wrap empty-state"><div class="eyebrow">Page introuvable</div><h1>Cette page est introuvable.</h1><p class="notice">Cette page n’existe pas ou a changé d’adresse.</p><div class="actions">'+button('/','Revenir à l’accueil')+'</div></section>'}));
await fs.writeFile(path.join(dist,'robots.txt'),indexable?`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n');
await fs.writeFile(path.join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p=>`<url><loc>${esc(origin+p.url)}</loc><lastmod>2026-10-02</lastmod></url>`).join('')}</urlset>`);
await fs.writeFile(path.join(root,'page-manifest.json'),JSON.stringify({generatedAt:'2026-10-02',localOnly:!indexable,origin,pages:manifest},null,2));
const workflowCoverage=coverage(inventory,pages);if(workflowCoverage.some(w=>w.pageIds.length===0))throw Error('Uncovered workflow');
await fs.writeFile(path.join(root,'workflow-coverage.json'),JSON.stringify({workflows:workflowCoverage.length,covered:workflowCoverage.filter(w=>w.pageIds.length>0).length,pages:pages.length,mergedPages,rows:workflowCoverage},null,2));
console.log(`100 Pilot: ${pages.length} reader-focused pages; ${workflowCoverage.length} workflows covered.`);

export function readerDetail({p,profile,legacy,hero,button,esc,related,caseInfo,childCards='',workflowCards=''}){
 const isCase=p.family==='Réalisation',isStudy=p.family==='Étude',isGuide=p.family==='Ressource';
 const isOverview=['Service','Secteur','Intégration'].includes(p.family);
 const status=caseInfo?.status||(isStudy?'Scénario proposé':isCase?'Travail documenté':undefined);
 const result=caseInfo?.result||profile.result;
 const list=items=>`<ul>${items.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`;
 const steps=profile.steps.map(([h,t])=>`<li><strong>${esc(h)}</strong><p>${esc(t)}</p></li>`).join('');
 const example=`<section id="exemple" class="reader-example"><span class="example-label">Exemple illustratif</span><h2>${esc(profile.example[0])}</h2><p>${esc(profile.example[1])}</p></section>`;
 const summary=isGuide?`<section class="section reader-summary"><div class="wrap editorial-guide-result" id="livrable"><h2>À préparer avec ce guide</h2><p>${esc(result)}</p></div></section>`:`<section class="section reader-summary"><div class="wrap"><div class="benefit-panel"><div><h2>${isStudy?'L’intérêt du scénario':isCase?'Pour une équipe confrontée à cette tâche':'Pour votre équipe'}</h2>${list(profile.benefit)}</div><div id="livrable"><h2>${isStudy?'Le résultat envisagé':isCase?'Le résultat du travail':'Ce que vous recevez'}</h2><p>${esc(result)}</p></div></div></div></section>`;
 const evidence=caseInfo?`<section id="preuve"><h2>${isStudy?'État du projet':'Le résultat et ses limites'}</h2><p>${esc(caseInfo.proof)}</p><p class="plain-note">${esc(caseInfo.limit)}</p></section>`:'';
 const situation=`<section id="quotidien"><h2>${isCase?'Le besoin de départ':isStudy?'La tâche à simplifier':isGuide?'Le point de départ':'Quand cette tâche revient'}</h2><p>${esc(caseInfo?.today||profile.today)}</p></section>`;
 const work=`<section id="travail"><h2>${isCase?'Le travail effectué':isStudy?'Le périmètre étudié':isGuide?'La démarche':'Ce que nous prenons en charge'}</h2><p>${esc(caseInfo?.action||profile.action)}</p></section>`;
 const method=isGuide?`<section id="etapes"><h2>Les étapes</h2><ol class="editorial-steps">${steps}</ol></section>`:isCase||isStudy?'':`<details class="editorial-method" id="etapes"><summary>Comment préparer le premier test</summary><ol class="editorial-steps">${steps}</ol></details>`;
 const needs=isGuide?'':`<section id="depart"><h2>${caseInfo?'Pour un projet comparable':'Pour commencer'}</h2>${list(profile.needs)}</section>`;
 const control=`<section id="validation"><h2>${isGuide?'À vérifier avant de continuer':'Les validations à prévoir'}</h2><p>${esc(profile.approval)}</p></section>`;
 const questions=profile.questions||[];
 const faq=!caseInfo&&questions.length?`<section id="questions"><h2>${questions.length===1?'Une question à régler':'Avant de commencer'}</h2><div class="faq">${questions.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>`:'';
 const refs=legacy?.references?`<section><h2>Sources complémentaires</h2><ul>${legacy.references.map(([t,u])=>`<li><a class="text-link" href="${u}">${esc(t)}</a></li>`).join('')}</ul></section>`:'';
 let body;
 if(isGuide)body=situation+work+method+example+control+faq;
 else if(caseInfo)body=situation+work+example+workflowCards+evidence+needs+control;
 else if(isOverview)body=work+example+needs+control+method+faq;
 else body=situation+work+example+workflowCards+needs+control+method+faq;
 const cta=`<div class="reader-bottom-cta"><h2>${isGuide?'Choisissons votre première tâche':'Vous faites encore ce travail à la main ?'}</h2><p>Montrez-nous un exemple et le résultat dont votre équipe a besoin. Nous définirons avec vous ce que l’automatisation peut préparer et comment vérifier le premier test.</p>${button('/contact/?sujet='+encodeURIComponent(p.h1),'Parlons de cette tâche')}</div>`;
 const nav=[['travail',isGuide?'La démarche':'Le travail concerné'],['livrable',isGuide?'À préparer':'Le résultat'],['exemple','Un exemple'],...(caseInfo?[['preuve','État du travail']]:isGuide?[]:[['depart','Pour commencer']]),...(!caseInfo&&questions.length?[['questions','La question à régler']]:[])];
 const aside=`<aside class="aside-panel"><h2>Sur cette page</h2><ul>${nav.map(([id,label])=>`<li><a href="#${id}">${label}</a></li>`).join('')}</ul>${button('/contact/?sujet='+encodeURIComponent(p.h1),'Parlons de votre cas')}</aside>`;
 return hero(p,caseInfo?.intro||profile.intro,status)+summary+childCards+`<section class="section"><div class="wrap detail-layout"><div class="prose">${body}${refs}${cta}</div>${aside}</div></section>`+related(p);
}

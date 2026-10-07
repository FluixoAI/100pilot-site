const menuButton=document.querySelector('[data-menu-button]');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
if(!reducedMotion.matches&&'IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}},{threshold:0.08});
 for(const element of document.querySelectorAll('.section-head,.expertise-card,.case-card,.method-track>div,.home-expertises .card')){element.classList.add('reveal');observer.observe(element);}
 document.documentElement.classList.add('motion-ready');
 reducedMotion.addEventListener('change',event=>{if(event.matches)document.documentElement.classList.remove('motion-ready');});
}
const menu=document.querySelector('[data-menu]');
function closeMenu(){menu?.classList.remove('open');menuButton?.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');}
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menu.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenu();menuButton?.focus();}});
menu?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
window.addEventListener('resize',()=>{if(window.innerWidth>950)closeMenu();});
const exampleTabs=[...document.querySelectorAll('[data-example-tab]')];
function selectExample(tab){
 for(const item of exampleTabs){const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;}
 for(const panel of document.querySelectorAll('[data-example-panel]'))panel.hidden=panel.dataset.examplePanel!==tab.dataset.exampleTab;
}
for(const [index,tab] of exampleTabs.entries()){
 tab.addEventListener('click',()=>selectExample(tab));
 tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%exampleTabs.length;else if(event.key==='ArrowLeft')next=(index+exampleTabs.length-1)%exampleTabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=exampleTabs.length-1;else return;event.preventDefault();selectExample(exampleTabs[next]);exampleTabs[next].focus();});
}
const form=document.querySelector('[data-brief-form]');
if(form){const subject=new URLSearchParams(window.location.search).get('sujet');if(subject)form.elements.topic.value=subject.slice(0,200);}
let preparedBrief='';
form?.addEventListener('submit',event=>{
 event.preventDefault(); if(!form.reportValidity())return;
 const data=new FormData(form);
 preparedBrief=['BRIEF DE PROJET — 100 PILOT','',`Nom : ${data.get('name')}`,`Entreprise : ${data.get('company')}`,`Email : ${data.get('email')}`,`Sujet : ${data.get('topic')}`,`Outils actuels : ${data.get('tools')||'À préciser'}`,'','Tâche et besoin :',data.get('need')].join('\n');
 document.querySelector('[data-email-brief]').href='mailto:lucas.lenoir@100pilot.ai?subject='+encodeURIComponent('Projet 100 Pilot — '+data.get('topic'))+'&body='+encodeURIComponent(preparedBrief);
 const result=document.querySelector('[data-brief-result]');result.hidden=false;result.querySelector('pre').textContent=preparedBrief;result.focus();result.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
});
document.querySelector('[data-download-brief]')?.addEventListener('click',()=>{
 if(!preparedBrief)return;const blob=new Blob([preparedBrief],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='brief-100-pilot.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('[data-brief-notice]').textContent='Votre brief a été préparé pour le téléchargement. Aucun message n’a été envoyé.';
});
document.querySelector('[data-copy-brief]')?.addEventListener('click',async()=>{
 const notice=document.querySelector('[data-brief-notice]');
 // A synchronous copy can work in embedded browsers where Clipboard API permission is unavailable.
 const temporary=document.createElement('textarea');temporary.value=preparedBrief;temporary.setAttribute('readonly','');temporary.style.position='fixed';temporary.style.left='-9999px';document.body.append(temporary);temporary.select();
 let copied=false;try{copied=document.execCommand('copy');}catch{}temporary.remove();
 if(copied){notice.textContent='Brief copié. Vous pouvez le coller dans votre message.';return;}
 try{
   await Promise.race([navigator.clipboard.writeText(preparedBrief),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Clipboard unavailable')),1200))]);
   notice.textContent='Brief copié. Vous pouvez le coller dans votre message.';
 }catch{
   const range=document.createRange();range.selectNodeContents(document.querySelector('[data-brief-result] pre'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
   notice.textContent='Le texte est sélectionné. Utilisez Ctrl+C ou Cmd+C pour le copier.';
 }
});

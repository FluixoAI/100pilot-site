// Legal pages (mentions légales, confidentialité). Facts checked on 2026-11-18:
// ANFU CONSULTING in recherche-entreprises.api.gouv.fr and societe.com; GitHub, Inc. address in
// https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement ;
// GitHub Pages IP logging in https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages ;
// browser storage: assets/site.js sets no cookie and uses no local or session storage.
// Update this file before the contact form starts sending messages through a server.
const updated='18 novembre 2026';
const contact='<a class="text-link" href="mailto:lucas.lenoir@100pilot.ai">lucas.lenoir@100pilot.ai</a>';
const company='ANFU CONSULTING, société par actions simplifiée (SAS) au capital de 10&nbsp;000&nbsp;€';
const companyShort='ANFU CONSULTING (SAS, 22 rue Mstislav Rostropovitch, 75017 Paris, RCS Paris 900&nbsp;002&nbsp;940)';

export const legalPages=[
 {id:'L001',family:'Légal',role:'Informations légales',url:'/mentions-legales/',h1:'Mentions légales',title:'Mentions légales | 100 Pilot',intro:'Qui édite le site 100pilot.ai, qui en est responsable et où il est hébergé.',refs:'',links:'',angle:''},
 {id:'L002',family:'Légal',role:'Informations légales',url:'/confidentialite/',h1:'Politique de confidentialité',title:'Politique de confidentialité | 100 Pilot',intro:'Ce que deviennent les informations que vous nous transmettez lorsque vous nous écrivez depuis ce site ou par email.',refs:'',links:'',angle:''}
];

const section=(title,html)=>`<section><h2>${title}</h2>${html}</section>`;

const pages={
 L001:()=>[
  section('Éditeur du site',`<p>Le site 100pilot.ai est édité par ${company}.</p><ul><li>Siège social : 22 rue Mstislav Rostropovitch, 75017 Paris</li><li>RCS Paris 900&nbsp;002&nbsp;940</li><li>Numéro de TVA intracommunautaire : FR58900002940</li></ul><p>100pilot (100pilot.ai) est une activité d’ANFU CONSULTING.</p>`),
  section('Directeur de la publication','<p>Pascal Duriez, Président d’ANFU CONSULTING.</p>'),
  section('Contact',`<p>Pour toute question sur le site ou sur nos services, écrivez-nous à ${contact}.</p>`),
  section('Hébergement','<p>Le site est hébergé par GitHub, Inc. (service GitHub Pages), 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.</p>'),
  section('Données personnelles','<p>Le traitement des informations que vous nous transmettez est décrit dans la <a class="text-link" href="/confidentialite/">politique de confidentialité</a>.</p>'),
  `<p class="quiet">Dernière mise à jour : ${updated}.</p>`
 ].join(''),
 L002:()=>[
  section('Responsable du traitement',`<p>Le responsable du traitement est ${companyShort}, qui exerce l’activité 100pilot. Contact : ${contact}.</p>`),
  section('Les données concernées','<p>Nous traitons les informations que vous choisissez de nous envoyer :</p><ul><li>celles demandées par le formulaire de contact : votre nom, votre entreprise, votre email professionnel, le sujet du projet, vos outils actuels (facultatif) et la description de la tâche à automatiser ;</li><li>les emails que vous nous adressez et les informations qu’ils contiennent.</li></ul><p>Le formulaire de contact ne transmet rien à un serveur : il prépare un email que vous relisez, puis envoyez depuis votre propre messagerie. Nous ne recevons ces informations que si vous envoyez ce message.</p>'),
  section('Pourquoi nous les utilisons','<ul><li>Répondre à votre demande et préparer, le cas échéant, une proposition : ce traitement repose sur des mesures précontractuelles prises à votre demande (article 6.1.b du RGPD).</li><li>Suivre la relation commerciale qui en découle : ce traitement repose sur notre intérêt légitime (article 6.1.f du RGPD).</li></ul>'),
  section('Durée de conservation','<p>Ces données sont conservées pendant trois ans à compter du dernier contact de votre part.</p>'),
  section('Qui y a accès','<p>Seule l’équipe 100pilot accède à ces données. Notre messagerie est fournie par Google Workspace : les emails échangés avec nous sont donc conservés dans ce service.</p>'),
  section('Hébergement du site','<p>Le site est hébergé par GitHub Pages (GitHub, Inc.). Selon la documentation de GitHub, l’adresse IP des visiteurs d’un site GitHub Pages est enregistrée et conservée par GitHub pour des raisons de sécurité.</p>'),
  section('Transferts hors de l’Union européenne','<p>GitHub, Inc. et Google LLC sont établis aux États-Unis. Ces transferts reposent sur le cadre de protection des données UE–États-Unis (Data Privacy Framework), auquel ces deux sociétés déclarent se conformer.</p>'),
  section('Cookies et stockage dans votre navigateur','<p>Ce site ne dépose aucun cookie publicitaire. Son script n’enregistre aucune information dans votre navigateur : ni cookie, ni stockage local. Il sert au menu, aux exemples par onglets et à la préparation de votre message de contact ; le texte que vous saisissez reste dans la page jusqu’à ce que vous l’envoyiez depuis votre messagerie, le copiiez ou le téléchargiez.</p>'),
  section('Vos droits',`<p>Vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition, de limitation du traitement et de portabilité de vos données. Pour exercer ces droits, écrivez à ${contact}.</p><p>Vous pouvez également introduire une réclamation auprès de la Commission nationale de l’informatique et des libertés (CNIL), sur <a class="text-link" href="https://www.cnil.fr/fr/plaintes">cnil.fr</a>.</p>`),
  `<p class="quiet">Dernière mise à jour : ${updated}.</p>`
 ].join('')
};

export function legalContent(p){
 if(!pages[p.id])throw Error('Missing legal page content: '+p.id);
 return `<section class="section wrap"><div class="prose legal-text">${pages[p.id]()}</div></section>`;
}

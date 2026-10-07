// Source names stay in the private ledger; public content uses sector descriptions.
export const routeChanges={
 '/realisations/pvd-automatisation-odoo/':'/realisations/distribution-b2b-automatisation-odoo/',
 '/realisations/pvd-stocks-fournisseurs/':'/realisations/distribution-b2b-stocks-fournisseurs/',
 '/realisations/pvd-rapprochement-crm/':'/realisations/distribution-b2b-rapprochement-crm/',
 '/etudes/fava-sport-automatisation/':'/etudes/sport-textile-automatisation/',
 '/etudes/fava-commandes-stocks/':'/etudes/sport-textile-commandes-stocks/',
 '/etudes/fava-factures-frais/':'/etudes/sport-textile-factures-frais/'
};
const replacements=[
 ['PVD :','Distribution B2B :'],['FAVA Sport :','Sport & textile :'],
 ['Le dossier PVD','Le cas du distributeur B2B'],['le dossier PVD','le cas du distributeur B2B'],
 ['Le moteur de stocks PVD','Le moteur de stocks du distributeur'],['Le workflow PVD','Le workflow du distributeur'],
 ['Le périmètre PVD','Le périmètre du distributeur'],['le périmètre PVD','le périmètre du distributeur'],
 ['pour PVD','pour un distributeur B2B'],
 ['Le cadrage FAVA Sport','Le cadrage de l’équipementier sport et textile'],['le cadrage FAVA Sport','le cadrage de l’équipementier sport et textile'],
 ['Le cadrage FAVA','Le cadrage de l’équipementier'],['le cadrage FAVA','le cadrage de l’équipementier'],
 ['L’étude FAVA Sport','L’étude sport et textile'],['l’étude FAVA Sport','l’étude sport et textile'],
 ['L’étude FAVA','L’étude sport et textile'],['l’étude FAVA','l’étude sport et textile'],
 ['le scénario FAVA Sport','le scénario sport et textile'],['Le scénario FAVA Sport','Le scénario sport et textile'],
 ['le scénario FAVA','le scénario sport et textile'],['Le scénario FAVA','Le scénario sport et textile'],
 ['Pour FAVA Sport','Pour un équipementier sport et textile'],['chez FAVA Sport','chez un équipementier sport et textile'],
 ['FAVA Sport est-il présenté comme un projet livré ?','Ce cadrage est-il présenté comme un projet livré ?'],
 ['FAVA Sport','sport et textile'],['FAVA','sport et textile'],['PVD','distribution B2B']
];
export function publicCopy(value){
 if(typeof value==='string'){
   for(const [oldUrl,newUrl] of Object.entries(routeChanges))value=value.split(oldUrl).join(newUrl);
   for(const [oldText,newText] of replacements)value=value.split(oldText).join(newText);
   return value;
 }
 if(Array.isArray(value))return value.map(publicCopy);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,publicCopy(v)]));
 return value;
}

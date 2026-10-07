# 100 Pilot — catalogue complet en aperçu

Site français avec **110 pages et 47 workflows décrits**. La marque part du passage du pilotage manuel au pilote automatique. Trois parcours — direction de PME, ventes et opérations — relient le quotidien de l’équipe aux services, solutions, cas, études, secteurs, intégrations et guides.

## Utilisation locale

```powershell
npm run build
npm run dev
npm run check
```

`start-local.ps1` peut utiliser le runtime Node fourni par Codex. Le serveur écoute sur `http://127.0.0.1:18762/` et sert uniquement `dist`.

## Sources et contenu

- `workflow-catalog.mjs` : les 47 tâches, gains recherchés et exemples.
- `human-copy.mjs` : révision éditoriale des titres, introductions, bénéfices et questions propres à chaque tâche.
- `page-catalog.mjs` : périmètres des pages et faits propres aux cas.
- `reader-detail.mjs` : présentation des gains, exemples et livrables.
- `catalogue-ui.mjs` : accueil, services et navigation par besoin.
- `brand-system.mjs` : logo, trois parcours clients, pages et exemples interactifs.
- `task-visuals.mjs` : schémas illustratifs propres aux 47 tâches et aux cas de synthèse.
- `core-pages.mjs` : textes de l’agence et du déroulement d’un premier projet.
- `assets/site.css` et `assets/site.js` : design et interactions.
- `build.mjs` : génération des pages et des données structurées.
- `page-manifest.json` : routes, métadonnées et liens vers les sources internes.
- `workflow-coverage.json` : correspondance des 47 workflows avec les pages.

L’inventaire privé `source-inventory.json` n’est jamais copié dans `dist`. Les cinq anciennes pages clients sont fusionnées dans les cas anonymisés. Les propositions, prototypes internes et travaux documentés portent des statuts distincts. Aucun gain chiffré non mesuré n’est attribué à un client. Les exemples en HTML/SVG sont identifiés comme illustratifs, sans représentation d’une installation client. Les anciennes images 3D ne sont plus utilisées dans les pages.

## Contact

Le formulaire prépare un email destiné à **lucas.lenoir@100pilot.ai**. Le visiteur le relit et ouvre sa messagerie pour l’envoyer. Il peut aussi copier ou télécharger le texte. Le serveur ne stocke pas de demandes et n’envoie pas automatiquement d’emails.

## Vérification

`npm run check` contrôle toutes les pages, les liens et images, les titres et descriptions uniques, les canoniques, les données structurées, les erreurs 404 et la présence visible des tâches ou exemples des 47 workflows. `verification.json` conserve le résultat ; `qa` contient les vérifications du navigateur et captures ordinateur/mobile.

La révision éditoriale applique Humanizer (blader/humanizer) et Copy-editing (coreyhaines31/marketingskills), dont les instructions sont conservées dans `.editorial/skills`. Les textes partent des tâches et résultats attendus, les questions sont propres au sujet, et les détails de construction restent secondaires. Les cartes de cas précisent le travail réel ou proposé. Les sources, statuts et limites sont conservés ; aucun témoignage, chiffre de gain ni garantie commerciale n’a été inventé. `qa/editorial-review-v4.json` conserve le contrôle de cette révision. Le site n’utilise pas de score de détection IA comme preuve de qualité rédactionnelle.

La V5 applique la plateforme de marque fournie par Pascal : forêt et menthe, typographie éditoriale et symbole de trajectoire. Le logo SVG et sa version favicon sont dans `assets`. L’accueil propose trois exemples accessibles par onglets et au clavier. Les décisions et exceptions restent à l’équipe. Les lots fixes de trois tâches, audits gratuits, délais et chiffres illustratifs de la plateforme ne sont pas des engagements publiés. La méthode explique comment comparer le travail manuel au test, en comptant le temps de revue. La version précédente est conservée dans `.editorial/before-brand-v5`. `qa/brand-review-v5.json` conserve les contrôles de cette refonte.

## Partage et publication

Le tunnel temporaire existant sert cet aperçu depuis le laptop. Ses coordonnées sont dans `.preview-tools/share-state.json`. Il nécessite que le laptop reste allumé, connecté et sans veille. `stop-share.ps1` l’arrête.

L’aperçu reste non indexable : `indexable: false`, `publicOrigin: null`, robots bloqués et en-tête `noindex`. Les canoniques et le sitemap restent locaux. Aucun déploiement permanent n’a été réalisé.

Pour publier sur un domaine définitif, il reste à configurer l’hébergement, l’origine publique, l’indexation et les informations légales effectives. Le contenu et les liens sont préparés pour cette étape ; cet aperçu ne constitue pas encore un site de production indexable.

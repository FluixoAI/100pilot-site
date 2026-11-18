// Renders assets/og-image.png, the 1200x630 sharing preview used by og:image on every page.
// Nothing is installed: it drives an existing Chromium through an existing playwright-core module.
// On workers-dev:
//   PLAYWRIGHT_CORE=/opt/fluixo/mesure/node_modules/playwright-core node qa/render-og-image.mjs
// Brand: forest #04342C, mint #E1F5EE, trajectory mark and colours of assets/logo-mark.svg,
// wordmark as in the site footer, Georgia/Segoe UI with the same fallbacks as assets/site.css.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'assets','og-image.png');
const module=process.env.PLAYWRIGHT_CORE?pathToFileURL(path.join(process.env.PLAYWRIGHT_CORE,'index.mjs')).href:'playwright-core';
const {chromium}=await import(module);

const mark=(size,dash,arrow)=>`<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M10 47h11V34h10" stroke="${dash}" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 5"/><path d="M29 34c13 0 5-18 22-18h3m-7-6 7 6-7 6" stroke="${arrow}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const html=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px}
body{background:#04342C;color:#F3FAF2;font-family:'Segoe UI','Liberation Sans',Arial,sans-serif;position:relative;overflow:hidden}
.frame{position:absolute;inset:0;padding:72px 84px 64px;display:flex;flex-direction:column;justify-content:space-between}
.brand{display:flex;align-items:center;gap:18px;font-size:46px;font-weight:700;letter-spacing:-.05em;line-height:1;color:#EDF7EA}
.brand .ai{color:#8BCEB0;font-weight:400}
.brand .tile{width:76px;height:76px;border-radius:18px;background:#0B4A3E;display:flex;align-items:center;justify-content:center}
h1{font-family:Georgia,'Times New Roman','Liberation Serif',serif;font-weight:400;font-size:86px;line-height:1.04;letter-spacing:-.035em;max-width:760px;color:#F3FAF2}
.line{display:flex;align-items:center;gap:16px;font-size:28px;color:#BAD0BF;border-top:1px solid #385C48;padding-top:28px}
.line:before{content:'';width:28px;height:3px;background:#1D9E75;flex-shrink:0}
.art{position:absolute;right:10px;top:104px}
</style></head><body>
<div class="art">${mark(460,'#2F6A58','#1D9E75')}</div>
<div class="frame">
 <div class="brand"><span class="tile">${mark(76,'#86B4A2','#E1F5EE')}</span><span>100pilot<span class="ai">.ai</span></span></div>
 <h1>Automatisation et IA pour les PME</h1>
 <div class="line">Du pilotage manuel au pilote automatique.</div>
</div>
</body></html>`;

const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
 await page.setContent(html,{waitUntil:'load'});
 const fonts=await page.evaluate(()=>[...document.querySelectorAll('h1,.brand,.line')].map(e=>getComputedStyle(e).fontFamily));
 await page.screenshot({path:out,type:'png',clip:{x:0,y:0,width:1200,height:630}});
 const png=await fs.readFile(out);
 console.log(JSON.stringify({file:path.relative(root,out),bytes:png.length,width:png.readUInt32BE(16),height:png.readUInt32BE(20),fonts}));
}finally{await browser.close();}

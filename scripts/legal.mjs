const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderAppDocument({lang,app,type,document,auto=false,profile,locales,ui,versions}) {
  const t=ui[lang],languages=locales[app.id],homeLang=lang==='tr'?'tr':'en';
  const route=`apps/${app.id}/${type}/`,url=`${profile.url}/${lang}/${route}`;
  const title=`${app.name} — ${t[type==='delete-account'?'deletion':type]}`;
  const headings=[];
  const html=document.html.replace(/[\t ]+$/gm,'').replace(/<h([234])[^>]*>([\s\S]*?)<\/h\1>/g,(_,level,content)=>{
    const id=`section-${headings.length+1}`;
    headings.push({id,text:content.replace(/<[^>]*>/g,'')});
    return `<h${level} id="${id}">${content}</h${level}>`;
  });
  const types=app.id==='cep-sozlugum'?['privacy','terms','delete-account']:['privacy','terms'];
  return `<!doctype html><html lang="${lang}"${lang==='ar'?' dir="rtl"':''}><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#080d17">
<title>${escape(title)} — Hakan Karateke</title><meta name="description" content="${escape(title)}. Hakan Karateke.">
<link rel="canonical" href="${url}">${languages.map(l=>`<link rel="alternate" hreflang="${l}" href="${profile.url}/${l}/${route}">`).join('')}<link rel="alternate" hreflang="x-default" href="${profile.url}/${route}">
<meta property="og:type" content="website"><meta property="og:title" content="${escape(title)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${profile.url}/assets/${app.id}-icon.webp">
<link rel="icon" href="/assets/${app.id}-icon.webp" type="image/webp"><link rel="stylesheet" href="/assets/style.css?v=${versions['style.css']}"><link rel="stylesheet" href="/assets/legal.css?v=${versions['legal.css']}">
<script src="/assets/language.js?v=${versions['language.js']}"></script>${auto?`<script>window.chooseLanguage(${JSON.stringify(route)},${JSON.stringify(languages)});</script>`:''}
</head><body id="top" class="app-document"><a class="skip" href="#main">${t.skip}</a>
<header class="site-header"><div class="container header-inner"><a class="brand" href="/${homeLang}/" aria-label="Hakan Karateke"><span class="brand-mark" aria-hidden="true" dir="ltr">h<span>k</span><i>.</i></span><span class="brand-name" dir="ltr">HAKAN<br>KARATEKE</span></a><nav class="legal-header-nav" aria-label="${t.legal}"><a href="/${homeLang}/">${t.home}</a><a href="/${homeLang}/legal/">${t.legal}</a></nav></div></header>
<main id="main" class="container legal-main"><div class="document-heading"><img class="document-app-icon" src="/assets/${app.id}-icon.webp" alt="${escape(app.name)}" width="80" height="80"><div><p class="eyebrow">${t.documents}</p><h1>${escape(title)}</h1></div></div>
<nav class="document-languages" aria-label="${t.language}"><span class="document-language-label">${t.language}</span><div>${languages.map(l=>`<a href="/${l}/${route}" lang="${l}" hreflang="${l}" dir="auto" data-language="${l}"${l===lang?' aria-current="page"':''}>${ui[l].name}</a>`).join('')}</div></nav>
<nav class="document-tabs" aria-label="${t.documents}">${types.map(kind=>`<a href="/${lang}/apps/${app.id}/${kind}/"${kind===type?' aria-current="page"':''}>${t[kind==='delete-account'?'deletion':kind]}</a>`).join('')}</nav>
<div class="document-meta"><span>${t.updated}: <time datetime="${document.date}">${new Intl.DateTimeFormat(lang,{dateStyle:'long',timeZone:'UTC'}).format(new Date(document.date))}</time></span></div>
${document.notice?`<p class="document-notice">${escape(document.notice)}</p>`:''}
<div class="document-layout"><aside class="toc"><p class="eyebrow">${t.contents}</p><ol>${headings.map(h=>`<li><a href="#${h.id}">${h.text}</a></li>`).join('')}</ol></aside><article class="legal-content">${html}</article></div></main>
<footer class="footer"><div class="container footer-top"><a class="footer-name" href="/${homeLang}/" dir="ltr">Hakan Karateke<span>.</span></a><div class="footer-links"><a href="mailto:hakankarateke231@gmail.com">${t.contact}</a><a href="/${homeLang}/privacy/">${t.sitePrivacy}</a><a href="#top">${t.top} ↑</a></div></div><div class="container footer-bottom"><span dir="ltr">© 2026 Hakan Karateke</span><span dir="auto">${escape(app.name)}</span></div></footer>
<script src="/assets/app.js?v=${versions['app.js']}" defer></script></body></html>`;
}

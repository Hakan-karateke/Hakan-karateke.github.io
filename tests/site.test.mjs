import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..');
const docs=path.join(root,'docs');
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(d=>d.isDirectory()?files(path.join(dir,d.name)):path.join(dir,d.name)))).flat();}
const htmlFiles=(await files(docs)).filter(f=>f.endsWith('.html'));
test('all internal links, fragments, scripts and images resolve',async()=>{
  for(const file of htmlFiles){
    const html=await readFile(file,'utf8');
    for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
      if(!url.startsWith('/')&&!url.startsWith('#'))continue;
      const [pathname,hash]=url.split('#');
      let target=pathname?path.join(docs,decodeURIComponent(pathname.split('?')[0])):file;
      const info=await stat(target).catch(()=>null);
      assert.ok(info,`${path.relative(docs,file)} → missing ${url}`);
      if(info.isDirectory())target=path.join(target,'index.html');
      const content=await readFile(target);
      if(hash)assert.ok(content.toString().includes(`id="${hash}"`),`${file}: missing #${hash} in ${target}`);
    }
  }
});
test('localized and neutral permanent routes exist',async()=>{
  for(const locale of ['tr/','en/',''])for(const route of ['','legal/','privacy/','apps/yansi/privacy/','apps/yansi/terms/','apps/cep-sozlugum/privacy/','apps/cep-sozlugum/terms/','apps/cep-sozlugum/delete-account/']){
    const html=await readFile(path.join(docs,locale,route,'index.html'),'utf8');
    assert.ok(html.includes('<main id="main"'));
    assert.ok(html.includes('hreflang="tr"')&&html.includes('hreflang="en"'));
    if(locale)assert.ok(html.includes(`<html lang="${locale.slice(0,2)}">`));
  }
});
test('language negotiation respects primary locale, explicit preference and blocked storage',async()=>{
  const script=await readFile(path.join(root,'assets/language.js'),'utf8');
  for(const [languages,stored,expected,blocked] of [[['tr-TR'],null,'tr'],[['en-US','tr-TR'],null,'en'],[['de-DE'],null,'en'],[['tr-TR'],'en','en'],[['en-US'],'tr','tr'],[['tr-TR'],'invalid','tr'],[['tr-TR'],null,'tr',true]]){
    let selected;
    const context={window:{},navigator:{languages},localStorage:{getItem(){if(blocked)throw Error();return stored;}},location:{search:'?source=test',hash:'#section-2',replace(url){selected=url;}}};
    vm.runInNewContext(script,context);context.window.chooseLanguage('apps/yansi/privacy/');
    assert.equal(selected,`/${expected}/apps/yansi/privacy/?source=test#section-2`);
  }
});
test('no private repository links or unrequested company project details are published',async()=>{
  const approved=['Hakan-karateke','lung-focused-vit-cxr','Patient-Registration-and-Examination-System'];
  for(const file of htmlFiles){
    const html=await readFile(file,'utf8');
    for(const [,repo] of html.matchAll(/https:\/\/github\.com\/Hakan-karateke\/([^"\s<#?]+)/g))assert.ok(approved.includes(repo),`Unapproved repository: ${repo}`);
    assert.ok(!/randevu.?merkezi|ReflectSquad|multi-tenant career|20\+ bank|25 bank|kariyer platform/i.test(html));
    assert.ok(!/AIza[\w-]{30}|ghp_[\w]{20}|github_pat_[\w]{20}/.test(html));
  }
});
test('migrated privacy policy bodies contain no executable HTML or external embeds',async()=>{
  const policies=JSON.parse(await readFile(path.join(root,'data/privacy.json'),'utf8'));
  for(const langs of Object.values(policies))for(const p of Object.values(langs)){
    assert.ok(!/<(?:script|iframe|object|embed|style)\b|\son\w+\s*=|javascript:/i.test(p.html));
    assert.ok(p.html.includes('hakankarateke231@gmail.com'));
    assert.ok(!p.source);
  }
  assert.ok(policies['cep-sozlugum'].tr.html.includes('Crashlytics'));
  assert.ok(policies['cep-sozlugum'].tr.html.includes('30 gün'));
});
test('home pages have one primary heading, unique ids and local assets only',async()=>{
  for(const lang of ['tr','en']){
    const html=await readFile(path.join(docs,lang,'index.html'),'utf8');
    assert.equal([...html.matchAll(/<h1\b/g)].length,1);
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
    assert.equal(new Set(ids).size,ids.length);
    assert.ok(!/<(?:img|script|link)[^>]+(?:src|href)="https?:/i.test(html.replace(/<link rel="(?:canonical|alternate)"[^>]+>/g,'')));
    assert.equal([...html.matchAll(/data-category=/g)].length,4);
  }
});
test('all supplied credentials are published in both languages with clean destination links',async()=>{
  const profile=JSON.parse(await readFile(path.join(root,'data/profile.json'),'utf8'));
  assert.equal(profile.certificates.length,10);
  for(const lang of ['tr','en']){
    const html=await readFile(path.join(docs,lang,'credentials/index.html'),'utf8');
    assert.equal([...html.matchAll(/class="credential-card"/g)].length,10);
    assert.ok(!html.includes('linkedin.com/safety/go'));
    assert.ok(!html.includes('profileId='));
    for(const c of profile.certificates)assert.ok(html.includes(c.url),`Missing credential ${c.name}`);
  }
});

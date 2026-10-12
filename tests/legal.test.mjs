import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..');
const locales=JSON.parse(await readFile(path.join(root,'data/app-locales.json'),'utf8'));
const page=(locale,app,type)=>readFile(path.join(root,'docs',locale,'apps',app,type,'index.html'),'utf8');

test('every app document offers working equivalent-language links and its app icon',async()=>{
  const sitemap=await readFile(path.join(root,'docs/sitemap.xml'),'utf8');
  for(const [app,languages] of Object.entries(locales)) {
    const types=app==='cep-sozlugum'?['privacy','terms','delete-account']:['privacy','terms'];
    for(const type of types)for(const lang of [...languages,'']) {
      const html=await page(lang,app,type),rendered=lang||'en';
      assert.ok(html.includes(`<html lang="${rendered}"`));
      assert.ok(html.includes(`src="/assets/${app}-icon.webp"`));
      assert.equal([...html.matchAll(/<h1\b/g)].length,1);
      assert.ok(!/<a(?:\s[^>]*)?>/g.test(html.replace(/<a\b[^>]*href="[^"]+"[^>]*>/g,'')),'No inert anchors');
      assert.ok(!/sites\.google\.com|print-button|window\.print|href="[^"]*\.pdf(?:["?])|\sdownload(?:=|[ >])|Review draft|İnceleme taslağı/.test(html));
      const languageNav=html.match(/<nav class="document-languages"[\s\S]*?<\/nav>/)[0];
      assert.equal([...languageNav.matchAll(/aria-current="page"/g)].length,1);
      for(const target of languages){
        const route=`/${target}/apps/${app}/${type}/`;
        assert.ok(languageNav.includes(`href="${route}"`));
        assert.ok(html.includes(`hreflang="${target}"`));
        assert.ok(sitemap.includes(route));
      }
      if(rendered==='ar')assert.ok(html.includes('dir="rtl"'));
      if(app==='yansi')assert.equal([...html.matchAll(/<h2 id="section-/g)].length,type==='privacy'?9:10);
      const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
      assert.equal(ids.length,new Set(ids).size);
      if(lang)assert.ok(!html.includes('window.chooseLanguage('),'Explicit language must never redirect');
    }
  }
});

test('neutral links select an app-supported locale and preserve deep links',async()=>{
  const script=await readFile(path.join(root,'assets/language.js'),'utf8');
  for(const [app,primary,stored,expected,blocked] of [
    ['yansi','de-DE',null,'de'],['yansi','ar-SA',null,'ar'],['yansi','zh-Hans-CN',null,'zh'],
    ['yansi','fr-FR',null,'en'],['yansi','en-US','zh','zh'],['yansi','de-DE','invalid','de'],
    ['yansi','ar-EG',null,'ar',true],['cep-sozlugum','de-DE','de','en'],['cep-sozlugum','tr-TR','ar','tr']
  ]) {
    let destination;
    const context={window:{},navigator:{languages:[primary]},localStorage:{getItem(){if(blocked)throw Error();return stored;}},location:{search:'?source=app',hash:'#section-4',replace(url){destination=url;}}};
    vm.runInNewContext(script,context);
    context.window.chooseLanguage(`apps/${app}/privacy/`,locales[app]);
    assert.equal(destination,`/${expected}/apps/${app}/privacy/?source=app#section-4`);
    assert.ok((await page('',app,'privacy')).includes(JSON.stringify(locales[app])));
  }
});

test('translations retain local permissions, sharing details and privacy cross-links',async()=>{
  for(const lang of locales.yansi){
    const html=await page(lang,'yansi','privacy');
    for(const detail of ['BLUETOOTH_SCAN','NEARBY_WIFI_DEVICES','POST_NOTIFICATIONS','shared_preferences','nearby_connections','hakankarateke231@gmail.com'])assert.ok(html.includes(detail),`${lang}: ${detail}`);
    assert.ok((await page(lang,'yansi','terms')).includes(`href="/${lang}/apps/yansi/privacy/"`));
  }
});

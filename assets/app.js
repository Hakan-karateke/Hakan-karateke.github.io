(() => {
  const lang=document.documentElement.lang;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)'),finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  const page=document.documentElement,canvas=document.getElementById('quantum-canvas');
  document.querySelectorAll('[data-language]').forEach(link=>link.addEventListener('click',()=>{
    try{localStorage.setItem('hk-language',link.dataset.language);}catch{}
    if(location.hash)link.hash=location.hash;
  }));
  const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
  const closeMenu=()=>{menu?.setAttribute('aria-expanded','false');nav?.classList.remove('is-open');};
  menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
  let requestUpdate=()=>{};
  const filters=document.querySelectorAll('[data-filter]');
  filters.forEach(button=>button.addEventListener('click',()=>{
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    let count=0;
    document.querySelectorAll('[data-category]').forEach(card=>{
      card.hidden=button.dataset.filter!=='all'&&button.dataset.filter!==card.dataset.category;
      if(!card.hidden){count++;card.classList.add('is-visible');}
    });
    const status=document.querySelector('#filter-status');
    if(status)status.textContent=lang==='tr'?`${count} çalışma gösteriliyor.`:`Showing ${count} projects.`;
    requestUpdate();
  }));
  if(!canvas)return;
  const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
  const sceneElement=document.querySelector('.quantum'),hero=document.querySelector('.hero'),toggle=document.getElementById('motion-toggle');
  const progressBar=document.querySelector('.reading-progress'),progressText=document.querySelector('.reading-value'),meter=document.querySelector('.reading-meter');
  const phaseLabel=document.querySelector('.quantum-phase');
  const chapters=[...document.querySelectorAll('[data-chapter]')],chapterLinks=[...document.querySelectorAll('.chapter-nav a')];
  const sections=[...document.querySelectorAll('.hero, main > section[id]')];
  const revealElements=[...document.querySelectorAll('.section-heading,.section-intro,.about-prose,.skill-group,.project-card,.publication,.timeline-item,.certificates,.contact-section > h2,.contact-email')];
  let paused=reducedMotion.matches,frame=0,clock=0,previous=0,scene,scrollDirty=true;
  let progress=0,heroProgress=0,targetProgress=0,pointerX=0,pointerY=0,targetX=0,targetY=0;
  let activeCard=null,tiltX=0,tiltY=0,targetTiltX=0,targetTiltY=0;
  let metrics=[],maxScroll=1,heroHeight=800,heroAnchor=700,needsMeasurement=true;
  const phases=lang==='tr'?['SÜPERPOZİSYON','OLASILIK ALANI','DOLANIKLIK','YENİ OLASILIKLAR']:['SUPERPOSITION','PROBABILITY FIELD','ENTANGLEMENT','NEW POSSIBILITIES'];
  const motionAllowed=()=>!paused&&!reducedMotion.matches;
  function resetCard(){
    if(activeCard){['--tilt-x','--tilt-y','--shine-x','--shine-y'].forEach(p=>activeCard.style.removeProperty(p));activeCard.classList.remove('is-tilting');activeCard=null;}
    tiltX=tiltY=targetTiltX=targetTiltY=0;
  }
  function updateMotionState(){
    page.classList.toggle('motion-paused',!motionAllowed());
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.disabled=reducedMotion.matches;
    const label=reducedMotion.matches?toggle.dataset.reduced:paused?toggle.dataset.resume:toggle.dataset.pause;
    toggle.setAttribute('aria-label',label);toggle.querySelector('.motion-label').textContent=label;
    toggle.querySelector('.motion-icon').textContent=paused?'▷':'Ⅱ';
    if(!motionAllowed()){
      resetCard();page.style.setProperty('--hero-shift','0px');page.style.setProperty('--hero-rotate','0deg');
      revealElements.forEach(el=>el.classList.add('is-visible'));
    }
    requestUpdate();
  }
  function measure(){
    maxScroll=Math.max(1,document.documentElement.scrollHeight-innerHeight);heroHeight=hero.offsetHeight;
    heroAnchor=hero.querySelector('.hero-copy').getBoundingClientRect().bottom+scrollY+180;
    metrics=sections.map(el=>({el,top:el.getBoundingClientRect().top+scrollY}));
    scene?.resize(innerWidth,innerHeight);needsMeasurement=false;
  }
  function updateScroll(){
    if(needsMeasurement)measure();
    targetProgress=clamp(scrollY/maxScroll);heroProgress=clamp(scrollY/Math.max(heroHeight*.78,1));
    const percent=Math.round(targetProgress*100);
    progressBar.style.transform=`scaleX(${targetProgress})`;progressText.textContent=String(percent).padStart(2,'0');meter.setAttribute('aria-valuenow',String(percent));
    page.classList.toggle('has-scrolled',scrollY>35);
    let current=0;for(let i=0;i<metrics.length;i++)if(scrollY+innerHeight*.36>=metrics[i].top)current=i;
    chapters.forEach((el,i)=>el.classList.toggle('is-active',i===current));
    chapterLinks.forEach((a,i)=>{if(i===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    const id=metrics[current]?.el.id;nav.querySelectorAll('a').forEach(a=>a.classList.toggle('is-current',a.hash==='#'+id));
    if(motionAllowed()){page.style.setProperty('--hero-shift',`${-heroProgress*72}px`);page.style.setProperty('--hero-rotate',`${heroProgress*5}deg`);}
    scrollDirty=false;
  }
  function animate(now){
    frame=0;if(document.hidden)return;
    const dt=Math.min((now-(previous||now))/1000,.05);previous=now;
    if(scrollDirty||needsMeasurement)updateScroll();
    const allowed=motionAllowed(),ease=1-Math.exp(-dt*8);
    progress+=(targetProgress-progress)*ease;pointerX+=(targetX-pointerX)*ease;pointerY+=(targetY-pointerY)*ease;
    if(allowed)clock+=dt;
    if(scene&&(allowed||!scene.layout)){
      const layout=scene.draw({progress:allowed?progress:0,hero:heroProgress,time:allowed?clock:0,pointerX:allowed?pointerX:0,pointerY:allowed?pointerY:0,reduced:!allowed,heroAnchor});
      if(layout){
        sceneElement.style.setProperty('--field-x',`${layout.centerX}px`);sceneElement.style.setProperty('--field-y',`${layout.centerY}px`);
        sceneElement.style.setProperty('--field-size',`${layout.scale*2.8}px`);sceneElement.style.setProperty('--field-alpha',String(layout.opacity));
        sceneElement.style.setProperty('--orbit-angle',`${clock*4+progress*420}deg`);sceneElement.style.setProperty('--orbit-tilt',`${58+Math.sin(progress*Math.PI*2)*24}deg`);
        if(sceneElement.dataset.phase!==String(layout.phase)){
          phaseLabel.textContent=phases[layout.phase];sceneElement.dataset.phase=String(layout.phase);
        }
      }
    }
    if(activeCard&&allowed){
      tiltX+=(targetTiltX-tiltX)*ease;tiltY+=(targetTiltY-tiltY)*ease;
      activeCard.style.setProperty('--tilt-x',`${tiltX.toFixed(2)}deg`);activeCard.style.setProperty('--tilt-y',`${tiltY.toFixed(2)}deg`);
    }
    if(allowed)frame=requestAnimationFrame(animate);
  }
  requestUpdate=()=>{if(!frame&&!document.hidden)frame=requestAnimationFrame(animate);};
  // Native scrolling stays untouched; it drives the scene and chapter indicator.
  addEventListener('scroll',()=>{scrollDirty=true;requestUpdate();},{passive:true});
  addEventListener('resize',()=>{needsMeasurement=true;scrollDirty=true;if(scene)scene.layout=null;requestUpdate();},{passive:true});
  new ResizeObserver(()=>{needsMeasurement=true;scrollDirty=true;requestUpdate();}).observe(document.querySelector('main'));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;previous=0;}else{scrollDirty=true;requestUpdate();}});
  document.addEventListener('pointermove',e=>{if(!motionAllowed()||!finePointer.matches)return;targetX=(e.clientX/innerWidth-.5)*2;targetY=(e.clientY/innerHeight-.5)*2;},{passive:true});
  page.addEventListener('pointerleave',()=>{targetX=targetY=0;resetCard();});
  document.querySelectorAll('.project-card,.publication').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      if(!motionAllowed()||!finePointer.matches)return;
      if(activeCard!==card){resetCard();activeCard=card;card.classList.add('is-tilting');}
      const rect=card.getBoundingClientRect(),x=clamp((e.clientX-rect.left)/rect.width),y=clamp((e.clientY-rect.top)/rect.height);
      targetTiltX=(.5-y)*5;targetTiltY=(x-.5)*7;
      card.style.setProperty('--shine-x',`${x*100}%`);card.style.setProperty('--shine-y',`${y*100}%`);
    },{passive:true});
    card.addEventListener('pointerleave',resetCard);
  });
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.08,rootMargin:'0px 0px 35px 0px'});
  revealElements.forEach((el,i)=>{
    el.classList.add('reveal');el.style.setProperty('--reveal-delay',`${i%3*55}ms`);
    if(!motionAllowed()||el.getBoundingClientRect().top<innerHeight)el.classList.add('is-visible');else observer.observe(el);
  });
  document.addEventListener('focusin',e=>e.target.closest('.reveal')?.classList.add('is-visible'));
  toggle.addEventListener('click',()=>{paused=!paused;updateMotionState();});
  reducedMotion.addEventListener('change',e=>{paused=e.matches;if(scene)scene.layout=null;updateMotionState();});
  finePointer.addEventListener('change',resetCard);
  page.classList.add('experience-ready');updateMotionState();
  import(canvas.dataset.module).then(({QuantumScene})=>{
    scene=new QuantumScene(canvas,{onFallback:()=>sceneElement.classList.add('canvas-fallback')});needsMeasurement=true;requestUpdate();
  }).catch(()=>sceneElement.classList.add('canvas-fallback'));
})();

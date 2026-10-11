(() => {
  const lang=document.documentElement.lang;
  document.querySelectorAll('[data-language]').forEach(link=>link.addEventListener('click',()=>{
    try {localStorage.setItem('hk-language',link.dataset.language);} catch { /* Optional preference. */ }
    if(location.hash) link.hash=location.hash;
  }));
  const menu=document.querySelector('.menu-toggle'), nav=document.querySelector('#main-nav');
  const closeMenu=()=>{menu?.setAttribute('aria-expanded','false');nav?.classList.remove('is-open');};
  menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
  const filters=document.querySelectorAll('[data-filter]');
  filters.forEach(button=>button.addEventListener('click',()=>{
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    let count=0;
    document.querySelectorAll('[data-category]').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&button.dataset.filter!==card.dataset.category;if(!card.hidden)count++;});
    const status=document.querySelector('#filter-status');
    if(status)status.textContent=lang==='tr'?`${count} çalışma gösteriliyor.`:`Showing ${count} projects.`;
  }));
  document.querySelectorAll('.print-button').forEach(button=>button.addEventListener('click',()=>window.print()));
  const canvas=document.getElementById('quantum-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  if(!ctx)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduce.matches,visible=true,frame=0,t=0,last=0,size=650,dpr=1;
  const toggle=document.getElementById('motion-toggle');
  function setLabel(){if(!toggle)return;toggle.setAttribute('aria-pressed',String(paused));const label=paused?toggle.dataset.resume:toggle.dataset.pause;toggle.setAttribute('aria-label',label);toggle.querySelector('.motion-label').textContent=label;toggle.querySelector('span').textContent=paused?'▷':'Ⅱ';}
  const points=[];
  // A decorative particle torus, not a physical quantum simulation.
  for(let i=0;i<100;i++)for(let j=0;j<24;j++){
    const u=i/100*Math.PI*2,v=j/24*Math.PI*2;
    const minor=.26+.055*Math.sin(u*3);
    points.push({x:(1+minor*Math.cos(v))*Math.cos(u),y:(1+minor*Math.cos(v))*Math.sin(u),z:minor*Math.sin(v),phase:u});
  }
  function draw(){
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size,size);
    const a=.95+Math.sin(t*.12)*.13,b=-.55+t*.08,scale=size*.29;
    const ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);
    const projected=points.map(p=>{const x=p.x*cb-p.y*sb,y=p.x*sb+p.y*cb;return {x,y:y*ca-p.z*sa,z:y*sa+p.z*ca,phase:p.phase};}).sort((a,b)=>a.z-b.z);
    for(const p of projected){
      const perspective=3.7/(3.7-p.z*.48),x=size/2+p.x*scale*perspective,y=size/2+p.y*scale*perspective;
      const alpha=.19+(p.z+1.4)/2.8*.64, radius=(.65+(p.z+1.4)*.25)*(size/650);
      ctx.fillStyle=`rgba(${155+Math.round(55*Math.sin(p.phase*.5))},${187+Math.round(37*Math.sin(p.phase*.5))},255,${alpha})`;
      ctx.beginPath();ctx.arc(x,y,Math.max(.5,radius),0,Math.PI*2);ctx.fill();
    }
    ctx.strokeStyle='#7dabda25';ctx.lineWidth=.65;
    ctx.beginPath();ctx.ellipse(size/2,size/2,size*.4,size*.16,-.65,0,Math.PI*2);ctx.stroke();
    const orb=t*.23;
    const ox=Math.cos(orb)*size*.4,oy=Math.sin(orb)*size*.16;
    const x=size/2+ox*Math.cos(-.65)-oy*Math.sin(-.65),y=size/2+ox*Math.sin(-.65)+oy*Math.cos(-.65);
    ctx.shadowColor='#a3d9fa';ctx.shadowBlur=12;ctx.fillStyle='#d8f2ff';ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  }
  function loop(now){frame=0;if(paused||!visible||document.hidden)return;if(now-last>32){t+=Math.min((now-last)/1000,.05);last=now;draw();}frame=requestAnimationFrame(loop);}
  function reconcile(){cancelAnimationFrame(frame);frame=0;if(!paused&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(loop);}}
  function resize(){size=canvas.clientWidth;dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(size*dpr);canvas.height=Math.round(size*dpr);draw();}
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;reconcile();}).observe(canvas);
  toggle?.addEventListener('click',()=>{paused=!paused;setLabel();reconcile();});
  reduce.addEventListener('change',e=>{paused=e.matches;setLabel();reconcile();});
  document.addEventListener('visibilitychange',reconcile);
  setLabel();resize();reconcile();
})();

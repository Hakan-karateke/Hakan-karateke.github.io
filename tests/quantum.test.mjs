import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuantumGeometry, sceneAt, QuantumScene } from '../assets/quantum.js';

test('all morph targets remain finite and inside the projection camera',()=>{
  for(const count of [3000,6200]){
    const geometry=createQuantumGeometry(count);
    assert.equal(geometry.length,count*10);
    for(let i=0;i<geometry.length;i++){
      assert.ok(Number.isFinite(geometry[i]));
      assert.ok(Math.abs(geometry[i])<1.5);
    }
    assert.deepEqual(createQuantumGeometry(count),geometry);
  }
});
test('shape transitions are bounded and continuous at chapter boundaries',()=>{
  for(let i=-10;i<=110;i++){
    const s=sceneAt(i/100);
    assert.ok(s.sphere>=0&&s.sphere<=1);
    assert.ok(s.helix>=0&&s.helix<=1);
  }
  for(const p of [.35,.72]){
    const before=sceneAt(p-.00001),after=sceneAt(p+.00001);
    assert.ok(Math.abs(before.sphere-after.sphere)<.001);
    assert.ok(Math.abs(before.helix-after.helix)<.001);
  }
  assert.equal(sceneAt(0).sphere,0);
  assert.equal(sceneAt(.3).sphere,1);
  assert.equal(sceneAt(.7).helix,1);
  assert.equal(sceneAt(1).helix,0);
});
test('canvas fallback renders each state and respects mobile text clearance',()=>{
  const originalMatch=globalThis.matchMedia,originalDpr=globalThis.devicePixelRatio;
  globalThis.matchMedia=()=>({matches:true});globalThis.devicePixelRatio=3;
  let draws=0;
  const ctx={setTransform(){},clearRect(){},beginPath(){},fill(){},arc(...values){assert.ok(values.every(Number.isFinite));draws++;}};
  const replacement={getContext:()=>ctx,addEventListener(){}};
  const canvas={getContext:()=>null,cloneNode:()=>replacement,replaceWith(){}};
  try{
    const scene=new QuantumScene(canvas);scene.resize(320,740);
    assert.ok(scene.dpr<=1.75);
    const initial=scene.draw({progress:0,hero:0,time:0,heroAnchor:790});
    assert.equal(initial.centerY,790);
    for(const p of [.2,.5,.8,1]){
      const s=scene.draw({progress:p,hero:1,time:10});
      assert.ok(s.opacity<.2);
      assert.equal(s.centerX,160);
    }
    assert.ok(draws>1000);
    const reduced=scene.draw({progress:.7,hero:0,time:0,reduced:true});
    assert.equal(reduced.phase,0);
  }finally{globalThis.matchMedia=originalMatch;globalThis.devicePixelRatio=originalDpr;}
});

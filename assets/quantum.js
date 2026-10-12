const TAU = Math.PI * 2;
export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const smooth = value => { const x = clamp(value); return x * x * (3 - 2 * x); };

// Artistic shapes rather than a physical quantum simulation.
export function createQuantumGeometry(count = 5200) {
  const data = new Float32Array(count * 10), goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const u = i / count * TAU * 89, v = i * goldenAngle;
    const tube = .26 + .055 * Math.sin(u * 3), ring = 1 + tube * Math.cos(v);
    const y = 1 - (i + .5) / count * 2, radius = Math.sqrt(Math.max(0, 1 - y * y));
    const height = ((i / 2 | 0) + .5) / Math.ceil(count / 2);
    const angle = height * TAU * 2.6 + i % 2 * Math.PI, thickness = .095 * Math.sin(v);
    data.set([ring*Math.cos(u),ring*Math.sin(u),tube*Math.sin(v),
      1.15*radius*Math.cos(v),1.15*y,1.15*radius*Math.sin(v),
      (.65+thickness)*Math.cos(angle),(height-.5)*2.6,(.65+thickness)*Math.sin(angle),(i*.61803398875)%1],i*10);
  }
  return data;
}
export function sceneAt(progress) {
  const p = clamp(progress);
  if(p<.35) return {sphere:smooth((p-.045)/.23),helix:0,phase:p<.16?0:1};
  if(p<.72) return {sphere:1,helix:smooth((p-.35)/.23),phase:2};
  const close=smooth((p-.74)/.24);
  return {sphere:1-close,helix:1-close,phase:3};
}
const vertexShader=`
precision highp float;
attribute vec3 aRing; attribute vec3 aSphere; attribute vec3 aHelix; attribute float aSeed;
uniform vec2 uResolution; uniform vec2 uCenter; uniform vec3 uRotation;
uniform float uScale; uniform float uSphere; uniform float uHelix; uniform float uTime; uniform float uDpr; uniform float uOpacity;
varying vec3 vColor; varying float vAlpha;
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
void main(){
vec3 p=mix(mix(aRing,aSphere,uSphere),aHelix,uHelix);
p*=1.+sin(aSeed*24.+uTime*.6)*.014;
p=rz(uRotation.z)*ry(uRotation.y)*rx(uRotation.x)*p;
float depth=4.2/(4.2-p.z);vec2 xy=p.xy*uScale*depth;
gl_Position=vec4((uCenter.x+xy.x)/uResolution.x*2.-1.,1.-(uCenter.y-xy.y)/uResolution.y*2.,0.,1.);
gl_PointSize=(1.65+aSeed*1.55)*uDpr*depth;
float front=smoothstep(-1.4,1.4,p.z);
vColor=mix(vec3(.30,.82,1.),vec3(.60,.48,1.),smoothstep(-1.,1.,p.x)*.62);
vColor=mix(vColor,vec3(.88,.96,1.),front*.65);
vAlpha=(.16+front*.70)*uOpacity;
}`;
const fragmentShader=`
precision mediump float;
varying vec3 vColor; varying float vAlpha;
void main(){float d=length(gl_PointCoord-vec2(.5))*2.;if(d>1.)discard;
float core=pow(max(0.,1.-d),1.6),halo=(1.-smoothstep(.15,1.,d))*.20;
gl_FragColor=vec4(vColor,(core+halo)*vAlpha);}`;

export class QuantumScene {
  constructor(canvas,{onFallback}={}) {
    this.canvas=canvas;
    this.count=matchMedia('(max-width: 600px)').matches?3000:6200;
    this.data=createQuantumGeometry(this.count);
    this.gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:false,powerPreference:'low-power'});
    if(this.gl){try{this.setup();}catch{this.gl=null;}}
    if(!this.gl){
      const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);this.canvas=replacement;
      this.ctx=replacement.getContext('2d');onFallback?.();
    }
    this.lost=false;
    this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.lost=true;});
    this.canvas.addEventListener('webglcontextrestored',()=>{this.lost=false;this.setup();this.resize(this.width,this.height);});
  }
  setup(){
    const gl=this.gl;
    const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Quantum shader unavailable');return s;};
    const vs=compile(gl.VERTEX_SHADER,vertexShader),fs=compile(gl.FRAGMENT_SHADER,fragmentShader);
    this.program=gl.createProgram();gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);gl.deleteShader(vs);gl.deleteShader(fs);
    if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error('Quantum renderer unavailable');
    gl.useProgram(this.program);this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,this.data,gl.STATIC_DRAW);
    for(const [name,size,offset] of [['aRing',3,0],['aSphere',3,12],['aHelix',3,24],['aSeed',1,36]]){const l=gl.getAttribLocation(this.program,name);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,size,gl.FLOAT,false,40,offset);}
    this.uniforms=Object.fromEntries(['uResolution','uCenter','uRotation','uScale','uSphere','uHelix','uTime','uDpr','uOpacity'].map(n=>[n,gl.getUniformLocation(this.program,n)]));
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.clearColor(0,0,0,0);
  }
  resize(width,height){
    this.width=Math.max(1,width);this.height=Math.max(1,height);this.dpr=Math.min(devicePixelRatio||1,1.75);
    this.canvas.width=Math.round(this.width*this.dpr);this.canvas.height=Math.round(this.height*this.dpr);
    this.gl?.viewport(0,0,this.canvas.width,this.canvas.height);
  }
  draw({progress,hero,time,pointerX=0,pointerY=0,reduced=false,heroAnchor}){
    if(this.lost||!this.width)return;
    const mobile=this.width<=600,state=sceneAt(reduced?0:progress),departure=smooth(hero);
    const centerX=mobile?this.width*.5:this.width*(.74+departure*.095);
    const centerY=mobile?(heroAnchor||this.height*.78)*(1-departure)+this.height*.48*departure:this.height*(.50+departure*.025);
    const scale=mobile?Math.min(this.width*.30,128):Math.min(this.width*.175,this.height*.30,290)*(1-departure*.09);
    const rotation=[1.03+progress*3.8+pointerY*.15,-.28+time*.09+progress*9.5+pointerX*.25,-.35+progress*1.7];
    const opacity=1-departure*(mobile?.83:.58);
    this.layout={centerX,centerY,scale,opacity,departure,phase:state.phase};
    if(this.gl){
      const gl=this.gl,u=this.uniforms;gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this.program);
      gl.uniform2f(u.uResolution,this.width,this.height);gl.uniform2f(u.uCenter,centerX,centerY);gl.uniform3f(u.uRotation,...rotation);
      gl.uniform1f(u.uScale,scale);gl.uniform1f(u.uSphere,state.sphere);gl.uniform1f(u.uHelix,state.helix);
      gl.uniform1f(u.uTime,time);gl.uniform1f(u.uDpr,this.dpr);gl.uniform1f(u.uOpacity,opacity);gl.drawArrays(gl.POINTS,0,this.count);
    }else if(this.ctx)this.drawFallback(state,rotation,centerX,centerY,scale,opacity);
    return this.layout;
  }
  drawFallback(state,rotation,cx,cy,scale,opacity){
    const ctx=this.ctx;ctx.setTransform(this.dpr,0,0,this.dpr,0,0);ctx.clearRect(0,0,this.width,this.height);
    const ca=Math.cos(rotation[0]),sa=Math.sin(rotation[0]),cb=Math.cos(rotation[1]),sb=Math.sin(rotation[1]);
    for(let i=0;i<this.count;i+=4){
      const offset=i*10,p=[];
      for(let a=0;a<3;a++){const start=this.data[offset+a]*(1-state.sphere)+this.data[offset+a+3]*state.sphere;p[a]=start*(1-state.helix)+this.data[offset+a+6]*state.helix;}
      const y=p[1]*ca-p[2]*sa,z=p[1]*sa+p[2]*ca,x=p[0]*cb+z*sb,depth=-p[0]*sb+z*cb,perspective=4.2/(4.2-depth);
      ctx.fillStyle=`rgba(157,207,255,${opacity*(.25+(depth+1.5)*.18)})`;ctx.beginPath();ctx.arc(cx+x*scale*perspective,cy-y*scale*perspective,Math.max(.5,perspective),0,TAU);ctx.fill();
    }
  }
}

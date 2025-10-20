import Canvas from "./engine/Canvas.js";
import Reptile from "./entities/Reptile.js";

const cvs = new Canvas("stage");
const ctx = cvs.ctx;

// frame helper
function drawFrame(){
  return cvs.frameRect();
}

// model
let reptile = new Reptile(cvs.w/2, cvs.h/2, {
  segCount: 78,
  baseLen: 18,
  ease: 0.14,
  waveAmp: 12,
  waveFreq: 0.19,
  thickness: 0.9,
  show: { body:true, rings:true, legs:true, dorsal:true, tail:true, glow:true, motion:true }
});

let paused = false;

// input
let mx=cvs.w/2, my=cvs.h/2;
addEventListener("mousemove", e=>{ mx=e.clientX; my=e.clientY; reptile.setTarget(mx,my); }, {passive:true});
addEventListener("touchmove", e=>{ const t=e.touches[0]; if(t){ mx=t.clientX; my=t.clientY; reptile.setTarget(mx,my);} }, {passive:true});
addEventListener("keydown", e=>{
  if(e.code==="Space"){ paused=!paused; }
  if(e.key==="r"||e.key==="R"){ reptile = new Reptile(cvs.w/2,cvs.h/2,{...reptile.opts, show: reptile.flags}); }
});

// controls binding
const $ = sel => document.querySelector(sel);
function bindRange(id, on){
  const input = $(`#${id}`), out = $(`#${id}Out`);
  const update = () => { out.textContent = input.value; on(parseFloat(input.value)); };
  input.addEventListener("input", update); update();
}
function bindCheck(id, on){
  const input = $(`#${id}`); const update = () => on(input.checked);
  input.addEventListener("change", update); update();
}

bindRange("thickness", v => reptile.setOption("thickness", v));
bindRange("baseLen",   v => { reptile.setOption("baseLen", v); });
bindRange("segCount",  v => { reptile.setOption("segCount", v|0); });
bindRange("waveAmp",   v => reptile.setOption("waveAmp", v));
bindRange("waveFreq",  v => reptile.setOption("waveFreq", v));
bindRange("ease",      v => reptile.setOption("ease", v));

bindCheck("glow",   v => reptile.setFlag("glow", v));
bindCheck("motion", v => reptile.setFlag("motion", v));
bindCheck("body",   v => reptile.setFlag("body", v));
bindCheck("rings",  v => reptile.setFlag("rings", v));
bindCheck("legs",   v => reptile.setFlag("legs", v));
bindCheck("dorsal", v => reptile.setFlag("dorsal", v));
bindCheck("tail",   v => reptile.setFlag("tail", v));

// loop
(function loop(){
  if(!paused){
    reptile.update();
  }

  reptile.draw(ctx);   
  cvs.frameRect();     

  requestAnimationFrame(loop);
})();

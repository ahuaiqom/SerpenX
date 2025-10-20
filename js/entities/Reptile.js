import Segment from "./Segment.js";

export default class Reptile {
  constructor(cx, cy, opts={}){
    // defaults
    const {
      segCount=78, baseLen=18, ease=0.14,
      waveAmp=12, waveFreq=0.19,
      show={ body:true, rings:true, legs:true, dorsal:true, tail:true, glow:true, motion:true },
      thickness=0.9
    } = opts;

    this.cx=cx; this.cy=cy;
    this.opts = { segCount, baseLen, ease, waveAmp, waveFreq, thickness };
    this.flags = { ...show };
    this.time = 0;

    this.mx=cx; this.my=cy;   // target
    this.hx=cx; this.hy=cy;   // smoothed head

    this.chain = [];
    this.rebuild();
  }

  rebuild(){
    const { segCount, baseLen } = this.opts;
    this.chain = Array.from({length: segCount}, (_,i)=> new Segment(this.cx, this.cy, baseLen * (0.985 ** i)));
  }

  setTarget(x,y){ this.mx=x; this.my=y; }
  setFlag(name, val){ this.flags[name] = val; }
  setOption(name, val){ this.opts[name] = val; if(name==="segCount"||name==="baseLen") this.rebuild(); }

  update(){
    this.time += 1;
    const { ease, waveAmp, waveFreq } = this.opts;

    // autopilot
    if(Math.hypot(this.mx-this.hx, this.my-this.hy) < 0.2){
      const cx = innerWidth*0.5, cy = innerHeight*0.5;
      this.mx = cx + Math.sin(this.time*0.01) * innerWidth*0.34;
      this.my = cy + Math.cos(this.time*0.013) * innerHeight*0.25;
    }

    // head smoothing
    this.hx += (this.mx - this.hx) * ease;
    this.hy += (this.my - this.hy) * ease;

    const rpx = Math.sin(this.time * waveFreq) * waveAmp;
    const rpy = Math.cos(this.time * waveFreq * 0.9) * waveAmp * 0.6;

    const s0 = this.chain[0];
    s0.follow(this.hx + rpx, this.hy + rpy);
    for(let i=1;i<this.chain.length;i++){
      const p = this.chain[i-1];
      this.chain[i].follow(p.ax, p.ay);
    }
  }

  /* ===== draw primitives ===== */
  _line(ctx,x1,y1,x2,y2,w=1.5,c='#e9eef9'){
    ctx.lineWidth=w; ctx.strokeStyle=c; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  }
  _dot(ctx,x,y,r=2,c='#e9eef9'){ ctx.fillStyle=c; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); }

  /* ===== fancy parts ===== */
  _drawBodyTube(ctx,s,i){
    const t = i/(this.chain.length-1);
    const maxHalf = 10 * this.opts.thickness * (1 - t*0.85);
    const steps = 8;
    const normal = s.ang + Math.PI/2;

    for(let k=-steps;k<=steps;k++){
      const f = k/steps;
      const off = f * maxHalf * (0.9 + Math.sin(this.time*0.12 + i*0.3)*0.05);
      const ox = Math.cos(normal)*off, oy = Math.sin(normal)*off;
      const alpha = 0.08 * (1 - Math.abs(f)) * (this.flags.glow?1.2:1.0);
      ctx.strokeStyle = `rgba(235,240,255,${alpha.toFixed(3)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(s.ax+ox, s.ay+oy); ctx.lineTo(s.bx+ox, s.by+oy); ctx.stroke();
    }
  }
  _drawRings(ctx,s,i){
    const total = this.chain.length;
    const t=i/(total-1);
    const head = i<10;
    const step=head?0.28:0.5, count=head?3:2;
    const pulse = 1 + Math.sin(this.time*0.06 + i*0.28)*0.1;
    for(let k=0;k<count;k++){
      const f=step*(k+1);
      const cx=s.ax+Math.cos(s.ang)*s.len*f;
      const cy=s.ay+Math.sin(s.ang)*s.len*f;
      const r=Math.max(0.5,(6 - t*5)*0.9)*pulse;
      ctx.lineWidth=1; ctx.strokeStyle='#dfe6f4';
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
    }
  }
  _drawLegs(ctx,s,i){
    if(i<2) return;
    const total=this.chain.length;
    const phase=Math.sin(this.time*0.16 + i*0.33)*0.4;
    const A=22, B=17, C=12;
    for(const dir of [+1,-1]){
      const rootF=0.18;
      const rx=s.ax+Math.cos(s.ang)*s.len*rootF;
      const ry=s.ay+Math.sin(s.ang)*s.len*rootF;
      const a0=s.ang + dir*(Math.PI/2.15 + phase);
      const ax=rx+Math.cos(a0)*A, ay=ry+Math.sin(a0)*A;
      const a1=a0 + dir*(0.55 + Math.sin(this.time*0.14+i)*0.12);
      const bx=ax+Math.cos(a1)*B, by=ay+Math.sin(a1)*B;
      const a2=a1 + dir*0.5;
      const cx1=bx+Math.cos(a2)*C, cy1=by+Math.sin(a2)*C;
      const cx2=bx+Math.cos(a2-0.7)*C*0.95, cy2=by+Math.sin(a2-0.7)*C*0.95;
      this._line(ctx,rx,ry,ax,ay,1.7);
      this._line(ctx,ax,ay,bx,by,1.7);
      this._line(ctx,bx,by,cx1,cy1,1.3);
      this._line(ctx,bx,by,cx2,cy2,1.3);
    }
  }
  _drawTail(ctx,s,i){
    const total=this.chain.length;
    const t=i/(total-1);
    // spines
    const n = (i>total*0.55) ? 2 : 1;
    for(let k=0;k<n;k++){
      const f = 0.25 + k*0.35;
      const cx = s.ax + Math.cos(s.ang)*s.len*f;
      const cy = s.ay + Math.sin(s.ang)*s.len*f;
      const d = 7*(1 - t);
      const ang = s.ang + ((i%2)?+1:-1)*(Math.PI/2.1);
      this._line(ctx,cx,cy, cx+Math.cos(ang)*d, cy+Math.sin(ang)*d, 1.1);
    }
    // fins
    if(i>total-6){
      const finLen = 18*(1 - (total-i)/8);
      const angL = s.ang + Math.PI/1.9;
      const angR = s.ang - Math.PI/1.9;
      this._line(ctx,s.bx,s.by, s.bx+Math.cos(angL)*finLen, s.by+Math.sin(angL)*finLen, 1.4);
      this._line(ctx,s.bx,s.by, s.bx+Math.cos(angR)*finLen, s.by+Math.sin(angR)*finLen, 1.4);
    }
    // red stinger
    if(i===total-1){
      ctx.save();
      ctx.globalCompositeOperation = this.flags.glow? "lighter":"source-over";
      ctx.shadowBlur = this.flags.glow? 18: 0; ctx.shadowColor = "#ff3a3a";
      this._dot(ctx,s.bx,s.by,3,"#ff3a3a");
      ctx.restore();
    }
  }
  _drawDorsal(ctx,s,i){
    if(i<6 || i%2!==0) return;
    const total=this.chain.length, t=i/(total-1);
    const f=0.45;
    const cx=s.ax+Math.cos(s.ang)*s.len*f;
    const cy=s.ay+Math.sin(s.ang)*s.len*f;
    const len = 9*(1 - t*0.9);
    const jitter = Math.sin(this.time*0.2 + i)*0.25;
    const ang = s.ang - Math.PI/2 + jitter;
    this._line(ctx,cx,cy, cx+Math.cos(ang)*len, cy+Math.sin(ang)*len, 1.2);
  }
  _drawSkull(ctx){
    const s0=this.chain[0], hx=s0.bx, hy=s0.by, ang=s0.ang;
    ctx.save();
    ctx.globalCompositeOperation = this.flags.glow? "lighter":"source-over";
    for(const side of [+1,-1]){
      const ex = hx + Math.cos(ang - side*0.55)*7;
      const ey = hy + Math.sin(ang - side*0.55)*7;
      ctx.shadowBlur = this.flags.glow? 20: 0; ctx.shadowColor = "#ff2d2d";
      this._dot(ctx,ex,ey,2.5,"#ff2d2d");
    }
    ctx.shadowBlur=0;
    const fangLen=10;
    const f1x = hx + Math.cos(ang+0.9)*5,  f1y = hy + Math.sin(ang+0.9)*5;
    const f2x = hx + Math.cos(ang-0.9)*5,  f2y = hy + Math.sin(ang-0.9)*5;
    this._line(ctx,f1x,f1y, f1x+Math.cos(ang+1.25)*fangLen, f1y+Math.sin(ang+1.25)*fangLen, 1.4);
    this._line(ctx,f2x,f2y, f2x+Math.cos(ang-1.25)*fangLen, f2y+Math.sin(ang-1.25)*fangLen, 1.4);
    ctx.restore();
  }

  draw(ctx){
    // background/motion blur
     const W = ctx.canvas.width, H = ctx.canvas.height;
    if(this.flags.motion) ctx.fillStyle = "rgba(6,8,13,0.15)";
    else                 ctx.fillStyle = "rgba(6,8,13,1)";
    ctx.fillRect(0,0,W,H);

    // glow mode
    ctx.save();
    ctx.globalCompositeOperation = this.flags.glow ? "lighter" : "source-over";

    // ekor -> kepala
    for(let i=this.chain.length-1;i>=0;i--){
      const s=this.chain[i];

      if(this.flags.body)   this._drawBodyTube(ctx,s,i);
      const w = 2.6 - (i/(this.chain.length-1))*1.2;
      this._line(ctx,s.ax,s.ay,s.bx,s.by,w,"#eef3ff");

      if(this.flags.rings)  this._drawRings(ctx,s,i);
      if(this.flags.legs && i%4===0) this._drawLegs(ctx,s,i);
      if(this.flags.dorsal) this._drawDorsal(ctx,s,i);
      if(this.flags.tail)   this._drawTail(ctx,s,i);
    }
    ctx.restore();

    this._drawSkull(ctx);
  }
}

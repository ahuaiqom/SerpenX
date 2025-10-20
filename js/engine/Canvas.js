export default class Canvas {
  constructor(id){
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext("2d", { desynchronized: true });
    this.w = this.h = 0;
    this.resize();
    addEventListener("resize", () => this.resize(), { passive: true });
  }
  resize(){
    this.w = this.canvas.width  = innerWidth;
    this.h = this.canvas.height = innerHeight;
  }
  clear(color = "rgba(6,8,13,1)"){
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0,0,this.w,this.h);
  }
  frameRect(){
    const pad = Math.min(this.w, this.h) * 0.055;
    const x = pad, y = pad*1.15, w = this.w - pad*2, h = this.h - pad*2.3, r = 14;
    const ctx = this.ctx;
    ctx.save(); ctx.strokeStyle = "#e6eefc"; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); ctx.stroke(); ctx.restore();
    return {x,y,w,h};
  }
}

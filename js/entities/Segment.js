export default class Segment {
  constructor(x,y,len){
    this.ax=x; this.ay=y; this.len=len; this.ang=0;
    this.bx=x+len; this.by=y;
  }
  follow(tx,ty){
    const dx = tx - this.ax, dy = ty - this.ay;
    const ang = Math.atan2(dy, dx); this.ang = ang;
    this.ax = tx - Math.cos(ang)*this.len; this.ay = ty - Math.sin(ang)*this.len;
    this.bx = this.ax + Math.cos(ang)*this.len; this.by = this.ay + Math.sin(ang)*this.len;
  }
}

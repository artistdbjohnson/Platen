// ╭────────────────────────────────────────────────────────────────╮
// │  PLATEN ARTYPING ENGINE  v3.0                                  │
// │  Olympia SM3 · US Letter · 10cpi / 6lpi                       │
// │  Pattern engines from Larkspur (douglxss)                      │
// │  Spacebar = regenerate · V = score view · S = save PNG         │
// ╰────────────────────────────────────────────────────────────────╯

// ── Paper & machine geometry ─────────────────────────────────────
var PAPER_W   = 8.5;
var PAPER_H   = 11.0;
var MARGIN_IN = 0.75;
var CPI       = 10;
var LPI       = 6;
var PPI       = 72;
var CELL_W    = PPI / CPI;         // 7.2 px
var CELL_H    = PPI / LPI;         // 12 px
var COLS      = Math.floor((PAPER_W - 2 * MARGIN_IN) * CPI);  // 70
var ROWS      = Math.floor((PAPER_H - 2 * MARGIN_IN) * LPI);  // 57
var ORIGIN_X  = MARGIN_IN * PPI;
var ORIGIN_Y  = MARGIN_IN * PPI;
var CW        = Math.round(PAPER_W * PPI);   // 612
var CH        = Math.round(PAPER_H * PPI);   // 792

// ── Density ramp ─────────────────────────────────────────────────
var RAMP = [
  [],              // 0  blank
  ['.'],           // 1
  [':'],           // 2
  ['*'],           // 3
  ['x'],           // 4
  ['t','*'],       // 5
  ['t','*','x'],   // 6
  ['M'],           // 7
  ['M','*'],       // 8
  ['M','W','*']    // 9
];
var MAXLVL = RAMP.length - 1;

// ── Borders ──────────────────────────────────────────────────────
var BORDERS = {
  'none': null,
  't*x':  { top:['t','*','x'], side:['t','*','x'], corner:['t','*','x'] },
  '8*':   { top:['8','*'],     side:['8'],          corner:['8','*'] },
  'I*':   { top:['I','*'],     side:['I','*'],      corner:['*'] },
  'ms':   { top:['m','s'],     side:['m','s'],      corner:['m','s'] },
  'OW':   { top:['O','W'],     side:['O','W'],      corner:['O','W'] },
  '**':   { top:['*','*'],     side:['*'],          corner:['*','*'] }
};
var BORDER_KEYS = ['none','t*x','8*','I*','ms','OW','**'];

// ── Color Palette ────────────────────────────────────────────────
var PALETTE = {
  red: '#d1462f',
  blue: '#2d5a8c',
  yellow: '#e0a92e',
  black: '#1a1715',
  white: '#f3ece0'
};


// ── Larkspur engine list ──────────────────────────────────────────
var ENGINE_LIST = [
  'kagome','asanoha','seigaiha','shippo','kikkou',
  'kente','bogolan','navajo','dazzler',
  'glitch','mondrian','flow','stolz',
  'tol','mastor','virma','ved','kepe','kolya',
  'sermat','chipaz','azulejo','arraiolos','viana',
  'verena','cypress_hills','sierra_sunset','panoramic_dunes',
  'adama','argyle','art_deco','adire','panks',
  'collage','brutalist','current','kudo','sermat-kudo',
  'suprematist','mondrian_geo','kandinsky_comp','canyonlands'
];

// ── State ─────────────────────────────────────────────────────────
var seed = 0;
var currentEngine = '';
var currentSpace = 'none';
var borderKey = 't*x';
var gain = 0.85;
var showPalms = true;
var viewMode = 'art';
var grid = [];

// UI handles
var panel, lblSeed, lblInfo, lblEngine;
var selBorder, selEngine, sldGain, chkPalms, btnRegen, btnSave, btnScore;
var paperImg;
var shapeHints = [];   // faint dashed hints for old mondrian/brutalist engines
var boldShapes = [];   // full composition shapes for suprematist/mondrian_geo/kandinsky_comp
var selectedEngine = 'random';

// ── Shape point-in-shape test (grid cell coordinates) ─────────────
// Circles use column-radius so they print physically round (CPI/LPI = 10/6 aspect).
// A circle of r cols radius = r*CELL_W px radius in both axes.
function cellInModernShape(c, r, s) {
  var ASPECT = LPI / CPI; // 0.6: rows/cols for physically round circle
  if (s.type === 'rect' || s.type === 'bar') {
    return c >= s.x && c < s.x + s.w && r >= s.y && r < s.y + s.h;
  }
  if (s.type === 'circle') {
    var dx = c - s.cx, dy = (r - s.cy) / ASPECT;
    return dx*dx + dy*dy <= s.r * s.r;
  }
  if (s.type === 'semicircle') {
    var dx2 = c - s.cx, dy2 = (r - s.cy) / ASPECT;
    if (dx2*dx2 + dy2*dy2 > s.r * s.r) return false;
    if (s.dir === 'up')    return r <= s.cy;
    if (s.dir === 'down')  return r >= s.cy;
    if (s.dir === 'left')  return c <= s.cx;
    if (s.dir === 'right') return c >= s.cx;
  }
  if (s.type === 'triangle') {
    var tx = c - s.x, ty = r - s.y;
    if (tx < 0 || tx > s.w || ty < 0 || ty > s.h) return false;
    var nx = tx / s.w, ny = ty / s.h;
    if (s.dir === 'up')    return nx >= ny*0.5 && nx <= 1 - ny*0.5;
    if (s.dir === 'down')  return nx >= (1-ny)*0.5 && nx <= 1 - (1-ny)*0.5;
    if (s.dir === 'right') return ny >= nx*0.5 && ny <= 1 - nx*0.5;
    if (s.dir === 'left')  return ny >= (1-nx)*0.5 && ny <= 1 - (1-nx)*0.5;
  }
  return false;
}

// Larkspur PRNG (Park-Miller)
var _prng;

// ── Larkspur PRNG ────────────────────────────────────────────────
function makePRNG(s) {
  var P = 2147483647;
  s = ((s + 1590398727) % P);
  if (s <= 0) s += P - 1;
  var t = s;
  function nxt() { t = (t * 16807) % P; return t; }
  nxt();
  return {
    rfl: function(a,b){ if(a===undefined)a=0; if(b===undefined)b=1; return (nxt()-1)/(P-1)*(b-a)+a; },
    rin: function(a,b){ if(a===undefined)a=0; if(b===undefined)b=1; return ((nxt()-1)%(b-a+1))+a; }
  };
}

function safeMod(a,b){ return ((a%b)+b)%b; }
function mfloor(n){ return Math.floor(n); }
function mabs(n){ return Math.abs(n); }
function msqrt(n){ return Math.sqrt(n); }
function mmin(a,b){ return Math.min(a,b); }
function mmax(a,b){ return Math.max(a,b); }

// ── Motif primitives (from Larkspur) ─────────────────────────────
function motifDiagonal(x,y,p,t){ var ph=safeMod(x+y,p); return ph<t?1-(ph/t)*0.4:0; }
function motifAntiDiag(x,y,p,t){ var ph=safeMod(x-y,p); return ph<t?1-(ph/t)*0.4:0; }
function motifChevron(x,y,w,p,a){ var f=mabs(x-w/2),ph=safeMod(f+y,p); return ph<a?(ph<a*0.3?1:ph<a*0.7?0.7:0.4):0; }
function motifDiamond(x,y,cx,cy,r,rw){
  var d=mabs(x-cx)+mabs(y-cy);
  if(rw>0){var ph=safeMod(d,r);return ph<rw?1-(ph/rw)*0.5:0;}
  return d<r?(d<r*0.4?1:d<r*0.7?0.7:0.4):0;
}
function motifStepped(x,y,s,t,ax){
  var off=safeMod(mfloor(y/s),2)*mfloor(s/2);
  if(ax===1)off=safeMod(mfloor(x/s),2)*mfloor(s/2);
  var c=ax===0?x:y,ph=safeMod(c+off,s);
  return ph<t?(ph<t*0.4?1:0.4):0;
}
function motifScroll(x,y,w,a,f){ var wv=w/2+a*Math.sin(y*f*Math.PI/40); return mabs(x-wv)<a*0.4?1:0; }
function motifLattice(x,y,p,t){ var d1=safeMod(x+y,p)<t,d2=safeMod(x-y,p)<t; return d1&&d2?1:(d1||d2?0.6:0); }
function motifSteppedDiamond(x,y,cx,cy,r,ss){
  var sdx=mfloor(mabs(x-cx)/ss)*ss,sdy=mfloor(mabs(y-cy)/ss)*ss;
  return (sdx+sdy<r)?(sdx+sdy<r*0.5?1:0.6):0;
}
function motifSerratedBand(x,y,cy,a,p){
  var zy=cy+a*((safeMod(x,p)<p/2)?safeMod(x,p)*2/p:(2-safeMod(x,p)*2/p))-a/2;
  return mabs(y-zy)<2?1:0;
}
function motifKagome(x,y,p,t,dr,dw){
  var wt=motifDiagonal(x,y,p,t)+motifAntiDiag(x,y,p,t);
  if(safeMod(y,p)<t)wt+=0.8;
  var cx=mfloor(x/p)*p+p/2,cy=mfloor(y/p)*p+p/2;
  var dx=x-cx,dy=y-cy,d=msqrt(dx*dx+dy*dy);
  if(mabs(d-dr)<1.5&&dw)wt+=dw;
  return mmin(wt,1.5);
}
function motifAsanoha(x,y,p,t){
  var hp=p/2,cx=mfloor(x/p)*p+hp,cy=mfloor(y/p)*p+hp;
  var lx=x-cx,ly=y-cy,wt=0;
  if(safeMod(x+y,p)<t||safeMod(x-y,p)<t)wt+=0.8;
  if(mabs(lx)<t/2||mabs(ly)<t/2)wt+=0.6;
  var d=mabs(lx)+mabs(ly);if(mabs(d-hp*0.6)<t)wt+=0.5;
  return mmin(wt,1.5);
}
function motifSeigaiha(x,y,p,a,rs,ss,t){
  var wt=0,row=mfloor(y/rs),ox=(safeMod(row,2)===0)?0:p/2;
  var cx=mfloor((x+ox)/p)*p-ox+p/2,cy=row*rs;
  for(var r=0;r<3;r++){var rr=a-r*ss;if(rr<=0)break;var dx=x-cx,dy=y-cy,d=msqrt(dx*dx+dy*dy);if(mabs(d-rr)<t&&dy<=0)wt+=0.8-r*0.2;}
  return mmin(wt,1.5);
}
function motifShippo(x,y,r,t){
  var wt=0,d=r*2,cx=mfloor(x/d)*d,cy=mfloor(y/d)*d;
  for(var i=-1;i<=1;i++)for(var j=-1;j<=1;j++){var dx=x-(cx+i*d),dy=y-(cy+j*d);if(mabs(msqrt(dx*dx+dy*dy)-r)<t)wt+=0.7;}
  return mmin(wt,1.5);
}
function motifKikkou(x,y,r,t,io){
  var h=r*msqrt(3),col=mfloor(x/(r*1.5)),row=mfloor(y/h);
  var cx=col*r*1.5+r,cy=row*h+(safeMod(col,2)===0?0:h/2)+h/2;
  var dx=mabs(x-cx),dy=mabs(y-cy);
  var d=mmax(dx*2/3+dy*msqrt(3)/3,dy*2*msqrt(3)/3);
  var wt=0;if(mabs(d-r)<t)wt+=1;if(io>0&&mabs(d-r*io/r)<t*0.7)wt+=0.5;
  return mmin(wt,1.5);
}
function motifCross(x,y,cx,cy,armW,armL){
  var dx=mabs(x-cx),dy=mabs(y-cy);
  return (dx<armW&&dy<armL)||(dy<armW&&dx<armL)?1:0;
}
function motifSerratedDiamond(x,y,cx,cy,r,ss){
  var dx=mfloor(mabs(x-cx)/ss)*ss,dy2=mfloor(mabs(y-cy)/ss)*ss,d=dx+dy2;
  return (d>=r-ss&&d<=r)?1:0;
}
function motifPixelSmear(x,y,cx,cy,len,ang,th){
  var dx=x-cx,dy=y-cy;
  var nx=dx*Math.cos(-ang)-dy*Math.sin(-ang),ny=dx*Math.sin(-ang)+dy*Math.cos(-ang);
  if(mabs(ny)<1&&nx>0&&nx<len){var n=safeMod((mfloor(cx*13+cy*7))*157,100)/100;if(n>th)return 0.4+0.6*(1-nx/len);}
  return 0;
}
function motifBitBlock(x,y,cx,cy,sz,wt){
  if(mabs(x-cx)<sz&&mabs(y-cy)<sz){var qx=mfloor(x/4)*4,qy=mfloor(y/4)*4;if(safeMod(qx*19+qy*23,10)<4)return wt;}
  return 0;
}
function motifCellularBlocks(x,y,cells,cs){
  if(!cells||!cells.length)return 0;
  var qx=mfloor(x/cs)*cs,qy=mfloor(y/cs)*cs,md=Infinity,cw=0;
  for(var i=0;i<cells.length;i++){var c=cells[i],dx=qx-c.cx,dy=qy-c.cy;var d=dx*dx+dy*dy+safeMod(mfloor(qx*13+qy*23),100)/100*(cs*cs*2);if(d<md){md=d;cw=c.wt;}}
  return cw;
}

// ── Calc motif weight (Larkspur engine dispatch) ──────────────────
function calcMotifWeight(x,y,w,h,eng,P){
  x=safeMod(x,w);y=safeMod(y,h);var wt=0;
  switch(eng){
    case 'kagome': wt+=motifKagome(x,y,P.period,P.thickness,P.dotR,P.dotWt)*P.kagomeWt;break;
    case 'asanoha': wt+=motifAsanoha(x,y,P.period,P.thickness)*P.starWt;break;
    case 'seigaiha': wt+=motifSeigaiha(x,y,P.period,P.amp,P.rowSpacing,P.stripeSpacing,P.thickness)*P.waveWt;break;
    case 'shippo': wt+=motifShippo(x,y,P.radius,P.thickness)*P.circleWt;if(P.hasStar)wt+=motifLattice(x,y,P.radius,P.thickness)*P.starWt*0.5;break;
    case 'kikkou': wt+=motifKikkou(x,y,P.radius,P.thickness,P.innerOffset)*P.hexWt;break;
    case 'kente':{
      var si=mfloor(x/P.stripW),ay=y+si*(P.blockH/3),sp=safeMod(x,P.stripW);
      if(sp<P.seamW||sp>P.stripW-P.seamW){if(safeMod(sp,2)===0)wt+=P.seamWt;}
      else{var bi=mfloor(ay/P.blockH),mt=safeMod(si+bi,4),lx=sp-P.stripW/2,ly=mabs(safeMod(ay,P.blockH)-P.blockH/2);
        if(mt===0)wt+=motifLattice(lx,ly,P.cP,P.cT)*P.cWt;
        else if(mt===1){if(safeMod(ly,P.wP)<P.wT)wt+=P.wWt;}
        else if(mt===2)wt+=motifStepped(lx,ly,P.sP,P.sT,0)*P.sWt;
        else{if(mabs(lx)<P.stripW*0.4&&ly<P.blockH*0.4)wt+=P.bWt;}}break;}
    case 'bogolan':{
      var isVert=P.orientation===1,pc=isVert?x:y,sc2=isVert?y:x;
      var si2=mfloor(pc/P.stripW),sp2=safeMod(pc,P.stripW),mo=P.motifs[safeMod(si2,P.motifs.length)];
      if(sp2<P.borderT||sp2>P.stripW-P.borderT)wt+=P.borderWt;
      else{if(mo.type===0)wt+=motifChevron(sc2,sp2,P.stripW,mo.p1,mo.p2)*mo.wt;
        else if(mo.type===1){var dcx=safeMod(sc2,mo.p1)-mo.p1/2,dcy=sp2-P.stripW/2;if(mabs(dcx)+mabs(dcy)<mo.p2)wt+=mo.wt;}
        else if(mo.type===2){var ccx=safeMod(sc2,mo.p1)-mo.p1/2,ccy=sp2-P.stripW/2;if(mabs(ccx)<mo.p2||mabs(ccy)<mo.p2)wt+=mo.wt;}
        else{if(safeMod(sc2,mo.p1)<mo.p2)wt+=mo.wt;}}break;}
    case 'navajo':{
      var bandY=safeMod(y,P.bandH),bIdx=safeMod(mfloor(y/P.bandH),P.bands.length),band=P.bands[bIdx];
      if(band.type===0&&mabs(bandY-P.bandH/2)<band.diaR){wt+=motifSteppedDiamond(x,y,w/2,y,band.diaR,band.stepSz)*band.wt;wt+=motifSteppedDiamond(x,y,w*0.15,y,band.diaR*0.5,band.stepSz)*band.wt*0.8;wt+=motifSteppedDiamond(x,y,w*0.85,y,band.diaR*0.5,band.stepSz)*band.wt*0.8;}
      else if(band.type===1)wt+=motifSerratedBand(x,y,y,band.amp,band.period)*band.wt;
      else wt+=motifChevron(x,y,w,band.period,band.amp)*band.wt;
      if(bandY<P.stripeT)wt+=P.stripeWt;break;}
    case 'dazzler':
      for(var dl=P.layers;dl>0;dl--){var layR=dl*P.layerSpacing;wt+=motifSerratedDiamond(x,y,w/2,h/2,layR,P.stepSize)*P.dazzleWt*(0.5+0.5*(dl/P.layers));}break;
    case 'glitch':{
      if(P.cells&&P.cells.length)wt+=motifCellularBlocks(x,y,P.cells,P.cellSize);
      var ty=mfloor(y/P.tearH),to2=safeMod(ty*157,P.tearMax),gx=safeMod(x+to2,w);
      for(var s0=0;s0<P.smears.length;s0++){var sm=P.smears[s0];wt+=motifPixelSmear(gx,y,sm.cx,sm.cy,sm.len,sm.angle,sm.thresh)*sm.wt;}
      for(var b0=0;b0<P.blocks.length;b0++){var bl0=P.blocks[b0];wt+=motifBitBlock(gx,y,bl0.cx,bl0.cy,bl0.size,bl0.wt)*bl0.wt;}
      if(safeMod(mfloor(gx*13+y*23),100)<P.spikeFreq)wt+=P.spikeWt;
      if(safeMod(y,P.scanP)<P.scanT)wt+=P.scanWt;break;}
    case 'mondrian':
      for(var ri2=0;ri2<P.rects.length;ri2++){var rr=P.rects[ri2];if(x>=rr.x&&x<rr.x+rr.w&&y>=rr.y&&y<rr.y+rr.h){var bxr=x-rr.x,byr=y-rr.y;if(bxr<rr.bw||bxr>=rr.w-rr.bw||byr<rr.bw||byr>=rr.h-rr.bw)wt+=rr.borderWt;else wt+=rr.fillWt;}}break;
    case 'flow':
      for(var s3=0;s3<P.scrolls.length;s3++){var sc3=P.scrolls[s3];wt+=motifScroll(x,y,w,sc3[0],sc3[1])*sc3[2];}
      for(var d3=0;d3<P.diamonds.length;d3++){var dd=P.diamonds[d3];wt+=motifDiamond(x,y,dd[0],dd[1],dd[2],dd[3])*dd[4];}
      if(safeMod(x+y,P.dP)<P.dT)wt+=P.dWt;break;
    case 'azulejo':{
      var tx=safeMod(x,P.tileSize),ty2=safeMod(y,P.tileSize),tcx=P.tileSize/2,tcy=P.tileSize/2;
      wt+=motifDiamond(x,y,x-tx+tcx,y-ty2+tcy,P.medR,P.medT)*P.medWt;
      var ncx=x-tx+(tx>tcx?P.tileSize:0),ncy=y-ty2+(ty2>tcy?P.tileSize:0);
      var distC=Math.sqrt(Math.pow(x-ncx,2)+Math.pow(y-ncy,2));
      if(mabs(distC-P.cornerR)<P.cornerT)wt+=P.cornerWt;
      if(distC<P.cornerInnerR)wt+=P.cornerInnerWt;
      if(tx<P.grout||ty2<P.grout)wt+=P.groutWt;break;}
    case 'arraiolos':
      wt+=motifSteppedDiamond(x,y,w/2,h/2,P.centerR,P.stepSz)*P.centerWt;
      var bxA=mmin(x,w-1-x),byA=mmin(y,h-1-y),bdA=mmin(bxA,byA);
      if(bdA>P.b1Start&&bdA<P.b1End)wt+=motifStepped(x,y,P.b1Step,P.b1T,0)*P.b1Wt;
      if(bdA>P.b2Start&&bdA<P.b2End){if(safeMod(x+y,P.b2P)<P.b2T)wt+=P.b2Wt;}
      if(bdA>P.b1End&&bdA<w/2-P.centerR)wt+=motifLattice(x,y,P.fieldP,P.fieldT)*P.fieldWt;break;
    case 'viana':{
      var bandIdx=safeMod(mfloor(y/P.bandH),P.bands.length),bV=P.bands[bandIdx];
      if(bV.type===0)wt+=motifChevron(x,y,w,bV.p1,bV.p2)*bV.wt;
      else if(bV.type===1){var rowCxV=safeMod(x,bV.p1)-bV.p1/2;if(mabs(rowCxV)+mabs(safeMod(y,P.bandH)-P.bandH/2)<bV.p2)wt+=bV.wt;}
      else if(bV.type===2){if(mabs(safeMod(y,P.bandH)-P.bandH/2)<bV.p1)wt+=bV.wt;}
      else wt+=motifLattice(x,y,bV.p1,bV.p2)*bV.wt;
      if(safeMod(y,P.bandH)<P.sepT)wt+=P.sepWt;break;}
    case 'stolz':
      for(var b3=0;b3<P.blocks.length;b3++){var bl=P.blocks[b3];if(x>=bl.x&&x<bl.x+bl.w&&y>=bl.y&&y<bl.y+bl.h){if(bl.type===0)wt+=bl.wtMain;else if(bl.type===1)wt+=(safeMod(y,bl.sd)<bl.sd/2)?bl.wtMain:bl.wtSub;else if(bl.type===2)wt+=(safeMod(x,bl.sd)<bl.sd/2)?bl.wtMain:bl.wtSub;else{var lx2=x-bl.x,ly2=y-bl.y;wt+=(lx2/bl.w+ly2/bl.h<1)?bl.wtMain:bl.wtSub;}}}break;
    case 'tol': for(var c0=0;c0<P.layers.length;c0++){var lyT=P.layers[c0];wt+=motifChevron(x,y,w,lyT[0],lyT[1])*lyT[2];}break;
    case 'mastor':
      for(var d0=0;d0<P.diamonds.length;d0++){var dm=P.diamonds[d0];wt+=motifDiamond(x,y,dm[0],dm[1],dm[2],dm[3])*dm[4];}
      wt+=motifDiagonal(x,y,P.diagP,P.diagT)*P.diagWt;wt+=motifAntiDiag(x,y,P.adiagP,P.adiagT)*P.adiagWt;break;
    case 'virma':{
      var bxv=mmin(x,w-1-x),byv=mmin(y,h-1-y),bd=mmin(bxv,byv);
      if(bd<P.borderW){wt+=motifStepped(x,y,P.step,P.stepT,0)*P.stepWt;wt+=motifStepped(x,y,P.step2,P.stepT2,1)*P.stepWt2;}
      else if(bd<P.borderW+P.innerW)wt+=motifChevron(x,y,w,P.innerP,P.innerA)*P.innerWt;
      else wt+=motifDiamond(x,y,w/2,h/2,P.centralR,P.centralRing)*P.centralWt;break;}
    case 'ved':
      for(var sv=0;sv<P.scrolls.length;sv++){var sc4=P.scrolls[sv];wt+=motifScroll(x,y,w,sc4[0],sc4[1])*sc4[2];}
      wt+=motifStepped(x,y,P.bandStep,P.bandT,0)*P.bandWt;break;
    case 'kepe':{
      var pkY=safeMod(y,P.peakH),pkX=safeMod(x,P.peakW);
      var slope=pkY<P.peakH/2?pkX<pkY*P.peakW/P.peakH:pkX<(P.peakH-pkY)*P.peakW/P.peakH;
      if(slope)wt+=P.peakWt;
      wt+=motifStepped(x,y,P.fillStep,P.fillT,0)*P.fillWt;wt+=motifDiamond(x,y,w/2,h/2,P.crownR,P.crownRing)*P.crownWt;break;}
    case 'kolya':{
      var cSz=P.cornerSize,bxk=mmin(x,w-1-x),byk=mmin(y,h-1-y);
      if(bxk<cSz&&byk<cSz){if(safeMod(mfloor(bxk/P.fillW)+mfloor(byk/P.fillW),2)===0)wt+=P.cornerWt;}
      wt+=motifChevron(x,y,w,P.chevP,P.chevA)*P.chevWt;if(bxk<P.edgeW||byk<P.edgeW)wt+=P.edgeWt;break;}
    case 'sermat':
      for(var ci2=0;ci2<P.centers.length;ci2++){var ctr=P.centers[ci2];wt+=motifCross(x,y,ctr[0],ctr[1],P.armW,P.armL)*P.weights[safeMod(ci2,P.weights.length)];}
      wt+=motifDiamond(x,y,w/2,h/2,P.ringR,P.ringW)*P.ringWt;break;
    case 'chipaz':
      for(var ri3=0;ri3<P.rays.length;ri3++){var ray=P.rays[ri3];wt+=motifCross(x,y,ray[0],ray[1],ray[2],ray[3])*ray[4];}
      wt+=motifDiamond(x,y,w/2,h/2,P.sunR,P.sunRing)*P.sunWt;wt+=motifLattice(x,y,P.glowP,P.glowT)*P.glowWt;break;
    case 'verena':
      for(var vi=0;vi<P.bands.length;vi++){var vb=P.bands[vi];var ca=Math.cos(-vb.angle),sa=Math.sin(-vb.angle);var vrx=(x-vb.cx)*ca-(y-vb.cy)*sa,vry=(x-vb.cx)*sa+(y-vb.cy)*ca;if(mabs(vry)<vb.hw&&mabs(vrx)<vb.hl)wt+=vb.wt;}break;
    case 'cypress_hills':
      if(msqrt(Math.pow(x-P.sunX,2)+Math.pow(y-P.sunY,2))<P.sunR)wt+=P.sunWt;
      for(var hi=0;hi<P.hills.length;hi++){var hll=P.hills[hi];var hY=hll.baseY+Math.sin(x/hll.period+hll.phase)*hll.amp;if(y>mfloor(hY/hll.step)*hll.step)wt+=hll.wt;}
      for(var ti=0;ti<P.trees.length;ti++){var tr=P.trees[ti];if(x>tr.x-tr.w/2&&x<tr.x+tr.w/2&&y>tr.y-tr.h&&y<tr.y){var tgW=mfloor(((tr.y-y)/tr.h*(tr.w/2))/4)*4;if(mabs(x-tr.x)<tgW)wt+=tr.wt;}}break;
    case 'sierra_sunset':
      var sbH=mfloor((h/2)/P.skyBands);if(y<h/2&&mfloor(y/sbH)%2===0)wt+=P.skyWt;
      for(var mi2=0;mi2<P.mountains.length;mi2++){var mnt=P.mountains[mi2];var phX=safeMod(x,mnt.period)/mnt.period;var chV=phX<0.5?phX*2:(1-phX)*2;var mY=mfloor((mnt.baseY-chV*mnt.amp)/mnt.step)*mnt.step;if(y>mY){if(y<mY+mnt.thick)wt+=mnt.wt*1.5;else if((x+y)%8<4)wt+=mnt.wt;}}break;
    case 'panoramic_dunes':
      if(y<h/2){var swy=mfloor(h/2/P.windLines);if(safeMod(y,swy)<2)wt+=P.windWt;}
      for(var di=0;di<P.dunes.length;di++){var dn=P.dunes[di];var dY=dn.baseY+Math.sin(x/dn.period+dn.phase)*dn.amp+Math.cos(x/(dn.period*0.5))*(dn.amp*0.3);if(y>dY&&y<dY+dn.thick)wt+=dn.wt;else if(y>=dY+dn.thick)wt+=dn.wt*0.2;}break;
    case 'framed_vista':{
      var inVig=x>P.borderW&&x<w-P.borderW&&y>P.borderW&&y<h-P.borderW;
      if(inVig){var vx=x-P.borderW,vy=y-P.borderW,vw=w-2*P.borderW,vh=h-2*P.borderW;
        if(vx<P.innerBorderT||vx>vw-P.innerBorderT||vy<P.innerBorderT||vy>vh-P.innerBorderT)wt+=P.innerBorderWt;
        else{if(msqrt(Math.pow(vx-P.vigSunX,2)+Math.pow(vy-P.vigSunY,2))<P.vigSunR)wt+=P.vigSunWt;
          for(var vhi=0;vhi<P.vigHills.length;vhi++)if(vy>P.vigHills[vhi].baseY+Math.sin(vx/P.vigHills[vhi].period)*P.vigHills[vhi].amp)wt+=P.vigHills[vhi].wt;
          for(var vti=0;vti<P.vigTrees.length;vti++){var vtr=P.vigTrees[vti];if(vx>vtr.x-vtr.w/2&&vx<vtr.x+vtr.w/2&&vy>vtr.y-vtr.h&&vy<vtr.y&&(vx-vtr.x+vtr.y-vy)%6<3)wt+=vtr.wt;}}}
      else{wt+=P.borderWt*0.5;if(P.cornerType===0&&(safeMod(x,20)<5||safeMod(y,20)<5))wt+=P.cornerWt;
        else if(P.cornerType===2&&mfloor(x/15)%2===mfloor(y/15)%2)wt+=P.cornerWt;}break;}
    case 'adama': case 'cherokee': case 'narmuny': case 'shiprock': case 'woodcut':
      for(var ni=0;ni<P.bands.length;ni++){var nb=P.bands[ni];wt+=motifChevron(x,y,w,nb[0],nb[1])*nb[2];}wt+=motifStepped(x,y,P.stepP,P.stepT,0)*P.stepWt;break;
    case 'argyle': case 'interlace': case 'matsukawa': case 'wari': case 'kuba':
      wt+=motifLattice(x,y,P.latP,P.latT)*P.latWt;wt+=motifDiamond(x,y,w/2,h/2,P.ringR,P.ringT)*P.ringWt;break;
    case 'art_deco': case 'axonometric': case 'blueprint': case 'circuit': case 'tangents':
      for(var ai=0;ai<P.rings.length;ai++){var ar=P.rings[ai];wt+=motifDiamond(x,y,w/2,h/2,ar[0],ar[1])*ar[2];}wt+=motifDiagonal(x,y,P.diagP,P.diagT)*P.diagWt;break;
    case 'adire': case 'fret_bands': case 'optical_box': case 'pulay': case 'yagasuri':
      if(safeMod(mfloor(y/P.bandH),2)===0)wt+=motifDiagonal(x,y,P.diagP,P.diagT)*P.main;
      else wt+=motifAntiDiag(x,y,P.diagP,P.diagT)*P.main;
      if(safeMod(y,P.bandH)<P.stripeT)wt+=P.stripeWt;break;
    case 'panks': case 'pakshats':
      wt+=motifCross(x,y,w/2,h/2,P.armW,P.armL)*P.crossWt;wt+=motifLattice(x,y,P.latP,P.latT)*P.latWt;break;
    case 'collage': case 'cubist':{
      var ptype=safeMod(mfloor(x/P.sz)*7+mfloor(y/P.sz)*13,4);
      if(ptype===0)wt+=motifDiagonal(x,y,P.diagP,P.diagT)*P.main;
      else if(ptype===1)wt+=motifChevron(x,y,w,P.diagP,P.diagT)*P.main;
      else if(ptype===2)wt+=motifLattice(x,y,P.latP,P.latT)*P.latWt;
      else if(safeMod(x,P.sz)<P.sz*0.1||safeMod(y,P.sz)<P.sz*0.1)wt+=P.main;break;}
    case 'brutalist': case 'malevich':
      for(var mi3=0;mi3<P.rects.length;mi3++){var rrr=P.rects[mi3];if(x>=rrr.x&&x<rrr.x+rrr.w&&y>=rrr.y&&y<rrr.y+rrr.h)wt+=rrr.wt;}break;
    case 'current': case 'spider_cross': case 'chiefs':
      wt+=motifSerratedBand(x,y,h/2,P.amp,P.period)*P.main;wt+=motifDiamond(x,y,w/2,h/2,P.ringR,0)*P.ringWt;break;
    case 'kudo':{var bRow=mfloor(y/P.bH),bOff=safeMod(bRow,2)*mfloor(P.bW/2),bx2=safeMod(x+bOff,P.bW);if(bx2<P.mortar||safeMod(y,P.bH)<P.mortar)wt+=P.bWt;break;}
    case 'sermat-kudo':
      for(var ci3=0;ci3<P.centers.length;ci3++){var ct=P.centers[ci3];wt+=motifCross(x,y,ct[0],ct[1],P.armW,P.armL)*P.weights[safeMod(ci3,P.weights.length)];}
      wt+=motifDiamond(x,y,w/2,h/2,P.ringR,P.ringW)*P.ringWt;break;

    // ── De Stijl / Mondrian ──────────────────────────────────────────
    case 'mondrian_geo': {
      var onDiv=false;
      for(var dhi=0;dhi<P.divH.length;dhi++) if(y===P.divH[dhi]||y===P.divH[dhi]+1){onDiv=true;break;}
      if(!onDiv) for(var dvi=0;dvi<P.divV.length;dvi++) if(x===P.divV[dvi]||x===P.divV[dvi]+1){onDiv=true;break;}
      if(onDiv){wt=0.95;break;}
      var inShape = false;
      for (var sIdx=0; sIdx<P.shapes.length; sIdx++) {
        var sh = P.shapes[sIdx];
        if (cellInModernShape(x, y, sh)) {
          wt = sh.innerDensity;
          inShape = true;
          break;
        }
      }
      if (!inShape) {
        var cellColor = 'white';
        for(var cii=0;cii<P.cells.length;cii++){
          var cl=P.cells[cii];
          if(x>=cl.x&&x<cl.x+cl.w&&y>=cl.y&&y<cl.y+cl.h){cellColor=cl.color;break;}
        }
        if (cellColor === 'white') wt = (safeMod(x*11+y*7,29)===0)?0.05:0;
        else wt = 0.08;
      }
      break;
    }

    // ── Suprematist (Malevich/El Lissitzky) ─────────────────────────
    case 'suprematist': {
      var inSup=false;
      for(var msi2=0;msi2<P.shapes.length;msi2++){
        if(cellInModernShape(x,y,P.shapes[msi2])){wt=P.shapes[msi2].innerDensity;inSup=true;break;}
      }
      if(!inSup) wt=(safeMod(x*7+y*11,41)===0)?0.06:0; // vast white silence
      break;
    }

    // ── Kandinsky Composition ────────────────────────────────────────
    case 'kandinsky_comp': {
      var inKan=false;
      for(var msk=0;msk<P.shapes.length;msk++){
        if(cellInModernShape(x,y,P.shapes[msk])){wt=P.shapes[msk].innerDensity;inKan=true;break;}
      }
      if(!inKan) wt=(motifDiagonal(x,y,P.bgP,P.bgT)+motifShippo(x,y,P.bgR,1))*P.bgWt;
      break;
    }

    // ── Canyon Lands ─────────────────────────────────────────────────
    // Sedimentary mesa country. Horizontal strata bands read as geological time;
    // cliff faces are shadowed dark; mesa tops catch light. Sky is silence.
    case 'canyonlands': {
      if (y < P.skyH) {
        var hazeRow = P.skyH - 1;
        if (y === hazeRow) wt = safeMod(x*3+7,5)===0 ? 0.18 : 0.04;
        else               wt = safeMod(x*11+y*7,79)===0 ? 0.15 : 0;
        break;
      }
      if (y >= P.groundY) {
        wt = safeMod(y,3)===0 ? (safeMod(x*7+y*3,11)<3 ? 0.28 : 0.06) : 0;
        wt += safeMod(x*13+y*17,41)<2 ? 0.20 : 0;
        break;
      }
      var wallTop2 = P.wallProfile[x] !== undefined ? P.wallProfile[x] : P.groundY;
      if (y < wallTop2) { wt = 0; break; }
      var sWt2 = 0.42;
      for (var sti2=0; sti2<P.strata.length; sti2++) {
        var st4=P.strata[sti2];
        if (y>=st4.topRow && y<st4.botRow) { sWt2=st4.wt; break; }
      }
      var depthT = mmin(1, mmax(0, (wallTop2 - P.skyH) / (P.groundY - P.skyH)));
      sWt2 = sWt2 * (1.0 - depthT * 0.45);
      var rTop2 = x < w-1 ? (P.wallProfile[x+1] !== undefined ? P.wallProfile[x+1] : P.groundY) : wallTop2;
      var cliffH2 = mmax(0, rTop2 - wallTop2);
      if (cliffH2 > 0 && y > wallTop2 && y < wallTop2 + cliffH2) {
        sWt2 = mmin(sWt2 * 2.0 + 0.22, 1.0);
      }
      var cliffBase2 = wallTop2 + cliffH2;
      if (cliffH2 > 0 && y > cliffBase2 && y < cliffBase2 + 5) {
        var talusFade2 = 1 - (y - cliffBase2) / 5.0;
        if (safeMod(x*17+y*11+cliffH2*3, 100) < mfloor(talusFade2 * 38)) sWt2 = mmin(sWt2+0.18, 0.72);
      }
      if (y === wallTop2) sWt2 *= 0.30;
      if (safeMod(x*5+y*9,37) < 2) sWt2 = mmin(sWt2 + 0.07, 1.0);
      wt = constrain(sWt2, 0, 1.0);
      break;
    }
  }
  return wt;
}

// ── Generate pattern params (Larkspur) ────────────────────────────

// ── Zone Composition Helper ──────────────────────────────────────
// ── Rigorous Zone Composition Helper ─────────────────────────────
function composeZone(zx, zy, zw, zh, prng) {
  var shapes = [];
  var rf = function(a,b){return prng.rfl(a,b);};
  var ri = function(a,b){return prng.rin(a,b);};
  var colors = ['red', 'blue', 'yellow', 'black', 'white'];
  
  if (currentEngine === 'mondrian_geo') {
    var q = [[zx, zy, zw, zh, 0]];
    while(q.length) {
      var c = q.shift();
      if (c[4] > ri(1,3) || c[2] < 10 || c[3] < 10 || rf() < 0.2) {
        shapes.push({
          type: 'rect', x: c[0], y: c[1], w: c[2], h: c[3],
          color: (rf() > 0.7) ? colors[ri(0,3)] : 'white'
        });
      } else {
        if (rf() < 0.5) { 
          var s = ri(mfloor(c[2]*0.3), mfloor(c[2]*0.7));
          q.push([c[0], c[1], s, c[3], c[4]+1]);
          q.push([c[0]+s, c[1], c[2]-s, c[3], c[4]+1]);
        } else {
          var s = ri(mfloor(c[3]*0.3), mfloor(c[3]*0.7));
          q.push([c[0], c[1], c[2], s, c[4]+1]);
          q.push([c[0], c[1]+s, c[2], c[3]-s, c[4]+1]);
        }
      }
    }
  } else {
    var cx = zx + zw/2, cy = zy + zh/2;
    var domR = Math.min(zw, zh) * rf(0.2, 0.4);
    var domType = rf() < 0.5 ? 'circle' : 'rect';
    if (domType === 'circle') {
      shapes.push({type: 'circle', cx: cx + rf(-domR, domR), cy: cy + rf(-domR, domR), r: domR, color: colors[ri(0,4)]});
    } else {
      var dw = domR*ri(1,3), dh = domR*ri(1,3);
      shapes.push({type: 'rect', x: cx - dw/2 + rf(-dw,dw), y: cy - dh/2 + rf(-dh,dh), w: dw, h: dh, color: colors[ri(0,4)]});
    }
    for(var i=0; i<ri(1,3); i++) {
      var isV = rf() < 0.5;
      var bw = isV ? ri(2,5) : ri(15, zw);
      var bh = isV ? ri(15, zh) : ri(2,5);
      shapes.push({type: 'bar', x: zx + ri(0, Math.max(1, zw-bw)), y: zy + ri(0, Math.max(1, zh-bh)), w: bw, h: bh, color: 'black'});
    }
    for(var i=0; i<ri(1,3); i++) {
      var at = ri(0,3);
      var ar = domR * rf(0.2, 0.5);
      var ax = cx + rf(-zw*0.4, zw*0.4), ay = cy + rf(-zh*0.4, zh*0.4);
      if(at===0) shapes.push({type:'circle', cx:ax, cy:ay, r:ar, color: colors[ri(0,4)]});
      else if(at===1) shapes.push({type:'rect', x:ax-ar, y:ay-ar, w:ar*2, h:ar*2, color: colors[ri(0,4)]});
      else shapes.push({type:'triangle', x:ax-ar, y:ay-ar, w:ar*2, h:ar*2, dir:['up','down','left','right'][ri(0,3)], color: colors[ri(0,4)]});
    }
  }

  var colorSig = {white: 0.06, yellow: 0.18, red: 0.52, blue: 0.38, black: 0.88};
  shapes.forEach(function(s) {
    if (!s.color) s.color = 'white';
    s.innerDensity = colorSig[s.color];
  });
  return shapes;
}


function generatePatternParams(eng,prng,w,h){
  var P={},rf=function(a,b){return prng.rfl(a,b);},ri=function(a,b){return prng.rin(a,b);};
  switch(eng){
    case 'kagome': P.period=ri(30,80);P.thickness=mfloor(P.period*rf(0.08,0.18));P.dotR=mfloor(P.period*rf(0.1,0.25));P.dotWt=(rf()>0.3)?rf(3,8):0;P.kagomeWt=rf(4,9);break;
    case 'asanoha': P.period=mfloor(w*rf(0.12,0.28));P.thickness=ri(2,4);P.starWt=rf(5,10);break;
    case 'seigaiha': P.period=mfloor(w*rf(0.15,0.4));P.amp=P.period*rf(0.15,0.35);P.rowSpacing=P.amp*rf(0.7,1.4);P.thickness=ri(1,3);P.stripeSpacing=P.thickness*ri(3,7);P.waveWt=rf(3,8);break;
    case 'shippo': P.radius=mfloor(w*rf(0.12,0.25));P.thickness=ri(2,4);P.circleWt=rf(5,10);P.hasStar=rf()>0.5?1:0;P.starWt=rf(3,7);break;
    case 'kikkou': P.radius=mfloor(w*rf(0.08,0.2));P.thickness=ri(2,4);P.hexWt=rf(6,12);P.innerOffset=ri(0,1)===1?ri(6,15):0;break;
    case 'kente': P.stripW=mfloor(w/ri(6,15));P.blockH=mfloor(P.stripW*rf(1.0,2.5));P.seamW=ri(2,6);P.seamWt=rf(5,12);P.cP=ri(6,14);P.cT=ri(3,7);P.cWt=rf(4,9);P.wP=ri(4,10);P.wT=ri(1,3);P.wWt=rf(3,8);P.sP=ri(6,14);P.sT=ri(2,6);P.sWt=rf(4,9);P.bWt=rf(2,6);break;
    case 'bogolan': P.orientation=ri(0,1);P.stripW=mfloor((P.orientation===1?w:h)/ri(3,9));P.motifs=[];for(var bi=0;bi<ri(2,5);bi++)P.motifs.push({type:ri(0,3),p1:ri(20,60),p2:ri(4,15),wt:rf(4,9)});P.borderT=ri(2,8);P.borderWt=rf(5,12);break;
    case 'navajo': P.bandH=mfloor(h/ri(3,7));var nbn=ri(3,7);P.bands=[];for(var nbi=0;nbi<nbn;nbi++)P.bands.push({type:ri(0,2),diaR:mfloor(P.bandH*rf(0.3,0.45)),stepSz:ri(2,6),amp:ri(4,15),period:ri(20,50),wt:rf(4,9)});P.bands[mfloor(nbn/2)].type=0;P.stripeT=ri(2,8);P.stripeWt=rf(3,8);break;
    case 'dazzler': P.radius=mfloor(mmin(w,h)*rf(0.3,0.5));P.stepSize=ri(2,8);P.dazzleWt=rf(6,12);P.layers=ri(3,7);P.layerSpacing=mfloor(P.radius/P.layers);break;
    case 'glitch': P.tearH=ri(10,50);P.tearMax=ri(5,40);P.spikeFreq=ri(1,5);P.spikeWt=rf(10,20);P.scanP=ri(4,10);P.scanT=ri(1,3);P.scanWt=rf(2,6);P.smears=[];for(var si=0;si<ri(5,12);si++)P.smears.push({cx:mfloor(w*rf()),cy:mfloor(h*rf()),len:ri(40,150),angle:rf()<0.5?Math.PI/2:0,thresh:rf(0.3,0.7),wt:rf(5,12)});P.blocks=[];for(var bli=0;bli<ri(3,8);bli++)P.blocks.push({cx:mfloor(w*rf()),cy:mfloor(h*rf()),size:ri(20,60),wt:rf(6,15)});P.cells=[];for(var ci=0;ci<ri(10,25);ci++)P.cells.push({cx:mfloor(w*rf()),cy:mfloor(h*rf()),wt:rf(0,30)});P.cellSize=ri(2,8);break;
    case 'mondrian': P.rects=[];var q=[[0,0,w,h,0]];while(q.length){var cc=q.shift(),cw2=cc[2]-cc[0],ch2=cc[3]-cc[1];if(cc[4]>3||cw2<8||ch2<8||rf()<0.15){P.rects.push({x:cc[0],y:cc[1],w:cw2,h:ch2,bw:ri(1,3),borderWt:rf(10,20),fillWt:rf()<0.4?rf(2,8):0});}else if(rf()<0.5){var sx=cc[0]+ri(mfloor(cw2*0.3),mfloor(cw2*0.7));q.push([cc[0],cc[1],sx,cc[3],cc[4]+1]);q.push([sx,cc[1],cc[2],cc[3],cc[4]+1]);}else{var sy=cc[1]+ri(mfloor(ch2*0.3),mfloor(ch2*0.7));q.push([cc[0],cc[1],cc[2],sy,cc[4]+1]);q.push([cc[0],sy,cc[2],cc[3],cc[4]+1]);}}break;
    case 'flow': P.scrolls=[];for(var fs=0;fs<ri(2,5);fs++)P.scrolls.push([rf(5,20),rf(0.5,3),rf(3,8)]);P.diamonds=[];for(var fd=0;fd<ri(2,5);fd++)P.diamonds.push([mfloor(w*rf()),mfloor(h*rf()),ri(10,30),ri(1,5),rf(3,8)]);P.dP=ri(8,20);P.dT=ri(1,3);P.dWt=rf(3,8);break;
    case 'stolz': P.blocks=[];var gw=ri(3,6),gh=ri(4,8),bw3=mfloor(w/gw),bh3=mfloor(h/gh);for(var gx=0;gx<gw;gx++)for(var gy=0;gy<gh;gy++)P.blocks.push({x:gx*bw3,y:gy*bh3,w:bw3,h:bh3,type:ri(0,3),sd:ri(2,6),wtMain:rf(5,20),wtSub:rf(1,8)});break;
    case 'tol': P.layers=[];for(var tl=0;tl<ri(2,5);tl++)P.layers.push([ri(6,30),ri(2,8),rf(2,8)]);break;
    case 'mastor': P.diamonds=[];for(var md=0;md<ri(2,5);md++)P.diamonds.push([mfloor(w/2+rf(-w*0.2,w*0.2)),mfloor(h/2+rf(-h*0.2,h*0.2)),ri(10,40),ri(1,5),rf(3,8)]);P.diagP=ri(4,16);P.diagT=ri(1,mfloor(P.diagP/2));P.diagWt=rf(1,4);P.adiagP=ri(4,16);P.adiagT=ri(1,mfloor(P.adiagP/2));P.adiagWt=rf(1,4);break;
    case 'virma': P.borderW=ri(5,15);P.step=ri(3,10);P.stepT=ri(1,mmax(2,mfloor(P.step/2)));P.stepWt=rf(3,8);P.step2=ri(3,10);P.stepT2=ri(1,mmax(2,mfloor(P.step2/2)));P.stepWt2=rf(2,6);P.innerW=ri(5,15);P.innerP=ri(8,20);P.innerA=ri(2,6);P.innerWt=rf(3,7);P.centralR=ri(15,35);P.centralRing=ri(2,6);P.centralWt=rf(3,8);break;
    case 'ved': P.scrolls=[];for(var vs=0;vs<ri(2,5);vs++)P.scrolls.push([rf(5,20),rf(0.5,3),rf(3,8)]);P.bandStep=ri(4,12);P.bandT=ri(1,mmax(2,mfloor(P.bandStep/2)));P.bandWt=rf(1,4);break;
    case 'kepe': P.peakH=ri(8,20);P.peakW=ri(6,16);P.peakWt=rf(3,8);P.fillStep=ri(3,8);P.fillT=ri(1,mmax(2,mfloor(P.fillStep/2)));P.fillWt=rf(2,5);P.crownR=ri(15,35);P.crownRing=ri(2,5);P.crownWt=rf(2,6);break;
    case 'kolya': P.cornerSize=ri(15,mfloor(mmin(w,h)*0.4));P.fillP=ri(8,20);P.fillW=ri(1,3);P.cornerWt=rf(3,8);P.chevP=ri(6,16);P.chevA=ri(2,6);P.chevWt=rf(2,5);P.edgeW=ri(2,6);P.edgeWt=rf(2,5);break;
    case 'sermat':{var nc=ri(3,8);P.centers=[];P.weights=[];var spX=w/(Math.ceil(Math.sqrt(nc))+1),spY=h/(Math.ceil(nc/Math.ceil(Math.sqrt(nc)))+1);for(var sci=0;sci<nc;sci++){var col2=sci%Math.ceil(Math.sqrt(nc)),row2=mfloor(sci/Math.ceil(Math.sqrt(nc)));P.centers.push([mfloor(spX*(col2+1)+rf(-spX*0.2,spX*0.2)),mfloor(spY*(row2+1)+rf(-spY*0.2,spY*0.2))]);P.weights.push(rf(3,8));}P.armW=ri(2,5);P.armL=ri(4,12);P.ringR=ri(8,25);P.ringW=ri(1,4);P.ringWt=rf(2,6);break;}
    case 'chipaz':{var nr=ri(4,8);P.rays=[];for(var cri=0;cri<nr;cri++){var ang=cri*Math.PI*2/nr,dist=rf(10,35);P.rays.push([mfloor(w/2+Math.cos(ang)*dist),mfloor(h/2+Math.sin(ang)*dist*(h/w)),ri(1,3),ri(3,10),rf(3,8)]);}P.sunR=ri(12,30);P.sunRing=ri(2,5);P.sunWt=rf(3,8);P.glowP=ri(6,16);P.glowT=ri(1,3);P.glowWt=rf(1,3);break;}
    case 'azulejo': P.tileSize=ri(20,mfloor(mmin(w,h)*0.4));P.medR=mfloor(P.tileSize*rf(0.2,0.4));P.medT=ri(2,6);P.medWt=rf(5,12);P.cornerR=mfloor(P.tileSize*rf(0.3,0.6));P.cornerT=ri(2,5);P.cornerWt=rf(4,9);P.cornerInnerR=mfloor(P.cornerR*rf(0.4,0.7));P.cornerInnerWt=rf(3,8);P.grout=ri(2,6);P.groutWt=rf(6,15);break;
    case 'arraiolos': P.centerR=mfloor(mmin(w,h)*rf(0.15,0.25));P.stepSz=ri(3,8);P.centerWt=rf(6,12);var b1W=mfloor(mmin(w,h)*rf(0.08,0.15));P.b1Start=mfloor(mmin(w,h)*rf(0.02,0.05));P.b1End=P.b1Start+b1W;P.b1Step=ri(4,10);P.b1T=mfloor(P.b1Step/2)||1;P.b1Wt=rf(5,10);P.b2Start=P.b1End+ri(4,10);P.b2End=P.b2Start+ri(10,30);P.b2P=ri(6,14);P.b2T=ri(1,4);P.b2Wt=rf(4,8);P.fieldP=ri(6,16);P.fieldT=ri(1,3);P.fieldWt=rf(2,6);break;
    case 'viana': P.bandH=ri(15,50);P.sepT=ri(2,6);P.sepWt=rf(5,10);P.bands=[];var nVb=ri(3,7);for(var vii=0;vii<nVb;vii++){var typ=ri(0,3);P.bands.push({type:typ,p1:typ===0?ri(10,30):typ===1?ri(15,40):typ===2?ri(2,10):ri(8,20),p2:typ===0?ri(4,12):typ===1?mfloor(P.bandH*rf(0.2,0.4)):typ===2?0:ri(1,4),wt:rf(4,10)});}break;
    case 'verena':{var nVB=ri(5,11),diag=rf()>0.5?1:-1;P.bands=[];for(var vbi=0;vbi<nVB;vbi++){var baseAng=diag*rf(0.2,0.7)+(rf()>0.7?Math.PI/2:0);P.bands.push({cx:rf(-w*0.1,w*1.1),cy:rf(-h*0.1,h*1.1),angle:baseAng+rf(-0.15,0.15),hw:rf(15,60),hl:rf(w*0.4,w*1.2),wt:rf(4,10)});}break;}
    case 'cypress_hills': P.hills=[];for(var chi=0;chi<ri(3,6);chi++)P.hills.push({amp:ri(20,80),period:ri(50,200),phase:rf(0,Math.PI*2),baseY:ri(mfloor(h*0.4),mfloor(h*0.9)),step:ri(4,12),wt:rf(4,12)});P.trees=[];for(var cti=0;cti<ri(5,15);cti++)P.trees.push({x:ri(mfloor(w*0.1),mfloor(w*0.9)),y:ri(mfloor(h*0.3),mfloor(h*0.7)),h:ri(40,120),w:ri(15,40),wt:rf(8,15)});P.sunR=ri(20,60);P.sunX=ri(mfloor(w*0.2),mfloor(w*0.8));P.sunY=ri(mfloor(h*0.1),mfloor(h*0.3));P.sunWt=rf(5,12);break;
    case 'sierra_sunset': P.mountains=[];for(var ssi=0;ssi<ri(4,8);ssi++)P.mountains.push({baseY:ri(mfloor(h*0.3),mfloor(h*0.8)),period:ri(80,250),amp:ri(30,100),thick:ri(10,30),step:ri(5,15),wt:rf(5,14)});P.skyBands=ri(4,10);P.skyWt=rf(2,6);break;
    case 'panoramic_dunes': P.dunes=[];for(var pdi=0;pdi<ri(4,9);pdi++)P.dunes.push({baseY:ri(mfloor(h*0.4),mfloor(h*0.9)),period:ri(150,400),amp:ri(40,120),phase:rf(0,Math.PI*2),thick:ri(15,40),wt:rf(6,12)});P.windLines=ri(10,30);P.windWt=rf(1,4);break;
    case 'framed_vista': P.borderW=mfloor(mmin(w,h)*rf(0.1,0.25));P.borderWt=rf(8,15);P.innerBorderT=ri(4,12);P.innerBorderWt=rf(5,10);P.vigHills=[];for(var fhi=0;fhi<3;fhi++)P.vigHills.push({baseY:ri(mfloor(h*0.5),mfloor(h*0.8)),period:ri(40,100),amp:ri(10,40),wt:rf(4,9)});P.vigTrees=[];for(var fti=0;fti<4;fti++)P.vigTrees.push({x:ri(P.borderW+10,w-P.borderW-10),y:ri(mfloor(h*0.4),mfloor(h*0.7)),h:ri(20,60),w:ri(10,20),wt:rf(6,12)});P.vigSunR=ri(15,30);P.vigSunX=mfloor(w/2)+ri(-40,40);P.vigSunY=ri(P.borderW+20,mfloor(h*0.4));P.vigSunWt=rf(5,10);P.cornerType=ri(0,2);P.cornerWt=rf(6,12);break;
    default:
      // band/diagonal group
      if(['adama','cherokee','shiprock','woodcut'].indexOf(eng)>=0){P.bands=[];for(var ngi=0;ngi<ri(2,5);ngi++)P.bands.push([ri(6,30),ri(2,8),rf(2,8)]);P.stepP=ri(4,14);P.stepT=ri(1,4);P.stepWt=rf(2,6);}
      // lattice group
      else if(['argyle','interlace','matsukawa','wari','kuba'].indexOf(eng)>=0){P.latP=ri(10,40);P.latT=ri(2,6);P.latWt=rf(4,10);P.ringR=ri(8,30);P.ringT=ri(1,4);P.ringWt=rf(2,6);}
      // radial group
      else if(['art_deco','axonometric','blueprint','circuit','tangents'].indexOf(eng)>=0){P.rings=[];for(var rgi=0;rgi<ri(2,6);rgi++)P.rings.push([ri(10,mfloor(mmin(w,h)*0.5)),ri(1,4),rf(3,10)]);P.diagP=ri(6,20);P.diagT=ri(1,4);P.diagWt=rf(2,6);}
      // stripe alternate group
      else if(['adire','fret_bands','optical_box','pulay','yagasuri'].indexOf(eng)>=0){P.bandH=ri(10,40);P.diagP=ri(6,20);P.diagT=ri(1,4);P.main=rf(4,10);P.stripeT=ri(2,6);P.stripeWt=rf(2,6);}
      // panelled
      else if(['panks','pakshats'].indexOf(eng)>=0){P.armW=ri(2,8);P.armL=ri(6,30);P.crossWt=rf(4,10);P.latP=ri(10,30);P.latT=ri(1,4);P.latWt=rf(2,6);}
      // collage
      else if(['collage','cubist'].indexOf(eng)>=0){P.sz=ri(15,40);P.diagP=ri(6,20);P.diagT=ri(1,4);P.latP=ri(8,20);P.latT=ri(1,3);P.latWt=rf(3,8);P.main=rf(4,10);}
      // block
      else if(['brutalist','malevich'].indexOf(eng)>=0){
        P.rects=[];
        var colors = ['red', 'blue', 'yellow', 'black', 'white'];
        var colorSig = {white: 0.06, yellow: 0.18, red: 0.52, blue: 0.38, black: 0.88};
        if (!P.shapes) P.shapes = [];
        for(var bri2=0;bri2<ri(4,10);bri2++){
          var cw = ri(5,mfloor(w*0.4)), ch = ri(5,mfloor(h*0.4));
          var cx = mfloor(w*rf()), cy = mfloor(h*rf());
          var col = colors[ri(0,4)];
          P.rects.push({x:cx,y:cy,w:cw,h:ch,wt:rf(4,12)});
          P.shapes.push({type:'rect', x:cx, y:cy, w:cw, h:ch, color:col, innerDensity:colorSig[col]});
        }
      }
      // current/chief
      else if(['current','spider_cross','chiefs'].indexOf(eng)>=0){P.amp=ri(4,20);P.period=ri(15,50);P.main=rf(4,10);P.ringR=ri(10,35);P.ringWt=rf(3,8);}
      // kudo
      else if(eng==='kudo'){P.bW=ri(10,25);P.bH=ri(5,14);P.mortar=ri(1,3);P.bWt=rf(5,12);}
      // sermat-kudo
      else if(eng==='sermat-kudo'){P.centers=[];for(var skci=0;skci<ri(3,8);skci++)P.centers.push([mfloor(w*rf()),mfloor(h*rf())]);P.armW=ri(2,6);P.armL=ri(5,20);P.weights=[rf(3,8),rf(5,12),rf(2,6),rf(4,9)];P.ringR=ri(10,30);P.ringW=ri(1,4);P.ringWt=rf(2,6);}
      break;

    // ── De Stijl — proper horizontal/vertical grid + color cells ──
    // A virtual Mondrian: divide the page with 2-4 H lines and 2-4 V lines.
    // Assign color roles to the resulting cells. The largest cell is always white.
    // Primary color cells (red, blue, yellow, black) each carry a distinct
    // typewriter character pattern so you can read the color map in monochrome.
    case 'mondrian_geo': {
      var minGap = 7; // minimum cells between dividers
      P.divH = [];
      var nH = ri(2,4), hStep = mfloor((h-4)/(nH+1));
      for(var hi=0;hi<nH;hi++) P.divH.push(2+hStep*(hi+1)+ri(-3,3));
      P.divV = [];
      var nV = ri(2,4), vStep = mfloor((w-4)/(nV+1));
      for(var vi=0;vi<nV;vi++) P.divV.push(2+vStep*(vi+1)+ri(-5,5));
      var rowBounds=[0].concat(P.divH).concat([h]);
      var colBounds=[0].concat(P.divV).concat([w]);
      P.cells=[];
      P.shapes=[];
      for(var rb=0;rb<rowBounds.length-1;rb++) {
        for(var cb=0;cb<colBounds.length-1;cb++) {
          P.cells.push({x:colBounds[cb],y:rowBounds[rb],w:colBounds[cb+1]-colBounds[cb],h:rowBounds[rb+1]-rowBounds[rb],color:'white'});
        }
      }
      // Sort largest→smallest, assign palette in order: white(largest), then primaries
      P.cells.sort(function(a,b){return (b.w*b.h)-(a.w*a.h);});
      P.cells[0].color='white';
      var palette=['red','blue','yellow','black'];
      var pi2=0;
      for(var ci4=1;ci4<P.cells.length;ci4++){
        var cl = P.cells[ci4];
        if(cl.w>6 && cl.h>4 && pi2<palette.length){
          cl.color = palette[pi2++];
          var cellShapes = composeZone(cl.x, cl.y, cl.w, cl.h, prng);
          P.shapes = P.shapes.concat(cellShapes);
        }
      }
      break;
    }

    // ── Suprematist — anchored composition with color-density mapping ─
    // Dominant shape off-center (golden-ratio anchor), secondaries in opposing
    // quadrants, bars for dynamic tension. Density maps to implied color:
    //   blank=white · sparse=yellow · diagonal=red · lattice=blue · dense=black
    case 'suprematist': {
      P.shapes=[];
      function clamp2(v,lo,hi){return mmax(lo,mmin(hi,v));}
      var nZones = ri(2, 3);
      for (var zi = 0; zi < nZones; zi++) {
        var zw = ri(15, 25);
        var zh = ri(10, 20);
        var zx, zy;
        if (zi === 0) {
          zx = mfloor(w * 0.382 - zw/2 + rf(-w*0.05, w*0.05));
          zy = mfloor(h * 0.382 - zh/2 + rf(-h*0.05, h*0.05));
        } else if (zi === 1) {
          zx = mfloor(w * 0.7 - zw/2 + rf(-w*0.05, w*0.05));
          zy = mfloor(h * 0.7 - zh/2 + rf(-h*0.05, h*0.05));
        } else {
          zx = mfloor(w * 0.7 - zw/2 + rf(-w*0.05, w*0.05));
          zy = mfloor(h * 0.25 - zh/2 + rf(-h*0.05, h*0.05));
        }
        zx = clamp2(zx, 1, w - zw - 1);
        zy = clamp2(zy, 1, h - zh - 1);
        var clusterShapes = composeZone(zx, zy, zw, zh, prng);
        P.shapes = P.shapes.concat(clusterShapes);
      }
      break;
    }

    // ── Kandinsky Composition ─────────────────────────────────────────
    case 'kandinsky_comp': {
      P.shapes=[];
      function clamp3(v,lo,hi){return mmax(lo,mmin(hi,v));}
      var colors = ['red', 'blue', 'yellow', 'black', 'white'];
      var colorSig = {
        white: 0.06, yellow: 0.18, red: 0.52, blue: 0.38, black: 0.88
      };
      var sz3;
      var c1 = colors[ri(0, 4)];
      sz3=ri(9,16); P.shapes.push({type:'circle',r:sz3,cx:clamp3(mfloor(rf(sz3+2,w-sz3-2)),sz3+1,w-sz3-1),cy:clamp3(mfloor(rf(sz3+2,h/2)),sz3+1,h/2),color:c1,innerDensity:colorSig[c1]});
      var c2 = colors[ri(0, 4)];
      sz3=ri(10,18); P.shapes.push({type:'semicircle',r:sz3,dir:['up','down'][ri(0,1)],cx:clamp3(mfloor(rf(sz3+2,w-sz3-2)),sz3+1,w-sz3-1),cy:clamp3(mfloor(rf(h/2,h-sz3-2)),sz3+1,h-sz3-1),color:c2,innerDensity:colorSig[c2]});
      var c3 = colors[ri(0, 4)];
      var tdir=['up','down','right','left'][ri(0,3)];var tw=ri(sz3,sz3+8),th=ri(mfloor(sz3*0.8),sz3+5);
      P.shapes.push({type:'triangle',dir:tdir,w:tw,h:th,x:clamp3(mfloor(rf(2,w-tw-2)),1,w-tw-1),y:clamp3(mfloor(rf(2,h-th-2)),1,h-th-1),color:c3,innerDensity:colorSig[c3]});
      var nka=ri(1,3);for(var ki2=0;ki2<nka;ki2++){
        sz3=ri(4,9);var kt=rf()<0.5?'circle':'triangle';
        var ck = colors[ri(0, 4)];
        if(kt==='circle') P.shapes.push({type:'circle',r:sz3,cx:clamp3(mfloor(rf(sz3+2,w-sz3-2)),sz3+1,w-sz3-1),cy:clamp3(mfloor(rf(sz3+2,h-sz3-2)),sz3+1,h-sz3-1),color:ck,innerDensity:colorSig[ck]});
        else{var ktw=ri(sz3,sz3+5),kth=ri(sz3,sz3+4);P.shapes.push({type:'triangle',dir:['up','down','right','left'][ri(0,3)],w:ktw,h:kth,x:clamp3(mfloor(rf(2,w-ktw-2)),1,w-ktw-1),y:clamp3(mfloor(rf(2,h-kth-2)),1,h-kth-1),color:ck,innerDensity:colorSig[ck]});}
      }
      P.bgP=ri(6,14);P.bgT=ri(1,2);P.bgR=ri(8,16);P.bgWt=rf(0.18,0.32);
      break;
    }

    // ── Canyon Lands ─────────────────────────────────────────────────────
    // Authentic sedimentary mesa country — no buildings, nature only.
    // Three depth layers of mesa formations, each with organic stepped profiles.
    // Global geological strata bands span full width: hard/soft alternating layers.
    // Cliff faces shadow dark. Mesa tops lit light. Talus fans soften cliff bases.
    // Atmospheric depth: distant formations grade lighter.
    case 'canyonlands': {
      P.skyH   = ri(2,6);
      P.groundY = ROWS - ri(2,4);

      // ── Geological strata (named after actual SW formations for posterity) ──
      // Ordered top → bottom. Hard caps, pale sandstones, dark shales alternate.
      var strataDefs = [
        {wt:0.92, h:ri(1,2)},  // cap rock      — dense, protects mesa tops
        {wt:0.24, h:ri(2,4)},  // de Chelly ss  — pale cream sandstone
        {wt:0.75, h:ri(1,3)},  // Chinle shale   — dark purple-red
        {wt:0.18, h:ri(3,5)},  // Coconino ss   — white crossbedded
        {wt:0.68, h:ri(1,3)},  // Hermit shale  — brick red mudstone
        {wt:0.20, h:ri(2,4)},  // Supai ss      — pale limestone
        {wt:0.82, h:ri(1,2)},  // Redwall lst   — dark impermeable
        {wt:0.30, h:ri(2,4)},  // Bright Angel  — green-grey shale
        {wt:0.72, h:ri(1,2)},  // Tapeats ss    — brown sandstone base
        {wt:0.42, h:ri(2,5)},  // Vishnu schist — ancient basement
      ];
      P.strata = [];
      var srp = P.skyH;
      for (var di2=0; di2<strataDefs.length && srp<P.groundY; di2++) {
        var sd2 = strataDefs[di2];
        P.strata.push({topRow:srp, botRow:mmin(srp+sd2.h, P.groundY), wt:sd2.wt});
        srp += sd2.h;
      }
      while (srp < P.groundY) { P.strata.push({topRow:srp,botRow:mmin(srp+2,P.groundY),wt:0.45}); srp+=2; }

      // ── Mesa/butte formation profiles ────────────────────────────────────
      // Each formation is a stepped silhouette. Platform widths are deliberately
      // varied (2-14 cols) and edges are probabilistically eroded so no step
      // reads as a perfectly rectangular building wall.
      P.wallProfile = [];
      for (var cp3=0; cp3<w; cp3++) P.wallProfile[cp3] = P.groundY;

      var nForms = ri(3,7); // more forms = richer landscape
      for (var fi2=0; fi2<nForms; fi2++) {
        // Each form has a unique horizontal extent and base height
        var formW  = ri(10,32);
        var formX  = ri(0, mmax(1, w - formW));
        var formEnd = mmin(formX + formW, w);
        // Foreground forms (later index) start lower = taller = more prominent
        var proximity = fi2 / (nForms - 1 + 0.001); // 0=far, 1=near
        var topBand = mfloor(P.skyH + 2 + (1 - proximity) * (P.groundY - P.skyH) * 0.55);
        topBand = ri(topBand, mmin(topBand + ri(1,5), P.groundY - 8));

        var col4 = formX, level2 = topBand;
        while (col4 < formEnd) {
          // Organic platform width: short (2-5 cols) 30% of time, longer (5-14) otherwise
          var platW2 = rf() < 0.30 ? ri(2,5) : ri(5,14);
          var platEnd2 = mmin(col4 + platW2, formEnd);

          for (var cpx2=col4; cpx2<platEnd2; cpx2++) {
            // Edge erosion: ~6% chance of 1-row notch, ~2% chance of 2-row notch
            var eroNoise = safeMod(cpx2*11 + level2*7 + fi2*19, 100);
            var ero2 = eroNoise < 2 ? 2 : eroNoise < 8 ? 1 : 0;
            P.wallProfile[cpx2] = mmin(P.wallProfile[cpx2], level2 + ero2);
          }

          // Step height: 1-5 rows. Rarely taller than 5 so no cliff reads as a wall.
          level2 += ri(1,5);
          col4 = platEnd2;
        }
      }

      // Isolated pinnacle/hoodoo: narrow column(s) standing alone
      if (rf() > 0.45) {
        var pinX = ri(3, w-4);
        var pinH = ri(3, 10);
        var pinW = ri(1, 3);
        var pinTop = P.strata[0] ? P.strata[0].topRow + ri(1,4) : P.skyH + 3;
        for (var px=pinX; px<mmin(pinX+pinW,w); px++) {
          P.wallProfile[px] = mmin(P.wallProfile[px], pinTop + ri(0,2));
        }
      }

      break;
    }
  }
  return P;
}

// ── Build grid ────────────────────────────────────────────────────
function buildGrid() {
  var prng = makePRNG(seed);
  var params = generatePatternParams(currentEngine, prng, COLS, ROWS);

  // pass 1: raw weights
  var rawWt = new Array(COLS * ROWS);
  var wMax = -Infinity;
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      var wt = calcMotifWeight(c, r, COLS, ROWS, currentEngine, params);
      var jitter = wt > 0 ? (((c * 37 + r * 13) % 100) / 400.0) : 0;
      wt += jitter;
      rawWt[r * COLS + c] = wt;
      if (wt > wMax) wMax = wt;
    }
  }

  // pass 2: normalise → RAMP → grid
  var wRange = (wMax < 0.05) ? 1 : wMax;
  var g = [];
  for (var r2 = 0; r2 < ROWS; r2++) {
    g[r2] = [];
    for (var c2 = 0; c2 < COLS; c2++) {
      var norm = rawWt[r2 * COLS + c2] / wRange;
      if (norm < 0.07) { g[r2][c2] = null; continue; }
      var lvl = Math.round(norm * MAXLVL * gain);
      lvl = Math.max(1, Math.min(MAXLVL, lvl));
      var stack = RAMP[lvl].slice();
      stack.wt = norm;
      g[r2][c2] = stack;
    }
  }

  applyPalms(g);
  applyBorder(g);
  g._params = params; // store for drawBoldShapes access

  // shape hints for old mondrian/brutalist engines (faint dashed)
  shapeHints = [];
  if (currentEngine === 'mondrian' || currentEngine === 'brutalist' || currentEngine === 'malevich') {
    buildShapeHints(params, makePRNG(seed + 77777));
  }

  // bold shapes for new modernist engines
  boldShapes = [];
  if (currentEngine === 'suprematist' || currentEngine === 'kandinsky_comp' || currentEngine === 'mondrian_geo') {
    boldShapes = params.shapes || [];
  }
  // mondrian_geo uses divider lines — stored separately in params.divH/divV/cells
  // canyonlands uses wall profile — no bold shapes overlay needed

  return g;
}

// ── Universal palm trees (Flanagan I* motif) ──────────────────────
// Runs as post-process after any engine. Seeded from seed+99991 so
// palm positions are deterministic per seed but independent of engine.
function stampPalm(g, baseCol, baseRow, palmRnd, scale) {
  var I = ['I','*'];
  scale = scale || 1;
  var h2 = Math.max(2, Math.round((4 + Math.floor(palmRnd.rfl()*5)) * scale));
  var lean = (palmRnd.rfl() - 0.5) * 0.4;
  for (var i = 0; i < h2; i++) stamp(g, baseCol + Math.round(lean*i), baseRow - i, I);
  var crC = baseCol + Math.round(lean * h2);
  var crR = baseRow - h2;
  var fronds = 5 + Math.floor(palmRnd.rfl() * 4);
  for (var f = 0; f < fronds; f++) {
    var ang = (f / (fronds-1)) * (Math.PI * 0.84) + (Math.PI * 0.08);
    ang = -ang; // fan upward
    var len = Math.max(2, Math.round((2 + Math.floor(palmRnd.rfl()*3)) * scale));
    for (var s = 1; s <= len; s++) {
      stamp(g, crC + Math.round(Math.cos(ang)*s), crR + Math.round(Math.sin(ang)*s*0.65), I);
    }
  }
  for (var fd = 0; fd < 2; fd++) {
    var dir = fd ? 1 : -1;
    for (var s2 = 1; s2 <= Math.max(2, Math.round(2*scale)); s2++) {
      stamp(g, crC + dir*Math.round(s2*1.3), crR + Math.round(s2*0.45)+1, I);
    }
  }
  stamp(g, crC, crR, I);
}

function applyPalms(g) {
  if (!showPalms) return;
  var pr = makePRNG(seed + 99991);
  var n = 1 + Math.floor(pr.rfl() * 4); // 1-4 palms
  for (var i = 0; i < n; i++) {
    var baseCol = 4 + Math.floor(pr.rfl() * (COLS - 8));
    // distribute vertically across lower 60% of grid
    var baseRow = Math.floor(ROWS * 0.38 + pr.rfl() * ROWS * 0.55);
    var scale = 0.65 + pr.rfl() * 0.85;
    stampPalm(g, baseCol, baseRow, pr, scale);
  }
}

function applyBorder(g) {
  var b = BORDERS[borderKey];
  if (!b) return;
  for (var c = 0; c < COLS; c++) { stamp(g,c,0,b.top); stamp(g,c,ROWS-1,b.top); }
  for (var r = 0; r < ROWS; r++) { stamp(g,0,r,b.side); stamp(g,COLS-1,r,b.side); }
  stamp(g,0,0,b.corner); stamp(g,COLS-1,0,b.corner);
  stamp(g,0,ROWS-1,b.corner); stamp(g,COLS-1,ROWS-1,b.corner);
}

function stamp(g,c,r,stack) {
  if (r>=0&&r<ROWS&&c>=0&&c<COLS) g[r][c]=stack.slice();
}

// ── Shape hints (modernist shape overlays for mondrian/brutalist) ─
var SHAPE_TYPES = ['circle','semicircle-up','semicircle-down','triangle-up','triangle-down','triangle-left','triangle-right','rect-inset'];

function buildShapeHints(params, prng) {
  var rects = params.rects || [];
  var isMondrian = currentEngine === 'mondrian';
  
  // High-fidelity De Stijl distribution pool
  var colorPool = ['red', 'blue', 'yellow', 'black', 'white', 'white', 'white', 'white', 'white'];
  
  // Fisher-Yates shuffle colors with sketch PRNG
  for (var k = colorPool.length - 1; k > 0; k--) {
    var j = prng.rin(0, k);
    var temp = colorPool[k];
    colorPool[k] = colorPool[j];
    colorPool[j] = temp;
  }
  
  var colorIdx = 0;
  for (var i = 0; i < rects.length; i++) {
    var r = rects[i];
    var isEmpty = isMondrian ? (r.fillWt === 0 || r.fillWt < 1) : true;
    if (!isEmpty) continue;
    if (r.w < 6 || r.h < 5) continue;
    if (prng.rfl() > 0.65) continue;
    var type = SHAPE_TYPES[prng.rin(0, SHAPE_TYPES.length - 1)];
    var pad = 1.5;
    
    var color = 'white';
    if (isMondrian) {
      color = colorPool[colorIdx % colorPool.length];
      colorIdx++;
    } else {
      color = prng.rfl() > 0.5 ? 'black' : 'white';
    }
    
    shapeHints.push({
      gx: r.x + pad, gy: r.y + pad,
      gw: r.w - pad*2, gh: r.h - pad*2,
      type: type,
      color: color
    });
  }
}

function drawShapeHints() {
  if (!shapeHints.length) return;
  var ctx = drawingContext;
  ctx.save();
  ctx.strokeStyle = '#1a1715';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);

  for (var i = 0; i < shapeHints.length; i++) {
    var h = shapeHints[i];
    var x1 = ORIGIN_X + h.gx * CELL_W;
    var y1 = ORIGIN_Y + h.gy * CELL_H;
    var rw = h.gw * CELL_W;
    var rh = h.gh * CELL_H;
    var cx = x1 + rw / 2, cy = y1 + rh / 2;
    var rx = Math.min(rw, rh) / 2;

    ctx.beginPath();
    if (h.type === 'circle') {
      ctx.arc(cx, cy, rx * 0.88, 0, Math.PI * 2);
    } else if (h.type === 'semicircle-up') {
      ctx.arc(cx, y1 + rh, rw * 0.42, Math.PI, 0);
      ctx.closePath();
    } else if (h.type === 'semicircle-down') {
      ctx.arc(cx, y1, rw * 0.42, 0, Math.PI);
      ctx.closePath();
    } else if (h.type === 'triangle-up') {
      ctx.moveTo(cx, y1 + rh * 0.08);
      ctx.lineTo(x1 + rw * 0.92, y1 + rh * 0.92);
      ctx.lineTo(x1 + rw * 0.08, y1 + rh * 0.92);
      ctx.closePath();
    } else if (h.type === 'triangle-down') {
      ctx.moveTo(cx, y1 + rh * 0.92);
      ctx.lineTo(x1 + rw * 0.08, y1 + rh * 0.08);
      ctx.lineTo(x1 + rw * 0.92, y1 + rh * 0.08);
      ctx.closePath();
    } else if (h.type === 'triangle-left') {
      ctx.moveTo(x1 + rw * 0.08, cy);
      ctx.lineTo(x1 + rw * 0.92, y1 + rh * 0.08);
      ctx.lineTo(x1 + rw * 0.92, y1 + rh * 0.92);
      ctx.closePath();
    } else if (h.type === 'triangle-right') {
      ctx.moveTo(x1 + rw * 0.92, cy);
      ctx.lineTo(x1 + rw * 0.08, y1 + rh * 0.08);
      ctx.lineTo(x1 + rw * 0.08, y1 + rh * 0.92);
      ctx.closePath();
    } else {
      var inset = Math.min(rw, rh) * 0.12;
      ctx.rect(x1 + inset, y1 + inset, rw - inset*2, rh - inset*2);
    }

    ctx.globalAlpha = 0.88;
    ctx.fillStyle = PALETTE[h.color] || '#f3ece0';
    ctx.fill();
    
    ctx.globalAlpha = 1.0;
    ctx.stroke();
  }
  ctx.restore();
}

// ── Bold overlays for modernist engines ──────────────────────────
function drawBoldShapes() {
  var ctx = drawingContext;

  // Mondrian_geo: draw the De Stijl grid dividers first
  if (currentEngine === 'mondrian' && grid._params && grid._params.rects) {
    var P = grid._params;
    ctx.save();
    for (var i = 0; i < P.rects.length; i++) {
      var r = P.rects[i];
      if (r.color && r.color !== 'white') {
        ctx.fillStyle = PALETTE[r.color] || '#ffffff';
        ctx.globalAlpha = 0.88;
        ctx.fillRect(ORIGIN_X + r.x * CELL_W, ORIGIN_Y + r.y * CELL_H, r.w * CELL_W, r.h * CELL_H);
      }
    }
    ctx.restore();
  }

  if (currentEngine === 'mondrian_geo' && grid._params) {
    var P = grid._params;
    ctx.save();
    for (var ci = 0; ci < P.cells.length; ci++) {
      var cl = P.cells[ci];
      if (cl.color !== 'white') {
        ctx.fillStyle = PALETTE[cl.color] || '#ffffff';
        ctx.globalAlpha = 0.12;
        ctx.fillRect(ORIGIN_X + cl.x * CELL_W, ORIGIN_Y + cl.y * CELL_H, cl.w * CELL_W, cl.h * CELL_H);
      }
    }
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = '#1a1715';
    ctx.lineWidth = 3.0;
    ctx.setLineDash([]);
    for(var dh=0;dh<P.divH.length;dh++){
      var dy=ORIGIN_Y+P.divH[dh]*CELL_H;
      ctx.beginPath(); ctx.moveTo(ORIGIN_X,dy); ctx.lineTo(ORIGIN_X+COLS*CELL_W,dy); ctx.stroke();
    }
    for(var dv=0;dv<P.divV.length;dv++){
      var dx=ORIGIN_X+P.divV[dv]*CELL_W;
      ctx.beginPath(); ctx.moveTo(dx,ORIGIN_Y); ctx.lineTo(dx,ORIGIN_Y+ROWS*CELL_H); ctx.stroke();
    }
    ctx.restore();
  }

  // Draw bold shapes for modernist engines (solid color fills + black stroke)
  if ((currentEngine === 'suprematist' || currentEngine === 'kandinsky_comp' || currentEngine === 'mondrian_geo' || currentEngine === 'brutalist' || currentEngine === 'malevich') && boldShapes.length) {
    ctx.save();
    ctx.strokeStyle = '#1a1715';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);

    for (var i = 0; i < boldShapes.length; i++) {
      var s = boldShapes[i];
      ctx.beginPath();
      
      var sx, sy, sw, sh, scx, scy, sr;
      if (s.type === 'rect' || s.type === 'bar') {
        sx = ORIGIN_X + s.x * CELL_W;
        sy = ORIGIN_Y + s.y * CELL_H;
        sw = s.w * CELL_W;
        sh = s.h * CELL_H;
        ctx.rect(sx, sy, sw, sh);
      } else if (s.type === 'circle') {
        scx = ORIGIN_X + s.cx * CELL_W;
        scy = ORIGIN_Y + s.cy * CELL_H;
        sr = s.r * CELL_W;
        ctx.arc(scx, scy, sr, 0, Math.PI * 2);
      } else if (s.type === 'semicircle') {
        scx = ORIGIN_X + s.cx * CELL_W;
        scy = ORIGIN_Y + s.cy * CELL_H;
        sr = s.r * CELL_W;
        if (s.dir === 'up')        { ctx.arc(scx, scy, sr, Math.PI, 0); ctx.closePath(); }
        else if (s.dir === 'down') { ctx.arc(scx, scy, sr, 0, Math.PI); ctx.closePath(); }
        else if (s.dir === 'left') { ctx.arc(scx, scy, sr, Math.PI / 2, -Math.PI / 2); ctx.closePath(); }
        else                       { ctx.arc(scx, scy, sr, -Math.PI / 2, Math.PI / 2); ctx.closePath(); }
      } else if (s.type === 'triangle') {
        var tx1 = ORIGIN_X + s.x * CELL_W;
        var ty1 = ORIGIN_Y + s.y * CELL_H;
        var tw = s.w * CELL_W;
        var th = s.h * CELL_H;
        if (s.dir === 'up')        { ctx.moveTo(tx1 + tw / 2, ty1); ctx.lineTo(tx1 + tw, ty1 + th); ctx.lineTo(tx1, ty1 + th); }
        else if (s.dir === 'down') { ctx.moveTo(tx1, ty1); ctx.lineTo(tx1 + tw, ty1); ctx.lineTo(tx1 + tw / 2, ty1 + th); }
        else if (s.dir === 'right'){ ctx.moveTo(tx1 + tw, ty1 + th / 2); ctx.lineTo(tx1, ty1); ctx.lineTo(tx1, ty1 + th); }
        else                       { ctx.moveTo(tx1, ty1 + th / 2); ctx.lineTo(tx1 + tw, ty1); ctx.lineTo(tx1 + tw, ty1 + th); }
        ctx.closePath();
      }
      
      ctx.globalAlpha = 0.88;
      ctx.fillStyle = PALETTE[s.color] || '#f3ece0';
      ctx.fill();
      
      ctx.globalAlpha = 1.0;
      ctx.stroke();
    }
    ctx.restore();
  }
}
function preload() {
  paperImg = loadImage('platen_white_c.jpg');
}

// ── Setup ─────────────────────────────────────────────────────────
function setup() {
  createCanvas(CW, CH);
  pixelDensity(2);
  textFont('Courier New');
  noLoop();

  var css = document.createElement('style');
  css.textContent = [
    'html,body{margin:0;padding:0;background:#151210;overflow:hidden;width:100vw;height:100vh;display:block;position:relative;}',
    '#canvas-wrap{width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;position:absolute;top:0;left:0;z-index:1;}',
    'canvas{display:block;flex-shrink:0;}',
    '#panel{position:absolute;top:16px;left:16px;z-index:1000;width:230px;max-height:calc(100vh - 32px);overflow-y:auto;overflow-x:hidden;',
    'background:rgba(26,24,22,0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);',
    'color:#c8c0b4;font:11px/1.4 "Courier New",monospace;padding:14px 12px;box-sizing:border-box;',
    'border:1px solid rgba(46,44,42,0.8);border-radius:8px;box-shadow:0 6px 24px rgba(0,0,0,0.5);',
    'transition:opacity 0.25s, transform 0.25s, background-color 0.25s, border-radius 0.25s;}',
    '#panel.collapsed{width:40px;height:40px;padding:0;overflow:hidden;border-radius:50%;background:rgba(26,24,22,0.9);box-shadow:0 4px 12px rgba(0,0,0,0.4);}',
    '#panel-toggle{width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;color:#f3ece0;user-select:none;position:absolute;top:0;left:0;z-index:1001;}',
    '#panel.collapsed #panel-toggle{width:100%;height:100%;}',
    '#panel-content{margin-top:28px;transition:opacity 0.2s ease;}',
    '#panel.collapsed #panel-content{opacity:0;pointer-events:none;}',
    '#panel h2{font-size:11px;color:#f3ece0;margin:0 0 2px;letter-spacing:2px;}',
    '#panel .sub{font-size:8px;color:#5a5450;margin-bottom:10px;}',
    '#panel .seed{font-size:13px;color:#f3ece0;margin:2px 0 4px;}',
    '#panel .eng{font-size:9px;color:#8a8070;margin:0 0 8px;letter-spacing:.5px;}',
    '#panel label{display:block;margin:10px 0 3px;color:#8a8378;font-size:9px;text-transform:uppercase;letter-spacing:1px;}',
    '#panel select,#panel input[type=range]{width:100%;background:#1a1816;color:#c8c0b4;',
    'border:1px solid #3a3835;padding:6px 4px;font:bold 13px "IBM Plex Mono","Courier New",monospace;border-radius:2px;outline:none;appearance:auto;}',
    '#panel select option{background:#1a1816;color:#c8c0b4;font:bold 13px "IBM Plex Mono","Courier New",monospace;}',
    '#panel select:focus,#panel input:focus{border-color:#5a5450;}',
    '#panel button{width:100%;padding:7px 0;margin:3px 0;background:#2a2826;',
    'color:#c8c0b4;border:1px solid #3a3835;font:11px "Courier New";cursor:pointer;border-radius:2px;}',
    '#panel button:hover{background:#3a3835;}',
    '#panel button.primary{background:#3d3a34;border-color:#5a5450;color:#f3ece0;}',
    '#panel .info{font-size:8px;color:#4a4845;margin-top:6px;line-height:1.5;}',
    '#panel hr{border:none;border-top:1px solid #2e2c2a;margin:10px 0;}',
    '#panel .row{display:flex;align-items:center;gap:6px;margin:6px 0;}',
    '#panel .row input[type=checkbox]{width:auto;margin:0;}'
  ].join('');
  document.head.appendChild(css);

  // Move canvas into the centering wrapper
  var wrap = document.createElement('div');
  wrap.id = 'canvas-wrap';
  document.body.appendChild(wrap);
  wrap.appendChild(document.querySelector('canvas'));

  // Build panel BEFORE fitCanvas so wrap.clientWidth is already reduced by the panel
  buildPanel();
  fitCanvas();
  setTimeout(fitCanvas, 150);
  freshSeed();
}

// fitCanvas measures wrap.clientWidth — the actual post-layout available pixels.
// No window.innerWidth guessing. Works correctly in any iframe or toolbar context.
function fitCanvas() {
  var wrap = document.getElementById('canvas-wrap');
  if (!wrap) return;
  var isMobile = window.innerWidth < 768;
  var padding = isMobile ? 40 : 80;
  var aW = wrap.clientWidth  - padding;
  var aH = wrap.clientHeight - padding;
  if (aW <= 10 || aH <= 10) return;
  var sc = Math.min(aW / CW, aH / CH);
  var cvs = document.querySelector('canvas');
  cvs.style.width  = Math.round(CW * sc) + 'px';
  cvs.style.height = Math.round(CH * sc) + 'px';
}

function windowResized() { fitCanvas(); }

// ── Panel ─────────────────────────────────────────────────────────
function buildPanel() {
  panel = createElement('div','');
  panel.id('panel');
  document.body.insertBefore(panel.elt, document.getElementById('canvas-wrap'));

  // Toggle button for collapsing panel on mobile / viewport
  var toggleBtn = createElement('div', '☰');
  toggleBtn.id('panel-toggle');
  toggleBtn.parent(panel);

  if (window.innerWidth < 768) {
    panel.addClass('collapsed');
    toggleBtn.html('☰');
  } else {
    toggleBtn.html('✕');
  }

  toggleBtn.mousePressed(function() {
    var p = document.getElementById('panel');
    var tb = document.getElementById('panel-toggle');
    if (p.classList.contains('collapsed')) {
      p.classList.remove('collapsed');
      tb.innerHTML = '✕';
    } else {
      p.classList.add('collapsed');
      tb.innerHTML = '☰';
    }
  });

  var content = createElement('div', '');
  content.id('panel-content');
  content.parent(panel);

  createElement('h2','PLATEN ARTYPER').parent(content);
  var sub = createElement('div','Flanagan 1938 · SM3');
  sub.class('sub'); sub.parent(content);

  lblSeed = createElement('div',''); lblSeed.class('seed'); lblSeed.parent(content);
  lblEngine = createElement('div',''); lblEngine.class('eng'); lblEngine.parent(content);

  btnRegen = createButton('REGENERATE');
  btnRegen.class('primary'); btnRegen.parent(content);
  btnRegen.mousePressed(freshSeed);

  createElement('hr','').parent(content);

  createElement('label','Engine').parent(content);
  selEngine = createSelect(); selEngine.parent(content);
  selEngine.option('random', 'random');
  for (var i=0; i<ENGINE_LIST.length; i++) selEngine.option(ENGINE_LIST[i], ENGINE_LIST[i]);
  selEngine.selected('random');
  selEngine.changed(function(){
    selectedEngine = selEngine.value();
    if (selectedEngine !== 'random') { currentEngine = selectedEngine; regenerate(); }
    else freshSeed();
  });

  createElement('label','Border').parent(content);
  selBorder = createSelect(); selBorder.parent(content);
  for (var j=0; j<BORDER_KEYS.length; j++) selBorder.option(BORDER_KEYS[j], BORDER_KEYS[j]);
  selBorder.selected('t*x');
  selBorder.changed(function(){ borderKey=selBorder.value(); regenerate(); });

  createElement('label','Ink Density').parent(content);
  sldGain = createSlider(30,140,85,1); sldGain.parent(content);
  sldGain.input(function(){ gain=sldGain.value()/100; regenerate(); });

  var chkRow = createElement('div',''); chkRow.class('row'); chkRow.parent(content);
  chkPalms = createCheckbox(' Palm trees', true); chkPalms.parent(chkRow);
  chkPalms.changed(function(){ showPalms=chkPalms.checked(); regenerate(); });

  createElement('hr','').parent(content);

  btnSave = createButton('SAVE PNG'); btnSave.parent(content);
  btnSave.mousePressed(function(){ saveCanvas('platen_'+currentEngine+'_'+seed,'png'); });

  btnScore = createButton('EXPORT TXT'); btnScore.parent(content);
  btnScore.mousePressed(dumpScore);

  createElement('hr','').parent(content);
    createElement('label','Space').parent(content);
  var selSpace = createSelect(); selSpace.parent(content);
  var SPACE_LIST = ['none', 'isometric', 'isometric (vertical)', 'polar', 'hyperbolic', 'planar', 'planar (abstract)', 'moire', 'moire (dazzler)'];
  for (var i=0; i<SPACE_LIST.length; i++) selSpace.option(SPACE_LIST[i], SPACE_LIST[i]);
  selSpace.selected('none');
  selSpace.changed(function(){
    currentSpace = selSpace.value();
    regenerate();
  });

  lblInfo = createElement('div',''); lblInfo.class('info'); lblInfo.parent(content);

  // Draggable panel logic
  var isDragging = false, dragX = 0, dragY = 0;
  var header = createElement('div', '⋮⋮⋮');
  header.style('width', '100%'); header.style('height', '16px');
  header.style('cursor', 'grab'); header.style('text-align', 'center');
  header.style('color', '#5a5450'); header.style('font-size', '10px');
  header.style('line-height', '16px');
  panel.elt.insertBefore(header.elt, panel.elt.firstChild);

  header.elt.onmousedown = function(e) {
    e.preventDefault();
    isDragging = true;
    dragX = e.clientX - panel.elt.offsetLeft;
    dragY = e.clientY - panel.elt.offsetTop;
    header.style('cursor', 'grabbing');
    panel.elt.style.transition = 'none';
  };
  window.addEventListener('mousemove', function(e) {
    if (isDragging) {
      panel.elt.style.left = (e.clientX - dragX) + 'px';
      panel.elt.style.top = (e.clientY - dragY) + 'px';
    }
  });
  window.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      header.style('cursor', 'grab');
      panel.elt.style.transition = 'opacity 0.25s, transform 0.25s, background-color 0.25s, border-radius 0.25s';
    }
  });

  // Tap artwork to regenerate
  document.getElementById('canvas-wrap').onclick = function(e) {
    if (e.target.tagName.toLowerCase() === 'canvas') {
      freshSeed();
    }
  };
}

function freshSeed() {
  seed = Math.floor(Math.random() * 999999);
  selectedEngine = selEngine ? selEngine.value() : 'random';
  currentEngine = (selectedEngine === 'random')
    ? ENGINE_LIST[Math.floor(Math.random() * ENGINE_LIST.length)]
    : selectedEngine;
  borderKey = selBorder ? selBorder.value() : 't*x';
  gain = sldGain ? sldGain.value()/100 : 0.85;
  showPalms = chkPalms ? chkPalms.checked() : true;
  regenerate();
}

function regenerate() {
  grid = buildGrid();
  if (lblSeed)   lblSeed.html('seed ' + seed);
  if (lblEngine) lblEngine.html(currentEngine);
  if (lblInfo) {
    var ne=0,ov=0;
    for(var r=0;r<ROWS;r++) for(var c=0;c<COLS;c++){var s=grid[r][c];if(s){ne++;if(s.length>1)ov++;}}
    lblInfo.html(COLS+'×'+ROWS+' · '+ne+' cells · '+ov+' overstrikes');
  }
  redraw();
}

// ── Render ────────────────────────────────────────────────────────
function draw() {
  drawArt();
}

function drawArt() {
  if (paperImg) {
    image(paperImg, 0, 0, CW, CH);
  } else {
    background('#f3ece0');
  }
  textAlign(CENTER, CENTER);
  textSize(CELL_W / 0.6);
  fill('#23211c'); noStroke();
  for (var r=0; r<ROWS; r++) {
    var y = ORIGIN_Y + r*CELL_H + CELL_H/2;
    for (var c=0; c<COLS; c++) {
      var stack = grid[r][c]; if (!stack) continue;
      var x = ORIGIN_X + c*CELL_W + CELL_W/2;
      var oy = y; // backup original y
      var yCoords = null;
      if (currentSpace === 'isometric') {
        var isoX = (c - r) * CELL_W * 0.866;
        var isoY = (c + r) * CELL_H * 0.5;
        x = Math.floor(CW/2) + isoX;
        y = Math.floor(CH*0.15) + isoY;
      } else if (currentSpace === 'polar') {
        var a = (c / COLS) * Math.PI * 2;
        var rad = (r / ROWS) * (Math.min(CW, CH) * 0.45);
        x = CW/2 + Math.cos(a) * rad;
        y = CH/2 + Math.sin(a) * rad;
      } else if (currentSpace === 'hyperbolic') {
        var cx2 = CW/2, cy2 = CH/2;
        var dx = x - cx2, dy = y - cy2;
        var d = Math.sqrt(dx*dx + dy*dy);
        var f = 1 + Math.pow(d / (Math.min(CW,CH)*0.95), 1.5);
        x = cx2 + dx / f;
        y = cy2 + dy / f;
      } else if (currentSpace === 'moire') {
        var cx2 = CW/2, cy2 = CH/2;
        var dx = x - cx2, dy = y - cy2;
        var ang = Math.sqrt(dx*dx + dy*dy) * 0.002;
        x = cx2 + dx*Math.cos(ang) - dy*Math.sin(ang);
        y = cy2 + dx*Math.sin(ang) + dy*Math.cos(ang);
      } else if (currentSpace === 'planar') {
        var py = r / ROWS;
        var pz = 1 + (1 - py) * 2;
        var px = (c / COLS - 0.5);
        x = CW/2 + (px * Math.min(CW,CH)*1.5) / pz;
        y = CH/2 + (py * Math.min(CW,CH)) / pz - CH*0.2;
      } else if (currentSpace === 'isometric (vertical)') {
        var _px = x;
        var _py = y;
        var cx_px = CW / 2;
        var cy_px = CH / 2;
        var cos30 = 0.86602540378;
        var sin30 = 0.5;
        var isoScale = 0.58;
        var dx = (_px - cx_px) * isoScale;
        var dy = (_py - cy_px) * isoScale;
        
        var bottom_margin = 12.5;
        var max_base_y = cy_px + (cx_px + cy_px) * isoScale * sin30;
        var base_nudge = Math.max(30, CH - bottom_margin - max_base_y) + 12.5;
        
        x = cx_px + (dx - dy) * cos30 + 15;
        var py_base = cy_px + (dx + dy) * sin30 + base_nudge;
        
        var hFactor = Math.pow(stack.wt || 0, 2.0);
        var py_header = 132.5;
        var py_top = py_base - hFactor * (py_base - py_header);
        
        if (hFactor < 0.35) {
          var nudgeUp = (0.35 - hFactor) * 30;
          py_base -= nudgeUp;
          py_top -= nudgeUp;
        }
        
        var py_steps = [];
        var stepVal = 28 * isoScale;
        for (var yVal = py_base; yVal >= py_top; yVal -= stepVal) {
          py_steps.push(yVal);
        }
        if (py_steps.length === 0 || py_steps[py_steps.length - 1] > py_top) {
          py_steps.push(py_top);
        }
        yCoords = py_steps;
      } else if (currentSpace === 'planar (abstract)') {
        var p = [c, r], d;
        var qq = [c + 16, r + 16];
        var pls = [
           [ROWS*0.3, 1, 15],
           [COLS*0.6, 0, 20],
           [ROWS*0.7, 1, 10]
        ];
        for (var pli = 0; pli < pls.length; pli++) {
            var pl = pls[pli];
            d = (Math.abs(p[pl[1]] - pl[0]) + 1) / pl[2];
            if (d < 1) {
                p[0] = d * p[0] + (1 - d) * qq[0];
                p[1] = d * p[1] + (1 - d) * qq[1];
            }
        }
        var px = (p[0] / COLS - 0.5);
        var py = p[1] / ROWS;
        var pz = 1 + (1 - py) * 2;
        x = CW/2 + (px * Math.min(CW,CH)*1.5) / pz;
        y = CH/2 + (py * Math.min(CW,CH)) / pz - CH*0.2;
      } else if (currentSpace === 'moire (dazzler)') {
         var cx2 = CW/2, cy2 = CH/2;
         var dx = x - cx2, dy = y - cy2;
         var mu = dx / cx2;
         var mv = dy / cx2;
         var r2 = Math.sqrt(mu*mu + mv*mv);
         var ang = Math.atan2(mv, mu);
         var t = (seed * 0.05) % (Math.PI * 2);
         var valf = 0.5 + 0.5 * (
             0.42 * Math.sin(7 * mu + t) +
             0.30 * Math.sin(9 * mv - t * 0.7) +
             0.42 * Math.sin(18 * r2 - t * 1.25) +
             0.18 * Math.sin(5 * ang + t * 0.4)
         );
         var shiftAmt = (valf - 0.5) * 35.0;
         x += Math.cos(ang) * shiftAmt;
         y += Math.sin(ang) * shiftAmt;
      }
      
      var originalTextSize = CELL_W / 0.6;
      if (currentSpace === 'isometric (vertical)') {
        textSize(originalTextSize * 0.58 * 1.15);
      }
      var renderYs = (currentSpace === 'isometric (vertical)' && yCoords) ? yCoords : [y];
      for (var sIdx = 0; sIdx < renderYs.length; sIdx++) {
        var currY = renderYs[sIdx];
        for (var i=0; i<stack.length; i++) {
          text(stack[i], x+(i%2===0?0:0.3), currY+(i===2?0.3:0));
        }
      }
      if (currentSpace === 'isometric (vertical)') {
        textSize(originalTextSize);
      }
      y = oy;
    }
  }
  drawShapeHints();
  drawBoldShapes();
}

// ── Export ────────────────────────────────────────────────────────
function dumpScore() {
  function encodeCell(stack){ return !stack?'@':stack.length===1?stack[0]:stack.join('/'); }
  function encodeRun(stack,n){
    var sym=encodeCell(stack);
    if(sym==='@') return n+'\u2423';
    return n===1?sym:n+sym;
  }
  function encodeRow(r){
    var runs=[],curStack=null,curKey=null,count=0;
    for(var c=0;c<COLS;c++){
      var stack=grid[r][c],key=stack?stack.join(''):null;
      if(key===curKey)count++;
      else{if(count>0)runs.push({stack:curStack,n:count});curStack=stack;curKey=key;count=1;}
    }
    if(count>0)runs.push({stack:curStack,n:count});
    while(runs.length>0&&runs[runs.length-1].stack===null)runs.pop();
    if(runs.length===0)return '(blank)';
    return runs.map(function(run){return encodeRun(run.stack,run.n);}).join(' ');
  }

  var lines=[];
  lines.push('PLATEN ARTYPING — TYPING INSTRUCTIONS');
  lines.push('seed '+seed+'  engine '+currentEngine+'  border '+borderKey+'  '+COLS+' cols × '+ROWS+' rows  10cpi/6lpi');
  lines.push('');
  lines.push('KEY');
  lines.push('  12\u2423        space 12 times (spacebar)');
  lines.push('  4M         type M four times');
  lines.push('  .          type . once');
  lines.push('  t/*/x      type t, BACKSPACE, *, BACKSPACE, x  (one overstrike cell)');
  lines.push('  6t/*/x     repeat that unit six times');
  lines.push('  Line feed once after each row.');
  lines.push('');
  lines.push('ROW INSTRUCTIONS');
  lines.push('\u2500'.repeat(72));
  var ov=0;
  for(var r=0;r<ROWS;r++){
    lines.push(String(r+1).padStart(3)+')  '+encodeRow(r));
    for(var c=0;c<COLS;c++){var s=grid[r][c];if(s&&s.length>1)ov++;}
  }
  lines.push('\u2500'.repeat(72));
  lines.push('');
  lines.push('OVERSTRIKE CELLS: '+ov);
  lines.push('DENSITY KEY');
  for(var i=1;i<RAMP.length;i++){var r2=RAMP[i];lines.push('  level '+i+'  '+(r2.length===1?r2[0]:r2.join('/'))+'  '+r2.join(' BS '));}
  saveStrings(lines,'platen_'+currentEngine+'_'+seed,'txt');
}

// ── Input ─────────────────────────────────────────────────────────
function keyPressed() {
  if (key===' ')           { freshSeed(); }
  else if (key==='s'||key==='S') { saveCanvas('platen_'+currentEngine+'_'+seed,'png'); }
}
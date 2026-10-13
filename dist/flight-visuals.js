'use strict';
// One shared 2.1 MB atlas; draw source rectangles directly, with no per-frame canvases.
const SpaceFlight=(()=>{
  const art=new Image();art.decoding='async';art.src='assets/space-sectors.png';
  const rocks=Array.from({length:6},(_,i)=>{const image=new Image();image.decoding='async';image.src='assets/asteroid-'+i+'.svg';return image;});
  function asteroid(ctx,r,seed,rotation){const art=rocks[Math.abs(Math.floor(seed||0))%rocks.length];ctx.save();ctx.rotate(rotation);if(art.complete&&art.naturalWidth){ctx.drawImage(art,-r*1.12,-r*1.12,r*2.24,r*2.24);}else{ctx.fillStyle='#677985';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();}ctx.restore();}
  const names=['ДАЛЬНИЙ КОСМОС','ГОЛУБАЯ ПЛАНЕТА','ФИОЛЕТОВЫЙ РАЗЛОМ','БИРЮЗОВАЯ ТУМАННОСТЬ','ЗОЛОТАЯ ГАЛАКТИКА','ОГНЕННОЕ ЗАТМЕНИЕ'];
  const bounds=[[10,266],[288,262],[565,265],[845,261],[1121,262],[1399,261]];
  const maxTime=Math.log(2.5)/.009;
  function distance(t){return t<=maxTime?60/.009*Math.expm1(.009*t):10000+150*(t-maxTime);}
  function speed(d){return Math.min(2.5,1+d*.00015);}
  function scene(d){const sector=Math.floor(Math.max(0,d)/1000),part=Math.min(1,(d-sector*1000)/900);return {sector,current:sector%6,previous:(sector+5)%6,mix:sector===0?1:part*part*(3-2*part)};}
  let shade=null,lastW=0,lastH=0;
  function draw(ctx,w,h,g){
    ctx.fillStyle='#03060d';ctx.fillRect(0,0,w,h);
    const s=scene(g.dist);
    if(art.complete&&art.naturalWidth){
      const width=Math.min(w,Math.max(540,h*.62)),zoom=1.035+.008*Math.sin(g.t*.12),dw=width*zoom,dh=h*zoom;
      const x=(w-dw)/2-g.x*7,y=(h-dh)/2+Math.sin(g.t*.09)*h*.006;
      const paint=(i,opacity)=>{ctx.globalAlpha=opacity;ctx.drawImage(art,bounds[i][0],67,bounds[i][1],768,x,y,dw,dh);};
      if(s.mix<1)paint(s.previous,1);
      paint(s.current,s.mix);ctx.globalAlpha=1;
    }
    if(!shade||lastW!==w||lastH!==h){
      shade=ctx.createRadialGradient(w/2,h*.4,h*.08,w/2,h*.4,Math.max(w,h)*.72);
      shade.addColorStop(0,'rgba(2,5,13,.12)');shade.addColorStop(.7,'rgba(2,5,13,.32)');shade.addColorStop(1,'rgba(2,5,13,.82)');lastW=w;lastH=h;
    }
    ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
  }
  return {distance,speed,scene,draw,names,asteroid};
})();

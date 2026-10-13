'use strict';
// Lightweight distant scenery; no background atlas decoding.
const SpaceFlight=(()=>{
  const rocks=Array.from({length:6},(_,i)=>{const image=new Image();image.decoding='async';image.src='assets/asteroid-'+i+'.svg';return image;});
  function asteroid(ctx,r,seed,rotation){const art=rocks[Math.abs(Math.floor(seed||0))%rocks.length];ctx.save();ctx.rotate(rotation);if(art.complete&&art.naturalWidth){ctx.drawImage(art,-r*1.12,-r*1.12,r*2.24,r*2.24);}else{ctx.fillStyle='#677985';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();}ctx.restore();}
  const names=['ДАЛЬНИЙ КОСМОС'];
  const maxTime=Math.log(2.5)/.009;
  function distance(t){return t<=maxTime?60/.009*Math.expm1(.009*t):10000+150*(t-maxTime);}
  function speed(d){return Math.min(2.2,1+d*.00010);}
  function scene(d){return {sector:Math.floor(Math.max(0,d)/1000),current:0,previous:0,mix:1};}
  function draw(ctx,w,h,g){
    ctx.fillStyle='#020409';ctx.fillRect(0,0,w,h);
    // One distant object at a time, far outside the flight collision layer.
    const cycle=Math.floor(g.t/48),phase=(g.t%48)/48;
    const alpha=Math.min(1,phase*8,(1-phase)*8)*.6;
    const side=cycle%2?-1:1,x=w*(side>0?.84:.16)-g.x*5,y=h*(.19+phase*.22);
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);
    if(cycle%3!==2){
      const r=Math.min(w*.19,85);
      if(cycle%3===1){ctx.save();ctx.rotate(-.4);ctx.strokeStyle='#71858c';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,r*1.6,r*.38,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
      const shade=ctx.createRadialGradient(-r*.4,-r*.4,0,r*.25,r*.15,r*1.15);
      shade.addColorStop(0,cycle%3?'#8b8580':'#5c7a8b');shade.addColorStop(.5,'#243441');shade.addColorStop(1,'#020409');
      ctx.fillStyle=shade;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#87aab322';ctx.lineWidth=2;ctx.stroke();
    }else{
      ctx.rotate(-.25+phase*.15);const size=Math.min(w/390,1.3);ctx.scale(size,size);
      ctx.strokeStyle='#607986';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,37,17,0,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle='#24394b';ctx.fillRect(-63,-8,35,16);ctx.fillRect(28,-8,35,16);
      ctx.strokeStyle='#648b9e';ctx.lineWidth=.7;for(let n=-60;n<64;n+=7){if(Math.abs(n)<28)continue;ctx.beginPath();ctx.moveTo(n,-8);ctx.lineTo(n,8);ctx.stroke();}
      ctx.fillStyle='#85969f';ctx.fillRect(-5,-24,10,48);ctx.fillStyle='#a6d8e0';ctx.fillRect(-2,-15,4,5);
    }
    ctx.restore();
  }
  return {distance,speed,scene,draw,names,asteroid};
})();

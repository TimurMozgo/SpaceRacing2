'use strict';
// Flight time only: pausing also pauses warnings, cargo and the cooldown.
const FlightEvents=(()=>{
  function create(){return {next:rand(30,45),type:null,previous:null,age:0,wave:0,lane:0};}
  function update(g,dt){
    const e=g.event||(g.event=create());
    if(!e.type){e.next-=dt;if(e.next>0)return false;
      e.type=e.previous==='meteor'?'cargo':e.previous==='cargo'?'meteor':Math.random()<.5?'meteor':'cargo';
      e.age=0;e.wave=0;e.lane=Math.random()<.5?-.58:.58;sound('bonus');
    }
    e.age+=dt;
    if(e.age>=15){e.previous=e.type;e.type=null;e.next=rand(35,55);g.spawn=.7;return false;}
    if(e.age>=3&&e.age<11){
      e.wave-=dt;
      if(e.wave<=0){
        e.wave=e.type==='meteor'?.7:.65;
        if(e.type==='meteor'){
          // Keep one fixed, wide corridor clear for the whole storm.
          for(const x of [-.72,-.24,.24,.72])if(Math.abs(x-e.lane)>.45)
            g.objects.push({kind:'rock',eventMeteor:true,x:x+rand(-.035,.035),z:.02,rot:rand(0,6),seed:rand(0,50)});
        }else{
          g.objects.push({kind:'coin',x:e.lane+Math.sin(e.age*1.2)*.12,z:.22,rot:0});
        }
      }
    }
    return true; // Replace normal waves; do not stack two obstacle streams.
  }
  function label(g){
    const e=g.event;if(!e?.type)return '';
    const warning=e.age<3;
    if(e.age>=11)return e.type==='meteor'?'БУРЯ СТИХАЕТ':'ГРУЗ ДОСТАВЛЕН';
    return e.type==='meteor'?(warning?'МЕТЕОРИТНЫЙ ДОЖДЬ ЧЕРЕЗ '+Math.ceil(3-e.age)+' С':'МЕТЕОРИТНЫЙ ДОЖДЬ')+' · ДЕРЖИСЬ '+(e.lane<0?'СЛЕВА':'СПРАВА'):(warning?'ПРИБЛИЖАЕТСЯ ГРУЗОВОЙ КОРАБЛЬ':'ГРУЗОВОЙ КОРАБЛЬ · СОБИРАЙ МОНЕТЫ');
  }
  function draw(ctx,w,h,g){
    const e=g.event;if(!e?.type||e.age<3||e.age>=12)return;
    if(e.type==='meteor')return;
    const a=Math.min(1,(e.age-3)/1.2,(12-e.age)/1.2);
    ctx.save();ctx.globalAlpha=Math.max(0,a);ctx.translate(w/2+(e.lane+Math.sin(e.age*1.2)*.12)*Math.min(w,760)*.16,h*.16);
    ctx.scale(Math.min(1,w/430),Math.min(1,w/430));
    ctx.fillStyle='#7fe8ff';ctx.fillRect(-24,22,8,18+Math.sin(g.t*20)*4);ctx.fillRect(16,22,8,18+Math.cos(g.t*20)*4);
    ctx.fillStyle='#293e55';ctx.strokeStyle='#91bcd2';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(0,-35);ctx.lineTo(30,-9);ctx.lineTo(36,24);ctx.lineTo(-36,24);ctx.lineTo(-30,-9);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#91f1ff';ctx.fillRect(-9,-19,18,8);
    ctx.fillStyle='#e3b964';for(const x of [-23,-6,11]){ctx.fillRect(x,0,12,17);}
    ctx.restore();
  }
  return {create,update,label,draw};
})();

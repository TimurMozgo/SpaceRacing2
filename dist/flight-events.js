'use strict';
// Flight time only: pausing also pauses warnings, cargo and the cooldown.
const FlightEvents=(()=>{
  const cargoArt=new Image();cargoArt.src='assets/cargo-freighter.svg';
  function create(){return {next:rand(30,45),type:null,previous:null,age:0,wave:0,lane:0};}
  function update(g,dt){
    const e=g.event||(g.event=create());
    if(!e.type){e.next-=dt;if(e.next>0)return false;
      e.type=e.previous==='meteor'?'cargo':e.previous==='cargo'?'meteor':Math.random()<.5?'meteor':'cargo';
      e.age=0;e.wave=0;e.lane=Math.random()<.5?-.58:.58;
      if(e.type==='meteor'){e.routes=[-.6,0,.6];for(let i=2;i>0;i--){const j=Math.floor(Math.random()*(i+1));[e.routes[i],e.routes[j]]=[e.routes[j],e.routes[i]];}e.round=0;e.lane=e.routes[0];e.phase='warning';e.timer=3.5;}sound('bonus');
    }
    e.age+=dt;
    if(e.type==='meteor'){
      if(e.phase==='warning'){
        e.timer-=dt;
        if(e.timer<=0){
          for(const x of [-.84,-.6,-.36,-.12,.12,.36,.6,.84])if(Math.abs(x-e.lane)>.31)
            g.objects.push({kind:'rock',eventMeteor:true,x,z:.02,rot:rand(0,6),seed:rand(0,50)});
          e.phase='flying';
        }
      }else if(!g.objects.some(o=>o.eventMeteor&&!o.dead&&o.z<=1.12)){
        e.round++;
        if(e.round>=3){e.previous=e.type;e.type=null;e.next=rand(35,55);g.spawn=.7;return false;}
        e.lane=e.routes[e.round];e.phase='warning';e.timer=1.25;sound('bonus');
      }
      return true;
    }
    if(e.age>=15){e.previous=e.type;e.type=null;e.next=rand(35,55);g.spawn=.7;return false;}
    if(e.age>=3&&e.age<11){
      e.wave-=dt;
      if(e.wave<=0){
        e.wave=.65;
        g.objects.push({kind:'coin',x:e.lane+Math.sin(e.age*1.2)*.12,z:.22,rot:0});
      }
    }
    return true; // Replace normal waves; do not stack two obstacle streams.
  }
  function label(g){
    const e=g.event;if(!e?.type)return '';
    if(e.type==='meteor'){
      const direction=e.lane<0?'СЛЕВА':e.lane>0?'СПРАВА':'ПО ЦЕНТРУ';
      return 'МЕТЕОРИТЫ · ВОЛНА '+(e.round+1)+'/3 · ПРОХОД '+direction+(e.phase==='warning'?' · '+Math.ceil(e.timer)+' С':'');
    }
    if(e.age>=11)return 'ГРУЗ ДОСТАВЛЕН';
    return e.age<3?'ПРИБЛИЖАЕТСЯ ГРУЗОВОЙ КОРАБЛЬ':'ГРУЗОВОЙ КОРАБЛЬ · СОБИРАЙ МОНЕТЫ';
  }

  function draw(ctx,w,h,g){
    const e=g.event;if(!e?.type)return;
    if(e.type==='meteor'){
      if(e.phase!=='warning')return;
      ctx.save();
      const half=Math.min(w,760)*.48;
      for(const lane of [-.6,0,.6]){
        const safe=lane===e.lane;
        ctx.fillStyle=safe?'#8ef0cc18':'#ff945d18';ctx.strokeStyle=safe?'#8ef0cc88':'#ff945d44';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(w/2+(lane-.28)*half*.12,h*.12);ctx.lineTo(w/2+(lane+.28)*half*.12,h*.12);ctx.lineTo(w/2+(lane+.28)*half,h*.9);ctx.lineTo(w/2+(lane-.28)*half,h*.9);ctx.closePath();ctx.fill();ctx.stroke();
      }
      ctx.restore();return;
    }
    if(e.age<3||e.age>=12)return;
    const a=Math.min(1,(e.age-3)/1.2,(12-e.age)/1.2);
    ctx.save();ctx.globalAlpha=Math.max(0,a);ctx.translate(w/2+(e.lane+Math.sin(e.age*1.2)*.12)*Math.min(w,760)*.16,h*.16);
    const scale=Math.min(1,w/430)*1.4;ctx.scale(scale,scale);
    ctx.rotate(Math.sin(e.age*1.2)*.035);
    for(const x of [-35,35]){
      const length=36+Math.sin(g.t*18+x)*5;
      const flame=ctx.createLinearGradient(0,28,0,28+length);
      flame.addColorStop(0,'#e4ffff');flame.addColorStop(.25,'#65e2ffb0');flame.addColorStop(1,'#367cff00');
      ctx.fillStyle=flame;ctx.beginPath();ctx.moveTo(x-6,28);ctx.quadraticCurveTo(x-9,46,x,28+length);ctx.quadraticCurveTo(x+9,46,x+6,28);ctx.fill();
    }
    if(cargoArt.complete&&cargoArt.naturalWidth)ctx.drawImage(cargoArt,-65,-65,130,110);
    else{ctx.fillStyle='#71879b';ctx.fillRect(-30,-25,60,50);ctx.fillStyle='#efc578';ctx.fillRect(-20,-15,40,25);}
    ctx.restore();
  }
  return {create,update,label,draw};
})();

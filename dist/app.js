'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fresh=()=>({balance:0,owned:1,coinShips:[0],selected:0,gun:0,totalCoins:0,totalDistance:0,flights:0,best:0,history:[],sound:true,soundPreferenceVersion:2});
const progressKey=OrbitaCloud.enabled?'orbita-v2-'+OrbitaCloud.identity:'orbita-v1';
let data=fresh();try{const x=JSON.parse(localStorage.getItem(progressKey));if(x&&typeof x==='object'){for(const k of ['balance','totalCoins','totalDistance','flights','best'])if(Number.isFinite(x[k])&&x[k]>=0)data[k]=Math.floor(x[k]);data.owned=Math.max(1,Math.min(SHIPS.length,Math.floor(Number(x.owned)||1)));data.coinShips=Array.isArray(x.coinShips)?[...new Set([0,...x.coinShips.filter(i=>Number.isInteger(i)&&i>=0&&i<SHIPS.length)])]:Array.from({length:data.owned},(_,i)=>i);data.selected=Math.max(0,Math.min(SHIPS.length-1,Math.floor(Number(x.selected)||0)));data.gun=Math.max(0,Math.min(3,Math.floor(Number(x.gun)||0)));data.sound=x.soundPreferenceVersion===2?x.sound!==false:true;data.history=Array.isArray(x.history)?x.history.filter(r=>r&&Number.isFinite(r.distance)&&Number.isFinite(r.coins)&&Number.isFinite(r.date)).slice(0,30):[]}}catch{}
let paidShips=new Set(),starsReady=false,starsSupport='',starsBusy=false,starsSync=null;
const ownsShip=i=>data.coinShips.includes(i)||paidShips.has(i);
const nextShip=()=>SHIPS.findIndex((_,i)=>!ownsShip(i));
if(!ownsShip(data.selected))data.selected=0;
let storageWarned=false;function save(){try{localStorage.setItem(progressKey,JSON.stringify(data))}catch{if(!storageWarned){toast('Браузер не разрешает сохранение прогресса');storageWarned=true}}}
const fmt=n=>Math.floor(n).toLocaleString('ru-RU');let toastTimer;function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
// One audio context and master bus; synth effects need no downloaded files.
let audio,master;
function prepareAudio(){
  if(!data.sound)return null;
  try{
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return null;
    if(!audio||audio.state==='closed'){
      audio=new Audio();master=audio.createGain();master.gain.value=.7;master.connect(audio.destination);
    }
    return audio;
  }catch{return null}
}
function unlockAudio(){
  const a=prepareAudio();
  if(a&&a.state!=='running')a.resume().catch(()=>{});
}
// Resume synchronously from user gestures, including after a mobile interruption.
for(const event of ['pointerdown','keydown'])document.addEventListener(event,unlockAudio,{capture:true,passive:true});
function sound(kind){
  const a=prepareAudio();if(!a)return;
  const play=()=>{
    if(!data.sound||document.hidden||a.state!=='running')return;
    try{
      const tones={click:[680,1040,.12,.14,'triangle'],coin:[1100,1600,.09,.075,'sine'],bonus:[420,1200,.3,.12,'sine'],hit:[150,35,.35,.13,'sawtooth'],shoot:[1150,130,.095,.16,'triangle'],start:[150,650,.55,.1,'sine'],buy:[500,1500,.6,.1,'sine']};
      const [from,to,duration,volume,wave]=tones[kind]||tones.click;
      const o=a.createOscillator(),gain=a.createGain(),t=a.currentTime;
      o.type=wave;o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(to,t+duration);
      gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(volume,t+.004);gain.gain.exponentialRampToValueAtTime(.001,t+duration);
      o.connect(gain);gain.connect(master);o.onended=()=>{o.disconnect();gain.disconnect()};o.start(t);o.stop(t+duration+.01);
    }catch{}
  };
  if(a.state==='running')play();
  // Never queue automatic shots while the app is suspended.
  else if(kind==='click'||kind==='start'||kind==='buy')a.resume().then(play).catch(()=>{});
}

function render(){ $('#balance').textContent=fmt(data.balance);$('#record').textContent=fmt(data.best)+' м';$('#activeName').textContent=SHIPS[data.selected].name;$('#activeNumber').textContent=String(data.selected+1).padStart(2,'0');$('.ship-label small').textContent=SHIPS[data.selected].type.toUpperCase();$('#heroShip').innerHTML=shipSVG(data.selected);$('.ship-label').style.color=SHIPS[data.selected].color;$('#ownedCount').textContent=`${String(SHIPS.filter((_,i)=>ownsShip(i)).length).padStart(2,'0')} / ${SHIPS.length} кораблей`;$('#sound').textContent=data.sound?'🔊':'🔇';$('#sound').setAttribute('aria-label',data.sound?'Выключить звук':'Включить звук');$('#sound').setAttribute('aria-pressed',data.sound);
$('#ships').innerHTML=SHIPS.map((s,i)=>{const owned=ownsShip(i);return `<article class="ship-card ${owned?'owned':'locked'} ${data.selected===i?'selected':''}" style="--accent:${s.color}"><div class="card-top"><span>${s.rarity.toUpperCase()}</span><span>${String(i+1).padStart(2,'0')}</span></div><div class="ownership">${owned?'● ОТКРЫТ':i===nextShip()?'◇ СЛЕДУЮЩИЙ':'◇ ЗАКРЫТ'}</div><div class="card-art">${owned?shipSVG(i):'<div class="mystery">?</div>'}</div><h3>${owned?s.name:'Неизвестный корабль'}</h3><p>${owned?s.type:'Раскрой тайну после покупки'}</p><button class="card-btn" data-ship="${i}" ${!owned&&i!==nextShip()?'disabled':''}>${data.selected===i?'✓ Активный корабль':owned?'Выбрать корабль':i===nextShip()?'Открыть · ◉ '+fmt(s.price):'Сначала открой предыдущий'}</button>${!owned?`<button class="card-btn stars-purchase" data-stars-ship="${i}" ${!owned&&i!==nextShip()?'disabled':''} aria-label="Корабль ${i+1}: ${s.starsPrice} Telegram Stars"><span>★ ${s.starsPrice} Stars</span><small>Купить</small></button>`:''}</article>`}).join('');
$('#levels').innerHTML=[1,2,3].map((v)=>`<div class="level ${v<=data.gun?'on':''}">УРОВЕНЬ 0${v}<small>${[1,2.5,5][v-1]} выстр. / сек</small></div>`).join('');$('#upgrade').textContent=data.gun===3?'✓ Максимальный уровень':`${data.gun?'Улучшить':'Установить'} · ◉ ${[100,300,700][data.gun]}`;$('#upgrade').disabled=data.gun===3;
$('#stats').innerHTML=`<div><small>Личный рекорд</small><b>${fmt(data.best)} м</b></div><div><small>Всего монет</small><b>◉ ${fmt(data.totalCoins)}</b></div><div><small>Полётов</small><b>${fmt(data.flights)}</b></div>`;$('#history').innerHTML=data.history.length?data.history.map(r=>`<tr><td>${new Date(r.date).toLocaleString('ru-RU',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</td><td>${fmt(r.distance)} м</td><td style="color:#e4c775">+ ${fmt(r.coins)} ◉</td></tr>`).join(''):'<tr><td colspan="3" class="muted">Здесь появятся твои полёты. Первый старт уже ждёт.</td></tr>';}
async function syncStars(){
  if(!OrbitaCloud.enabled)return;
  if(starsSync)return starsSync;
  starsSync=(async()=>{const result=await OrbitaCloud.starsStatus();paidShips=new Set(result.paidShips.filter(i=>Number.isInteger(i)&&i>0&&i<SHIPS.length));starsReady=result.paymentsEnabled===true;starsSupport=/^@[A-Za-z0-9_]{5,32}$/.test(result.support)?result.support:'';if(!ownsShip(data.selected))data.selected=0;render();return result;})();
  try{return await starsSync;}finally{starsSync=null;}
}
async function showStarsPreview(index){
  if(starsBusy)return;
  if(!OrbitaCloud.enabled){toast('Покупки доступны при запуске игры через Telegram.');return;}
  sound('click');starsBusy=true;
  try{await syncStars();}catch(error){toast(error.message);return;}finally{starsBusy=false;}
  if(ownsShip(index)){toast('Корабль уже в твоём ангаре.');return;}
  if(!starsReady){toast('Оплата Stars ещё настраивается. Покупки за монеты доступны.');return;}
  const ship=SHIPS[index];
  showModal(`<span class="kicker">TELEGRAM STARS</span><h2>Открыть корабль № ${String(index+1).padStart(2,'0')}?</h2><div class="stars-price">★ ${ship.starsPrice} <small>Stars</small></div><p>Покупка навсегда открывает один корабль этого класса для твоего Telegram-аккаунта. Внешность раскроется после оплаты. Монеты не списываются.</p><p>Помощь по оплатам и возвратам: <a href="https://t.me/${starsSupport.slice(1)}" target="_blank" rel="noopener">${starsSupport}</a>. Поддержку оказывает владелец SpaceRacing.</p><label style="display:block;margin:20px 0"><input type="checkbox" id="starsTerms"> Я прочитал и принимаю условия этой покупки.</label><button class="primary" id="starsPay" disabled>Оплатить ★ ${ship.starsPrice}</button><p id="starsPaymentStatus" role="status"></p>`);
  $('#starsTerms').onchange=()=>{$('#starsPay').disabled=!$('#starsTerms').checked||starsBusy;};
  $('#starsPay').onclick=()=>payWithStars(index);
}
async function payWithStars(index){
  if(starsBusy||!$('#starsTerms')?.checked)return;
  const tg=window.Telegram?.WebApp;
  if(!tg?.openInvoice){toast('Обнови Telegram для оплаты Stars.');return;}
  starsBusy=true;$('#starsPay').disabled=true;
  try{
    const receipt=await OrbitaCloud.starsInvoice(index);
    if(!/^https:\/\/t\.me\/\$[A-Za-z0-9_-]+$/.test(receipt.invoiceUrl))throw new Error('Не удалось проверить ссылку оплаты.');
    closeModal();
    tg.openInvoice(receipt.invoiceUrl,async status=>{
      starsBusy=false;
      if(status==='cancelled'){toast('Оплата отменена.');return;}
      if(status==='failed'){toast('Оплата не прошла. Повтори позже.');return;}
      starsBusy=true;toast('Проверяем подтверждение оплаты…');
      // Invoice status is never proof of ownership. Only the server grants it.
      try{
        for(let attempt=0;attempt<6;attempt++){
          await syncStars();
          if(paidShips.has(index)){
            data.selected=index;save();render();sound('buy');
            showModal(`<span class="kicker">ОПЛАТА ПОДТВЕРЖДЕНА</span><div class="reveal-art">${shipSVG(index)}</div><h2>${SHIPS[index].name}</h2><p>Корабль в твоём ангаре. Покупка сохранена за твоим Telegram-аккаунтом.</p><button class="primary" id="starsDone">К звёздам ↗</button>`);$('#starsDone').onclick=closeModal;return;
          }
          await new Promise(resolve=>setTimeout(resolve,2000));
        }
        toast('Подтверждение ещё в пути. Открой игру чуть позже — покупка загрузится автоматически. Повторно платить не нужно.');
      }catch(error){toast('Открой игру повторно при восстановлении интернета — покупка загрузится автоматически.');}finally{starsBusy=false;}
    });
  }catch(error){starsBusy=false;toast(error.message);const button=$('#starsPay');if(button)button.disabled=false;}
}
const modal=$('#modal');let modalClose=()=>{};function showModal(html,onClose=()=>{}){modalClose=onClose;$('#modalContent').innerHTML=html;if(!modal.open)modal.showModal()}function closeModal(){modal.close();const cb=modalClose;modalClose=()=>{};cb()}$('#closeModal').onclick=closeModal;modal.addEventListener('cancel',e=>{e.preventDefault();closeModal()});
const renderLocal=render;render=function(){renderLocal();window.dispatchEvent(new Event('orbita-cloud'));};
function navigate(page){$$('.page').forEach(p=>p.classList.toggle('hidden',p.id!==page));$$('nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));window.scrollTo({top:0,behavior:'smooth'});sound('click');render()}
$$('nav button').forEach(b=>b.onclick=()=>navigate(b.dataset.page));$('.brand').onclick=e=>{e.preventDefault();navigate('catalog')};$('#sound').onclick=()=>{data.sound=!data.sound;if(master)master.gain.setValueAtTime(data.sound?.7:0,audio.currentTime);save();render();sound('click')};
$('#ships').onclick=e=>{if(starsBusy)return;const starsButton=e.target.closest('[data-stars-ship]');if(starsButton){const index=Number(starsButton.dataset.starsShip);if(index!==nextShip()||index>=SHIPS.length)return;showStarsPreview(index);return;}const b=e.target.closest('[data-ship]');if(!b)return;const i=+b.dataset.ship;if(ownsShip(i)){data.selected=i;save();render();sound('click');return}if(i!==nextShip())return;const s=SHIPS[i];if(data.balance<s.price){toast(`Нужно ещё ${fmt(s.price-data.balance)} монет. Собери их в полёте.`);return}showModal(`<span class="kicker">СЕКРЕТНЫЙ КОНТЕЙНЕР / ${String(i+1).padStart(2,'0')}</span><h2>Открыть новый корабль?</h2><p>Ты получишь один корабль следующего класса. Его внешность откроется после покупки.</p><button class="primary" id="confirmBuy">Открыть за ◉ ${fmt(s.price)}</button>`);$('#confirmBuy').onclick=()=>{if(nextShip()!==i||data.balance<s.price)return;data.balance-=s.price;data.coinShips.push(i);data.selected=i;save();render();sound('buy');showModal(`<span class="kicker">НОВЫЙ КОРАБЛЬ В АНГАРЕ</span><div class="reveal-art">${shipSVG(i)}</div><h2>${s.name}</h2><p>${s.type}. Уже выбран для следующего полёта.</p><button class="primary" id="revealDone">К звёздам ↗</button>`);$('#revealDone').onclick=closeModal}};
$('#upgrade').onclick=()=>{if(data.gun>=3)return;const price=[100,300,700][data.gun];if(data.balance<price){toast(`Для улучшения нужно ещё ${fmt(price-data.balance)} монет`);return}data.balance-=price;data.gun++;save();render();sound('buy');toast('Пулемёт улучшен. В полёте он стреляет автоматически.')};$('#stars').onclick=()=>showModal('<span class="kicker">TELEGRAM STARS</span><h2>Оплата скоро появится</h2><p>Оплата улучшений за Stars пока не подключена. Корабли можно купить за Stars в каталоге.</p><p>Сейчас улучшения доступны за монеты, собранные в полёте.</p>');
const canvas=$('#space'),ctx=canvas.getContext('2d',{alpha:false});let W=0,H=0,dpr=1,g=null,last=0,raf=0;const keys=new Set();let pointer=false;
function resize(){W=innerWidth;H=innerHeight;dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}window.addEventListener('resize',resize);resize();
let starting=false;
async function start(){if(starting||g?.running||starsBusy)return;starting=true;try{await OrbitaCloud.begin();}catch(error){toast(error.message);starting=false;return;}starting=false;if(modal.open){modalClose=()=>{};modal.close()}g={running:true,paused:false,t:0,dist:0,coins:0,x:0,target:0,shield:false,magnet:0,double:0,invuln:0,spawn:0,bonus:5,shot:0,objects:[],bullets:[],particles:[],stars:Array.from({length:100},()=>({x:Math.random(),y:Math.random(),z:Math.random()})),hue:220};$('#game').classList.remove('hidden');document.body.style.overflow='hidden';$('#flightHint').style.opacity=1;keys.clear();pointer=false;sound('start');last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}$$('.launch').forEach(b=>b.onclick=start);
function pause(){if(!g?.running||g.paused)return;g.paused=true;keys.clear();showModal('<span class="kicker">ПОЛЁТ ПРИОСТАНОВЛЕН</span><h2>Вселенная подождёт.</h2><p>Таймеры бонусов на паузе.</p><button class="primary" id="resume">Продолжить ↗</button><button class="text-btn" id="endFlight">Завершить и сохранить полёт</button>',resume);$('#resume').onclick=closeModal;$('#endFlight').onclick=()=>{modalClose=()=>{};modal.close();finish()}}
function resume(){if(g?.running){g.paused=false;last=performance.now()}}$('#pause').onclick=pause;document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});window.addEventListener('blur',pause);
function finish(){if(!g?.running)return;g.running=false;OrbitaCloud.finish(g.dist,g.coins,g.t*1000);const distance=Math.floor(g.dist);data.balance+=g.coins;data.totalCoins+=g.coins;data.totalDistance+=distance;data.flights++;const record=distance>data.best;data.best=Math.max(data.best,distance);data.history.unshift({date:Date.now(),distance,coins:g.coins});data.history=data.history.slice(0,30);save();render();sound('hit');showModal(`<span class="kicker">${record?'НОВЫЙ ЛИЧНЫЙ РЕКОРД':'ПОЛЁТ ЗАВЕРШЁН'}</span><h2>${record?'Выше. Дальше. Смелее.':'Звёзды ждут возвращения.'}</h2><div class="result-stats"><div><b>${fmt(distance)} м</b><small>Дистанция</small></div><div><b>+${fmt(g.coins)} ◉</b><small>Собрано за полёт</small></div></div><p id="flightSaveStatus" role="status">Результат ожидает подтверждения сервера…</p><button class="primary" id="retry">Ещё один полёт ↗</button><button class="text-btn" id="home">Вернуться в ангар</button>`,leave);$('#retry').onclick=start;$('#home').onclick=closeModal}
function leave(){cancelAnimationFrame(raf);$('#game').classList.add('hidden');document.body.style.overflow='';g=null;render()}
document.addEventListener('keydown',e=>{if(!g?.running)return;if(['ArrowLeft','ArrowRight','KeyA','KeyD','Escape','Space'].includes(e.code)){e.preventDefault();if(e.code==='Escape'||e.code==='Space'){if(g.paused)closeModal();else pause()}else keys.add(e.code)}});document.addEventListener('keyup',e=>keys.delete(e.code));
canvas.addEventListener('pointerdown',e=>{pointer=true;canvas.setPointerCapture(e.pointerId);move(e)});canvas.addEventListener('pointermove',e=>{if(pointer)move(e)});canvas.addEventListener('pointerup',()=>pointer=false);canvas.addEventListener('pointercancel',()=>pointer=false);function move(e){if(g&&!g.paused)g.target=Math.max(-.88,Math.min(.88,(e.clientX-W/2)/(Math.min(W,760)*.45)))}
const rand=(a,b)=>a+Math.random()*(b-a);function burst(x,y,color,n=10){for(let i=0;i<n&&g.particles.length<100;i++)g.particles.push({x,y,vx:rand(-100,100),vy:rand(-100,100),life:.5,color})}
function project(o){const depth=.12+.88*o.z;return{x:W/2+o.x*Math.min(W,760)*.48*depth,y:H*.12+o.z*o.z*H*.73,r:(o.kind==='rock'?31:16)*depth}}
function collect(o){if(o.kind==='coin'){g.coins+=g.double>0?2:1;sound('coin')}else if(o.kind==='shield'){g.shield=true;sound('bonus')}else if(o.kind==='magnet'){g.magnet=10;sound('bonus')}else if(o.kind==='double'){g.double=10;sound('bonus')}o.dead=true;const p=project(o);burst(p.x,p.y,o.kind==='coin'?'#ffdb7e':'#a6f3ff')}
function update(dt){g.t+=dt;g.dist=SpaceFlight.distance(g.t);const speed=SpaceFlight.speed(g.dist);g.magnet=Math.max(0,g.magnet-dt);g.double=Math.max(0,g.double-dt);g.invuln=Math.max(0,g.invuln-dt);if(keys.has('ArrowLeft')||keys.has('KeyA'))g.target-=dt*1.8;if(keys.has('ArrowRight')||keys.has('KeyD'))g.target+=dt*1.8;g.target=Math.max(-.88,Math.min(.88,g.target));g.x+=(g.target-g.x)*(1-Math.exp(-12*dt));g.spawn-=dt;g.bonus-=dt;g.shot-=dt;
if(g.spawn<=0){g.spawn=.65/speed;const x=rand(-.86,.86);g.objects.push({kind:'rock',x,z:.02,rot:rand(0,6),seed:rand(0,50)});const cx=x>0?rand(-.85,-.15):rand(.15,.85);for(let i=0,n=(g.coinWave=(g.coinWave||0)+1)%2?1:2;i<n;i++)g.objects.push({kind:'coin',x:cx,z:.02-i*.07,rot:0})}
if(g.bonus<=0){g.bonus=rand(7,10);g.objects.push({kind:['shield','magnet','double'][Math.floor(Math.random()*3)],x:rand(-.65,.65),z:.04,rot:0})}
if(data.gun&&g.shot<=0){g.shot=[0,1,.4,.2][data.gun];g.bullets.push({x:g.x,z:1});sound('shoot')}
for(const b of g.bullets)b.z-=dt*1.8;
for(const o of g.objects){if(o.dead)continue;o.z+=dt*.25*speed;o.rot+=dt*.3;if(o.kind==='coin'&&g.magnet>0&&o.z>=0){o.x+=(g.x-o.x)*(1-Math.exp(-dt*6));o.z+=dt*1.7;if(o.z>=.98)collect(o)}
if(o.kind==='rock'){for(const b of g.bullets){if(!b.dead&&Math.abs(b.z-o.z)<.08&&Math.abs(b.x-o.x)<.13){b.dead=true;o.dead=true;const p=project(o);burst(p.x,p.y,'#9caebe',12);break}}}
if(!o.dead&&o.z>=.93&&o.z<=1.1&&Math.abs(o.x-g.x)<(o.kind==='rock'?.16:.19)){if(o.kind==='rock'){if(g.invuln>0){o.dead=true;continue}if(g.shield){g.shield=false;g.invuln=1.4;o.dead=true;burst(W/2+g.x*Math.min(W,760)*.48,H*.85,'#91eeff',25);sound('hit')}else{finish();return}}else collect(o)}}
g.objects=g.objects.filter(o=>!o.dead&&o.z<1.18);g.bullets=g.bullets.filter(b=>!b.dead&&b.z>0);for(const p of g.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt}g.particles=g.particles.filter(p=>p.life>0);for(const s of g.stars){s.y+=dt*(.025+s.z*.13)*speed;if(s.y>1){s.y=0;s.x=Math.random()}}
if(Math.floor(g.t)!==g.checkpointSecond){g.checkpointSecond=Math.floor(g.t);try{OrbitaCloud.checkpoint(g.dist,g.coins,g.t*1000);}catch{pause();toast('Не удалось сохранить полёт на устройстве. Освободи место перед продолжением.');}}if(g.t>=21000||(OrbitaCloud.expiresAt&&Date.now()>=Date.parse(OrbitaCloud.expiresAt)-3000)){finish();return;}
$('#distance').textContent=fmt(g.dist)+' м';$('#coins').textContent=fmt(g.coins);$('#effects').innerHTML=(g.shield?'<span class="effect cyan">◇ Щит · 1 удар</span>':'')+(g.magnet>0?`<span class="effect purple">∩ ${Math.ceil(g.magnet)} с</span>`:'')+(g.double>0?`<span class="effect gold">×2 ${Math.ceil(g.double)} с</span>`:'');$('#flightHint').style.opacity=g.t<5?1:0;const sector=SpaceFlight.scene(g.dist);if(g.sector!==sector.sector){g.sector=sector.sector;$('#region').textContent=SpaceFlight.names[sector.current]+' · СЕКТОР '+String(sector.sector+1).padStart(2,'0');} }
function polygon(points,fill,stroke){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function draw(){SpaceFlight.draw(ctx,W,H,g);
for(const s of g.stars){ctx.globalAlpha=.18+s.z*.45;ctx.fillStyle='#d4e6ff';ctx.fillRect(s.x*W,s.y*H,1+s.z,1+s.z*3)}ctx.globalAlpha=1;
ctx.strokeStyle='#86b7e409';for(let i=-4;i<=4;i++){ctx.beginPath();ctx.moveTo(W/2+i*12,H*.12);ctx.lineTo(W/2+i*Math.min(W,760)*.2,H);ctx.stroke()}
for(const b of g.bullets){const p=project(b);ctx.strokeStyle='#c9ff90';ctx.lineWidth=2+2*b.z;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x,p.y+18*b.z);ctx.stroke()}
for(const o of g.objects){if(o.z<0)continue;const p=project(o);ctx.save();ctx.translate(p.x,p.y);if(o.kind==='rock'){ctx.rotate(o.rot);const points=Array.from({length:9},(_,i)=>{const a=i/9*Math.PI*2,r=p.r*(.8+.2*Math.sin(i*7+o.seed));return[Math.cos(a)*r,Math.sin(a)*r]});polygon(points,'#536171','#8393a3');polygon([[0,-p.r*.7],[-p.r*.6,0],[0,p.r*.8],[p.r*.5,p.r*.2]],'#344253');ctx.fillStyle='#283443';ctx.beginPath();ctx.arc(-p.r*.3,-p.r*.25,p.r*.18,0,7);ctx.fill()}else{const color={coin:'#ffda76',shield:'#94eaff',magnet:'#cba4ff',double:'#ffce70'}[o.kind];ctx.fillStyle=color+'22';ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,p.r,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=color;ctx.font=`bold ${Math.max(8,p.r)}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText({coin:'◈',shield:'◇',magnet:'∩',double:'×2'}[o.kind],0,1)}ctx.restore()}
const px=W/2+g.x*Math.min(W,760)*.48,py=H*.85,scale=Math.min(1,W/430);ctx.save();ctx.translate(px,py);ctx.scale(scale,scale);ctx.rotate((g.target-g.x)*.6);if(g.invuln>0)ctx.globalAlpha=.5+.5*Math.sin(g.t*30);const flame=ctx.createLinearGradient(0,10,0,80);flame.addColorStop(0,'#e7ffff');flame.addColorStop(.4,SHIPS[data.selected].color);flame.addColorStop(1,'transparent');polygon([[-10,16],[0,65+Math.sin(g.t*35)*10],[10,16]],flame);const sprite=flightShipArt[data.selected];if(sprite.complete&&sprite.naturalWidth){ctx.drawImage(sprite,-48,-50,96,100)}else{polygon([[0,-39],[-14,-3],[-36,26],[-12,20],[0,29],[12,20],[36,26],[14,-3]],'#92a8bc','#c6dce9');polygon([[0,-39],[0,28],[12,20],[9,-7]],'#435971');polygon([[0,-20],[-7,4],[0,11],[7,4]],SHIPS[data.selected].color);}ctx.globalAlpha=1;if(g.shield){ctx.beginPath();ctx.ellipse(0,0,49,56,0,0,7);ctx.strokeStyle='#91e9ff';ctx.fillStyle='#9aeeff10';ctx.lineWidth=2;ctx.fill();ctx.stroke()}ctx.restore();for(const p of g.particles){ctx.globalAlpha=p.life*2;ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3)}ctx.globalAlpha=1;}
function frame(now){if(!g)return;const dt=Math.min((now-last)/1000,.04);last=now;if(g.running&&!g.paused)update(dt);if(g)draw();if(g?.running)raf=requestAnimationFrame(frame)}
try{const tg=window.Telegram?.WebApp;if(tg?.initData){tg.ready();tg.expand();tg.setHeaderColor('#080c15');tg.setBackgroundColor('#080c15');const user=tg.initDataUnsafe?.user;if(user?.first_name)$('#pilotName').textContent=user.first_name}}catch{}render();


window.addEventListener('orbita-cloud',()=>{const status=$('#flightSaveStatus');if(status)status.textContent=OrbitaCloud.status;const banner=$('#cloudStatus');if(banner)banner.textContent=OrbitaCloud.status;const p=OrbitaCloud.profile;if(p)$('#stats').innerHTML=`<div><small>Дальность за период</small><b>${fmt(p.distance)} м</b></div><div><small>Заработано за период</small><b>◉ ${fmt(p.earned)}</b></div><div><small>Полётов за период</small><b>${fmt(p.flights)}</b></div>`;});
$('#cloudRetry').onclick=()=>OrbitaCloud.retry();
OrbitaCloud.retry();

if(OrbitaCloud.enabled)syncStars().catch(()=>{});
window.addEventListener('online',()=>syncStars().catch(()=>{}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncStars().catch(()=>{});});

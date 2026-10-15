'use strict';
const BONUS_COSTS=[1000,3000,6000,10000,15000];
const BONUS_INFO={magnet:{name:'Магнит',icon:'∩',color:'#bd9aff',description:'Все монеты в поле притягиваются к кораблю.'},double:{name:'×2 монет',icon:'×2',color:'#f4d183',description:'Каждая собранная монета приносит вдвое больше.'}};
function safeBonusLevel(value){return Number.isInteger(value)&&value>=0&&value<=5?value:0;}
function bonusLevel(type){return Math.max(safeBonusLevel(data.bonusLevels[type]),safeBonusLevel(paidBonusLevels[type]));}
function bonusSeconds(type){return 10+10*bonusLevel(type);}
function renderBonusUpgrades(){
  const host=$('#bonusUpgrades');if(!host)return;
  host.innerHTML=Object.entries(BONUS_INFO).map(([type,info])=>{
    const level=bonusLevel(type),seconds=bonusSeconds(type),max=level===5;
    return `<article class="bonus-upgrade panel" style="--bonus-accent:${info.color}"><div class="bonus-upgrade-heading"><span class="bonus-module-icon">${info.icon}</span><div><span class="kicker">МОДУЛЬ / ${type==='magnet'?'ПРИТЯЖЕНИЕ':'ДОХОД'}</span><h2>${info.name}</h2></div><div class="bonus-duration"><b>${seconds}</b><small>секунд</small></div></div><p>${info.description}</p><div class="bonus-progress" role="progressbar" aria-label="${info.name}: длительность" aria-valuemin="10" aria-valuemax="60" aria-valuenow="${seconds}" aria-valuetext="${seconds} секунд, уровень ${level} из 5"><div class="bonus-track"><span style="width:${level*20}%"></span></div><div class="bonus-stops">${[10,20,30,40,50,60].map((n,i)=>`<span class="${i<=level?'reached':''} ${i===level?'current':''}"><i></i><b>${n}</b></span>`).join('')}</div></div><div class="bonus-next"><span>${max?'МАКСИМАЛЬНАЯ МОЩНОСТЬ':'СЛЕДУЮЩИЙ УРОВЕНЬ'}</span><b>${max?'60 секунд':seconds+' → '+(seconds+10)+' сек'}</b></div><div class="bonus-buy-actions">${max?'<button class="secondary" disabled>✓ Полностью улучшено</button>':`<button class="secondary" data-bonus-coin="${type}">◉ ${fmt(BONUS_COSTS[level])}</button><span>или</span><button class="secondary bonus-stars" data-bonus-stars="${type}">★ ${(level+1)*5} Stars</button>`}</div><small class="bonus-caption">${max?'Бонус работает целую минуту после подбора.':'Постоянное улучшение длительности после подбора.'}</small></article>`;
  }).join('');
  for(const type of Object.keys(BONUS_INFO)){const label=$('#'+type+'Duration');if(label)label.textContent=bonusSeconds(type)+' сек';}
}
function buyBonusCoins(type){
  if(starsBusy||!BONUS_INFO[type])return;
  const level=bonusLevel(type);if(level>=5)return;
  const price=BONUS_COSTS[level],info=BONUS_INFO[type];
  if(data.balance<price){toast('Нужно ещё '+fmt(price-data.balance)+' монет.');return;}
  showModal(`<span class="kicker">УЛУЧШЕНИЕ БОНУСА</span><h2>${info.name}: ${20+level*10} секунд</h2><p>Длительность после каждого подбора увеличится с ${10+level*10} до ${20+level*10} секунд.</p><button class="primary" id="confirmBonusCoins">Улучшить за ◉ ${fmt(price)}</button>`);
  $('#confirmBonusCoins').onclick=()=>{
    if(starsBusy||bonusLevel(type)!==level||data.balance<price)return;
    const next={...data,balance:data.balance-price,bonusLevels:{...data.bonusLevels,[type]:level+1}};
    // Commit balance and tier together; a storage error must not report success.
    try{localStorage.setItem(progressKey,JSON.stringify(next));}catch{toast('Не удалось сохранить улучшение. Освободи место и повтори.');return;}
    data=next;closeModal();render();sound('buy');toast(info.name+' улучшен до '+bonusSeconds(type)+' секунд.');
  };
}
async function showBonusStars(type){
  if(starsBusy||!BONUS_INFO[type])return;
  const level=bonusLevel(type)+1;if(level>5)return;
  return payWithStars(null,{type,level,name:BONUS_INFO[type].name});
}
function initBonusUpgrades(){
  $('#bonusUpgrades').onclick=e=>{const coin=e.target.closest('[data-bonus-coin]'),stars=e.target.closest('[data-bonus-stars]');if(coin)buyBonusCoins(coin.dataset.bonusCoin);else if(stars)showBonusStars(stars.dataset.bonusStars);};
}

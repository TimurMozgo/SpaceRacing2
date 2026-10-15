'use strict';
(()=>{
 if(!OrbitaCloud.enabled||String(OrbitaCloud.identity)!=='6088315974')return;
 const host=document.querySelector('#admin');if(!host)return;
 const panel=document.createElement('section');panel.className='panel';panel.innerHTML=`<span class="kicker">ИГРОКИ / МОНЕТЫ И МЕТРЫ</span><h2>Изменить баланс игрока</h2><p>Укажи Telegram ID. Корректировки сохраняются отдельно от полётов.</p><label class="admin-duration">Telegram ID <input id="playerId" inputmode="numeric" placeholder="6088315974"><button class="secondary" id="playerLoad">Найти игрока</button></label><p id="playerInfo" role="status">Сначала загрузи игрока.</p><div class="admin-duration"><select id="playerMetric" aria-label="Что изменить"><option value="coins">Монеты</option><option value="distance">Дальность</option></select><select id="playerMode" aria-label="Операция"><option value="add">Добавить</option><option value="subtract">Уменьшить</option><option value="set">Задать точно</option></select><input id="playerAmount" type="number" min="0" max="1000000000" step="1" placeholder="Количество"></div><div class="admin-actions"><button class="primary" id="playerApply">Применить</button><button class="secondary hidden" id="playerRetry">Повторить сохранение</button></div><p id="playerStatus" role="status"></p><div id="playerChanges"></div>`;host.append(panel);
 let player=null,busy=false,pending=null;const key='spaceracing-player-adjust-'+OrbitaCloud.identity;
 try{pending=JSON.parse(localStorage.getItem(key));}catch{}
 const q=s=>panel.querySelector(s),status=s=>q('#playerStatus').textContent=s;
 function controls(){q('#playerApply').disabled=busy||!!pending||!player;q('#playerLoad').disabled=busy||!!pending;q('#playerRetry').classList.toggle('hidden',!pending);q('#playerRetry').disabled=busy;for(const id of ['#playerId','#playerMetric','#playerMode','#playerAmount'])q(id).disabled=busy||!!pending;}
 function display(r){player=r;q('#playerId').value=r.playerId;q('#playerInfo').textContent=r.nickname+' · ID '+r.playerId+' · Монеты: '+(r.wallet?fmt(r.wallet.balance):'нужен вход в обновлённую игру')+' · Дальность: '+fmt(r.distance)+' м';q('#playerChanges').replaceChildren();for(const item of r.changes){const p=document.createElement('p');p.className='muted';p.textContent=new Date(item.at).toLocaleString('ru-RU')+' · '+(item.metric==='coins'?'Монеты':'Метры')+': '+(item.delta>=0?'+':'')+fmt(item.delta);q('#playerChanges').append(p);}controls();}
 async function load(){if(busy||pending)return;busy=true;controls();status('Получаем баланс…');try{display(await OrbitaCloud.adminPlayer(q('#playerId').value.trim()));status('Данные загружены.');}catch(e){player=null;status(e.message);}finally{busy=false;controls();}}
 async function send(){if(busy||!pending)return;busy=true;controls();status('Сохраняем…');try{const r=await OrbitaCloud.adminAdjust(pending);localStorage.removeItem(key);pending=null;display(r);status('Изменение сохранено. Следующие полёты его не отменят.');loadRanking();syncWallet().catch(()=>{});}catch(e){if(['STALE_STATE','FORBIDDEN','PLAYER_NOT_FOUND','WALLET_NOT_READY','INVALID_RESULT','COMMAND_CONFLICT','INVALID_ACTION'].includes(e.code)){pending=null;localStorage.removeItem(key);player=null;}status(e.message+(pending?' Нажми «Повторить сохранение» — изменение не применится дважды.':' Загрузи игрока заново.'));}finally{busy=false;controls();}}
 q('#playerLoad').onclick=load;q('#playerRetry').onclick=send;
 q('#playerApply').onclick=()=>{
  if(busy||pending||!player)return;
  const metric=q('#playerMetric').value,mode=q('#playerMode').value,raw=q('#playerAmount').value,amount=Number(raw);
  if(raw===''||!Number.isSafeInteger(amount)||amount<(mode==='set'?0:1)||amount>1000000000){status('Укажи целое допустимое количество.');return;}
  if(metric==='coins'&&!player.wallet){status('Игрок должен открыть обновлённую игру на устройстве со своим балансом.');return;}
  const before=metric==='coins'?player.wallet.balance:player.distance,after=mode==='set'?amount:before+(mode==='add'?amount:-amount);
  if(after<0||after>1000000000){status('Итог не может быть отрицательным или больше 1 000 000 000.');return;}
  const command={commandId:crypto.randomUUID(),playerId:player.playerId,metric,mode,amount,revision:metric==='coins'?player.wallet.revision:player.distanceRevision};
  showModal('<h2>Подтвердить изменение?</h2><p id="playerConfirmText"></p><button class="primary" id="playerConfirm">Сохранить</button>');
  document.querySelector('#playerConfirmText').textContent='ID '+player.playerId+' · '+(metric==='coins'?'Монеты':'Дальность')+': '+fmt(before)+' → '+fmt(after);
  document.querySelector('#playerConfirm').onclick=()=>{if(pending||busy)return;try{localStorage.setItem(key,JSON.stringify(command));}catch{status('Не удалось сохранить команду на устройстве.');return;}pending=command;closeModal();send();};
 };controls();if(pending)status('Осталась неподтверждённая команда. Повтори сохранение.');
})();

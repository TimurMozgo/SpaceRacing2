'use strict';
// Only Telegram signs identity. No bot token belongs in browser code or storage.
window.OrbitaCloud = (() => {
  const endpoint='https://script.google.com/macros/s/AKfycbz6Yd6uI7L_D2pAG1ZO3RIJ6WGM6qY4eqzsbnG6Ij5KzuwZ1zhmmkYulWh_54IW16ZY6Q/exec';
  const tg=window.Telegram?.WebApp;
  const identity=tg?.initDataUnsafe?.user?.id;
  const enabled=!!(tg?.initData && Number.isSafeInteger(identity));
  const key='orbita-run-v1-'+identity;
  let pendingSave=null;
  let active=null, busy=false, release=null, profile=null, status=enabled?'Подключаем бортовой журнал…':'Для общего рейтинга открой игру кнопкой в Telegram.';
  function emit(message){if(message)status=message;window.dispatchEvent(new Event('orbita-cloud'));}
  function read(){const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;}
  function persist(run){localStorage.setItem(key,JSON.stringify(run));}
  async function api(action,fields={}){
    if(!enabled)throw new Error('Открой игру кнопкой в Telegram.');
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),25000);
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({...fields,action,initData:tg.initData}),signal:controller.signal,credentials:'omit',redirect:'follow'});
      if(!response.ok)throw new Error('Сервер временно недоступен. Результат остаётся на устройстве.');
      const result=await response.json();
      if(!result.ok){const error=new Error(result.message||'Ошибка сервера');error.code=result.error;throw error;}
      return result;
    }catch(error){if(error.name==='AbortError'||error instanceof TypeError)throw new Error('Нет ответа сервера. Проверь интернет и повтори.');throw error;}
    finally{clearTimeout(timeout);}
  }
  async function lock(){
    if(!navigator.locks)throw new Error('Обнови Telegram или браузер: защищённое сохранение требует Web Locks.');
    return new Promise((resolve,reject)=>{
      navigator.locks.request(key,{ifAvailable:true},async lease=>{
        if(!lease){reject(new Error('Полёт уже открыт в другой вкладке. Закрой его там.'));return;}
        await new Promise(done=>{release=done;resolve();});
      }).catch(reject);
    });
  }
  function unlock(){if(release){release();release=null;}}
  async function sendStored(run){
    // A lost start response is retried with the same ID before final delivery.
    if(!run.started){await api('start',{runId:run.runId,rulesVersion:run.rulesVersion||'runner-1'});run.started=true;persist(run);}
    const result=await api('finish',{runId:run.runId,...run.result});
    if(!result.saved||result.runId!==run.runId)throw new Error('Сервер не подтвердил запись полёта.');
    // Delete only after a matching receipt. A lost receipt is safe to retry.
    localStorage.removeItem(key);emit('Полёт записан в таблицу.');
  }
  async function refresh(sort='distance'){
    const result=await api('leaderboard',{sort});profile=result.profile;emit();return result;
  }
  function retry(){
    if(!enabled||active||busy)return pendingSave||Promise.resolve();
    busy=true;
    pendingSave=(async()=>{
      try{await lock();const saved=read();if(saved){emit('Отправляем сохранённый полёт…');await sendStored(saved);}}
      catch(error){emit(error.message);}
      finally{unlock();busy=false;}
    })();
    const job=pendingSave;
    // Reading the leaderboard must not block registration of a new flight.
    return job.then(()=>refresh()).catch(error=>emit(error.message));
  }
  async function begin(){
    if(!enabled)throw new Error('Для записи результата запусти игру кнопкой в @SpaceRacingBot.');
    if(pendingSave)await pendingSave;
    if(busy||active)throw new Error('Полёт уже запускается или открыт.');
    busy=true;
    try{
      await lock();const saved=read();if(saved)await sendStored(saved);
      const run={runId:crypto.randomUUID(),rulesVersion:'runner-2',started:false,result:{distance:0,coins:0,durationMs:0}};
      persist(run);emit('Регистрируем полёт…');
      const ack=await api('start',{runId:run.runId,rulesVersion:run.rulesVersion||'runner-1'});
      if(ack.runId!==run.runId)throw new Error('Не удалось подтвердить начало полёта.');
      run.started=true;run.expiresAt=ack.expiresAt;persist(run);active=run;emit('Полёт зарегистрирован.');
    }catch(error){unlock();emit(error.message);throw error;}
    finally{busy=false;}
  }
  function checkpoint(distance,coins,durationMs){
    if(!active)return;
    active.result={distance:Math.floor(distance),coins:Math.floor(coins),durationMs:Math.floor(durationMs)};
    persist(active);
  }
  function finish(distance,coins,durationMs){
    if(!active||busy)return pendingSave||Promise.resolve();
    busy=true;
    pendingSave=(async()=>{
      try{checkpoint(distance,coins,durationMs);emit('Сохраняем результат…');await sendStored(active);}
      catch(error){emit('Результат ожидает отправки. '+error.message);}
      finally{active=null;busy=false;unlock();}
    })();
    return pendingSave.then(()=>refresh()).catch(()=>emit('Рейтинг обновится при следующем подключении.'));
  }
  window.addEventListener('online',()=>retry());
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)retry();});
  setInterval(()=>{if(enabled&&!active&&!busy&&read())retry();},30000);
  return {starsUpgradeInvoice:(type,level)=>api("starsInvoice",{productId:type+"_"+level,termsAccepted:true}),starsStatus:()=>api("starsStatus"),starsInvoice:shipId=>api("starsInvoice",{shipId,termsAccepted:true}),enabled,identity,begin,checkpoint,finish,retry,refresh,get profile(){return profile;},get status(){return status;},get pending(){try{return !!read();}catch{return true;}},get expiresAt(){return active?.expiresAt;}};
})();

'use strict';
let cloudRows=[],rankingError='',loading=false;
async function loadRanking(){if(loading||!OrbitaCloud.enabled)return;loading=true;renderRanking();try{const result=await OrbitaCloud.refresh();cloudRows=result.rows;rankingError='';}catch(error){rankingError=error.message;}finally{loading=false;renderRanking();renderContestClock();}}
function playerAvatar(url,className){
  const el=document.createElement('span');el.className=className;el.textContent='◈';
  if(typeof url==='string'&&/^https:\/\/(?:[a-z0-9-]+\.)*(?:t\.me|telegram\.org|telegram-cdn\.org)\//i.test(url)){
    const img=document.createElement('img');img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer';
    img.onload=()=>el.replaceChildren(img);img.onerror=()=>{img.onload=null;};img.src=url;
  }
  return el;
}
function rankingText(tag,text,className){const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el}
function renderRanking(){
  const body=$('#rankingRows');body.replaceChildren();
  $('#rankingStatus').textContent=(loading?'Обновляем рейтинг…':rankingError||(!OrbitaCloud.enabled?'Открой игру кнопкой в Telegram, чтобы участвовать в рейтинге.':'Подтверждённые результаты текущего периода.'));
  const rows=[...cloudRows].sort((a,b)=>b.distance-a.distance||a.rank-b.rank);
  if(!rows.length){const tr=document.createElement('tr'),td=rankingText('td','Здесь появятся первые исследователи.','ranking-empty');td.colSpan=2;tr.append(td);body.append(tr)}
  rows.forEach((r,i)=>{
    const tr=document.createElement('tr');tr.className='rank-row rank-'+(i+1);
    const name=document.createElement('td'),player=document.createElement('div');player.className='rank-player';
    player.append(rankingText('span',String(i+1),'rank-medal'),playerAvatar(r.photoUrl,'rank-avatar'),rankingText('b',r.nickname+(r.isMe?' · ты':''),'rank-name'));name.append(player);
    const distance=document.createElement('td');distance.append(rankingText('span',fmt(r.distance)+' м','rank-distance'));tr.append(name,distance);body.append(tr);
  });
}
$$('nav button').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.page==='leaderboard'){renderRanking();loadRanking()}}));
renderRanking();
const profileAvatar=$('.profile-heading .avatar');if(profileAvatar)profileAvatar.replaceWith(playerAvatar(window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url,'avatar'));

window.addEventListener('orbita-cloud',()=>{if(OrbitaCloud.rankingRows)cloudRows=OrbitaCloud.rankingRows;renderRanking();renderContestClock();});
loadRanking();

function renderContestClock(){
 const node=$('#contestClock'),s=OrbitaCloud.contest;if(!node)return;
 let title='Подключаем таймер…',note='Получаем время с сервера',ms=null;
 if(!OrbitaCloud.enabled){title='Открой игру в Telegram';note='Таймер и рейтинг доступны внутри приложения.';}
 else if(rankingError){title='Не удалось обновить конкурс';note=rankingError;}
 else if(s){
  if(!s.status){title='Сервер требует обновления';note='Владелец должен опубликовать серверный код админ-панели.';}
  else if(s.status==='idle'){title='Конкурс ещё не запущен';note='Ожидаем старта нового конкурса.';}
  else{
   ms=s.status==='paused'?s.remainingMs:s.endsAt?Math.max(0,Date.parse(s.endsAt)-OrbitaCloud.serverNow):null;
   if(s.status==='finished'||ms===0){title='Конкурс завершён';note='Топ зафиксирован. Ожидаем новый конкурс.';ms=0;}
   else if(s.status==='paused'){title='Конкурс на паузе';note='Таймер заморожен. Новые метры не засчитываются.';}
   else if(ms===null){title='Время ещё не задано';note='Администратор может задать срок, сохранив текущий топ.';}
   else{title='Конкурс идёт';note='Рейтинг — сумма метров всех конкурсных полётов.';}
  }
 }
 $('#contestClockTitle').textContent=title;$('#contestClockNote').textContent=note;
 const seconds=ms===null?null:Math.max(0,Math.ceil(ms/1000));
 const values=seconds===null?['—','—','—','—']:[Math.floor(seconds/86400),Math.floor(seconds%86400/3600),Math.floor(seconds%3600/60),seconds%60].map(v=>String(v).padStart(2,'0'));
 ['Days','Hours','Minutes','Seconds'].forEach((name,i)=>{$('#clock'+name).textContent=values[i];});
 node.dataset.state=s?.status||'loading';
}
setInterval(renderContestClock,1000);
setInterval(()=>{if(!document.hidden&&!$('#leaderboard').classList.contains('hidden'))loadRanking();},30000);

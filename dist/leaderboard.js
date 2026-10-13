'use strict';
let cloudRows=[],rankingError='',loading=false;
async function loadRanking(){if(loading||!OrbitaCloud.enabled)return;loading=true;renderRanking();try{const result=await OrbitaCloud.refresh();cloudRows=result.rows;rankingError='';}catch(error){rankingError=error.message;}finally{loading=false;renderRanking();}}
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
  const mine=$('#personalRankingStats');mine.replaceChildren(rankingText('b',fmt(OrbitaCloud.profile?.distance||0)+' м'),rankingText('span','суммарная дальность за конкурс'));
}
$$('nav button').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.page==='leaderboard'){renderRanking();loadRanking()}}));
renderRanking();
const profileAvatar=$('.profile-heading .avatar');if(profileAvatar)profileAvatar.replaceWith(playerAvatar(window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url,'avatar'));

window.addEventListener('orbita-cloud',()=>{if(OrbitaCloud.rankingRows)cloudRows=OrbitaCloud.rankingRows;renderRanking();renderContestClock();});
loadRanking();

function renderContestClock(){
 const node=$('#contestClock'),s=OrbitaCloud.contest;if(!node)return;
 if(!s){node.textContent='Состояние конкурса загрузится после подключения.';return;}
 if(s.status==='paused'){node.textContent='Конкурс на паузе · новые метры не засчитываются';return;}
 const remaining=s.endsAt?Math.max(0,Date.parse(s.endsAt)-OrbitaCloud.serverNow):null;
 if(s.status==='finished'||remaining===0){node.textContent='Конкурс завершён · доступен тренировочный полёт';return;}
 if(remaining===null){node.textContent='Конкурс идёт · время завершения ещё не задано';return;}
 const minutes=Math.ceil(remaining/60000);node.textContent='До конца конкурса: '+Math.floor(minutes/1440)+' д '+Math.floor(minutes%1440/60)+' ч '+minutes%60+' мин';
}
setInterval(renderContestClock,1000);
setInterval(()=>{if(!document.hidden&&!$('#leaderboard').classList.contains('hidden'))loadRanking();},30000);

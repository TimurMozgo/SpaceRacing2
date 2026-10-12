'use strict';
let rankingSort='distance',cloudRows=[],rankingError='',loading=false;
async function loadRanking(){if(loading||!OrbitaCloud.enabled)return;loading=true;renderRanking();try{const result=await OrbitaCloud.refresh(rankingSort);cloudRows=result.rows;rankingError='';}catch(error){rankingError=error.message;}finally{loading=false;renderRanking();}}
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
  const rows=[...cloudRows].sort((a,b)=>b[rankingSort]-a[rankingSort]||a.rank-b.rank);
  if(!rows.length){const tr=document.createElement('tr'),td=rankingText('td','Здесь появятся первые исследователи.','ranking-empty');td.colSpan=3;tr.append(td);body.append(tr)}
  rows.forEach((r,i)=>{
    const tr=document.createElement('tr');tr.className='rank-row rank-'+(i+1);
    const name=document.createElement('td'),player=document.createElement('div');player.className='rank-player';
    player.append(rankingText('span',String(i+1),'rank-medal'),playerAvatar(r.photoUrl,'rank-avatar'),rankingText('b',r.nickname+(r.isMe?' · ты':''),'rank-name'));name.append(player);
    const distance=document.createElement('td'),earned=document.createElement('td');distance.append(rankingText('span',fmt(r.distance)+' м','rank-distance'));earned.append(rankingText('span',fmt(r.earned)+' ◉','rank-earned'));
    tr.append(name,distance,earned);body.append(tr);
  });
  const mine=$('#personalRankingStats');mine.replaceChildren(rankingText('b',fmt(OrbitaCloud.profile?.distance||0)+' м'),rankingText('span',fmt(OrbitaCloud.profile?.earned||0)+' ◉ заработано'));
}
$$('[data-ranking-sort]').forEach(button=>button.onclick=()=>{rankingSort=button.dataset.rankingSort;$$('[data-ranking-sort]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});sound('click');renderRanking();loadRanking()});
$$('nav button').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.page==='leaderboard'){renderRanking();loadRanking()}}));
renderRanking();
const profileAvatar=$('.profile-heading .avatar');if(profileAvatar)profileAvatar.replaceWith(playerAvatar(window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url,'avatar'));

window.addEventListener('orbita-cloud',()=>{renderRanking();});
loadRanking();

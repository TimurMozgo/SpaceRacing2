'use strict';
// Presentation-only preview. Never mix these rows with real players or saved scores.
const rankingExamples = [
  {id:'sample-1',name:'StarPilot',distance:18240,earned:3860},
  {id:'sample-2',name:'NebulaFox',distance:15780,earned:4215},
  {id:'sample-3',name:'CosmoRider',distance:12960,earned:2740},
  {id:'sample-4',name:'MoonWalker',distance:10840,earned:1935},
  {id:'sample-5',name:'OrbitSeeker',distance:8640,earned:1580}
];
let rankingPreview=false,rankingSort='distance',cloudRows=[],rankingError='',loading=false;
async function loadRanking(){if(loading||!OrbitaCloud.enabled)return;loading=true;renderRanking();try{const result=await OrbitaCloud.refresh(rankingSort);cloudRows=result.rows;rankingError='';}catch(error){rankingError=error.message;}finally{loading=false;renderRanking();}}
function maskNickname(value){
  const text=String(value||'Пилот').replace(/^@/,'');
  const chars=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('ru',{granularity:'grapheme'}).segment(text)].map(x=>x.segment):Array.from(text);
  if(chars.length<=3)return '***';
  const start=Math.floor((chars.length-3)/2);
  return chars.slice(0,start).join('')+'***'+chars.slice(start+3).join('');
}
function rankingText(tag,text,className){const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el}
function renderRanking(){
  const body=$('#rankingRows');body.replaceChildren();
  $('#rankingStatus').textContent=rankingPreview?'Демонстрационный пример — вымышленные игроки и результаты.':(loading?'Обновляем рейтинг…':rankingError||(!OrbitaCloud.enabled?'Открой игру кнопкой в Telegram, чтобы участвовать в рейтинге.':'Подтверждённые результаты текущего периода.'));
  $('#rankingPreview').textContent=rankingPreview?'Скрыть пример':'Пример оформления';
  $('#rankingPreview').setAttribute('aria-pressed',String(rankingPreview));
  const rows=rankingPreview?[...rankingExamples].sort((a,b)=>b[rankingSort]-a[rankingSort]||b.distance-a.distance||b.earned-a.earned||a.id.localeCompare(b.id)):[...cloudRows].sort((a,b)=>b[rankingSort]-a[rankingSort]||a.rank-b.rank);
  if(!rows.length){const tr=document.createElement('tr'),td=rankingText('td','Здесь появятся первые исследователи.','ranking-empty');td.colSpan=3;tr.append(td);body.append(tr)}
  rows.forEach((r,i)=>{
    const tr=document.createElement('tr');tr.className='rank-row rank-'+(i+1);
    const name=document.createElement('td'),player=document.createElement('div');player.className='rank-player';
    player.append(rankingText('span',String(i+1),'rank-medal'),rankingText('span','◈','rank-avatar'),rankingText('b',rankingPreview?maskNickname(r.name):r.nickname+(r.isMe?' · ты':''),'rank-name'));name.append(player);
    const distance=document.createElement('td'),earned=document.createElement('td');distance.append(rankingText('span',fmt(r.distance)+' м','rank-distance'));earned.append(rankingText('span',fmt(r.earned)+' ◉','rank-earned'));
    tr.append(name,distance,earned);body.append(tr);
  });
  const mine=$('#personalRankingStats');mine.replaceChildren(rankingText('b',fmt(OrbitaCloud.profile?.distance||0)+' м'),rankingText('span',fmt(OrbitaCloud.profile?.earned||0)+' ◉ заработано'));
}
$('#rankingPreview').onclick=()=>{rankingPreview=!rankingPreview;sound('click');renderRanking()};
$$('[data-ranking-sort]').forEach(button=>button.onclick=()=>{rankingSort=button.dataset.rankingSort;$$('[data-ranking-sort]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});sound('click');renderRanking();loadRanking()});
$$('nav button').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.page==='leaderboard'){renderRanking();loadRanking()}}));
renderRanking();

window.addEventListener('orbita-cloud',()=>{renderRanking();});
loadRanking();

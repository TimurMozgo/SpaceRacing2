'use strict';
// Presentation-only preview. Never mix these rows with real players or saved scores.
const rankingExamples = [
  {id:'sample-1',name:'StarPilot',distance:18240,earned:3860},
  {id:'sample-2',name:'NebulaFox',distance:15780,earned:4215},
  {id:'sample-3',name:'CosmoRider',distance:12960,earned:2740},
  {id:'sample-4',name:'MoonWalker',distance:10840,earned:1935},
  {id:'sample-5',name:'OrbitSeeker',distance:8640,earned:1580}
];
let rankingPreview=false,rankingSort='distance';
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
  $('#rankingStatus').textContent=rankingPreview?'Демонстрационный пример — вымышленные игроки и результаты.':'Общий рейтинг ещё не подключён. Результаты других игроков появятся после подключения сервера.';
  $('#rankingPreview').textContent=rankingPreview?'Скрыть пример':'Пример оформления';
  $('#rankingPreview').setAttribute('aria-pressed',String(rankingPreview));
  const rows=rankingPreview?[...rankingExamples].sort((a,b)=>b[rankingSort]-a[rankingSort]||b.distance-a.distance||b.earned-a.earned||a.id.localeCompare(b.id)):[];
  if(!rows.length){const tr=document.createElement('tr'),td=rankingText('td','Здесь появятся первые исследователи.','ranking-empty');td.colSpan=3;tr.append(td);body.append(tr)}
  rows.forEach((r,i)=>{
    const tr=document.createElement('tr');tr.className='rank-row rank-'+(i+1);
    const name=document.createElement('td'),player=document.createElement('div');player.className='rank-player';
    player.append(rankingText('span',String(i+1),'rank-medal'),rankingText('span','◈','rank-avatar'),rankingText('b',maskNickname(r.name),'rank-name'));name.append(player);
    const distance=document.createElement('td'),earned=document.createElement('td');distance.append(rankingText('span',fmt(r.distance)+' м','rank-distance'));earned.append(rankingText('span',fmt(r.earned)+' ◉','rank-earned'));
    tr.append(name,distance,earned);body.append(tr);
  });
  const mine=$('#personalRankingStats');mine.replaceChildren(rankingText('b',fmt(data.best)+' м'),rankingText('span',fmt(data.totalCoins)+' ◉ заработано'));
}
$('#rankingPreview').onclick=()=>{rankingPreview=!rankingPreview;sound('click');renderRanking()};
$$('[data-ranking-sort]').forEach(button=>button.onclick=()=>{rankingSort=button.dataset.rankingSort;$$('[data-ranking-sort]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});sound('click');renderRanking()});
$$('nav button').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.page==='leaderboard')renderRanking()}));
renderRanking();

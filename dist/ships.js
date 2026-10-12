'use strict';
// Stable order preserves existing purchases. Art is vector-based and rendered once per ship.
const SHIPS=[
 {name:'PIONEER',type:'Учебный разведчик',rarity:'Базовый',color:'#a4b3c5',price:0,starsPrice:0},
 {name:'SPECTRE',type:'Патрульный перехватчик',rarity:'Улучшенный',color:'#9bd786',price:150,starsPrice:5},
 {name:'PULSAR',type:'Ионный истребитель',rarity:'Необычный',color:'#52dfc2',price:400,starsPrice:10},
 {name:'SOLARIS',type:'Солнечный штурмовик',rarity:'Редкий',color:'#63bcff',price:900,starsPrice:15},
 {name:'NOVA PRIME',type:'Крейсер дальнего космоса',rarity:'Сверхредкий',color:'#9a9aff',price:1800,starsPrice:20},
 {name:'PHANTOM',type:'Призрачный перехватчик',rarity:'Эпический',color:'#bf85ff',price:3200,starsPrice:25},
 {name:'HELIOS',type:'Плазменный разрушитель',rarity:'Элитный',color:'#ff87b9',price:5200,starsPrice:30},
 {name:'SUPERNOVA',type:'Звёздный дредноут',rarity:'Легендарный',color:'#ffae61',price:8000,starsPrice:35},
 {name:'CELESTIAL',type:'Страж звёздных врат',rarity:'Реликтовый',color:'#73edff',price:12000,starsPrice:40},
 {name:'ETERNITY',type:'Мифический флагман',rarity:'Мифический',color:'#ffdf86',price:18000,starsPrice:45}
];
const SHIP_WINGS=[
 'M100 123 77 153 77 179 102 166Z',
 'M104 102 69 151 59 192 101 177Z',
 'M104 85 78 122 39 191 70 182 101 161Z',
 'M106 89 72 97 59 151 25 189 87 173 103 151Z',
 'M103 85 74 119 57 74 44 134 22 199 81 184 102 155Z',
 'M106 81 79 99 43 172 13 197 58 190 91 166Z',
 'M105 78 72 110 57 62 39 90 40 144 18 182 67 194 98 164Z',
 'M107 67 77 89 49 69 35 113 35 157 10 194 60 209 99 173Z',
 'M105 69 88 89 62 59 47 89 58 129 18 187 48 203 96 166Z',
 'M107 64 79 84 57 42 43 68 47 116 22 149 10 211 55 196 79 210 105 170Z'
];
let shipArtSerial=0;
function shipSVG(i){
 const s=SHIPS[i],c=s.color,id='ship-'+i+'-'+(++shipArtSerial),metal=i<2?'#a4aeb8':i<6?'#dce9f4':i<9?'#f2eafa':'#fff3cf';
 const left=`<path d="${SHIP_WINGS[i]}" fill="url(#${id}-metal)" stroke="#d1e4f5" stroke-opacity=".55" stroke-width="1"/>`;
 const panel=i>1?`<path d="M94 120 59 175 81 168Z" fill="#132337"/><path d="M89 131 61 174" stroke="${c}" stroke-width="${i>5?3:2}"/>`:'';
 const cannons=i>2?`<path d="M${i>6?37:63} 120 v65" stroke="#152235" stroke-width="7"/><path d="M${i>6?37:63} 120 v26" stroke="${metal}" stroke-width="3"/>`:'';
 const engines=i<2?[108,132]:i<5?[77,108,132,163]:i<8?[53,82,108,132,158,187]:[38,65,91,120,149,175,202];
 const jets=engines.map((x,k)=>`<path d="M${x-5} 191 L${x} ${222+(k%3)*9} L${x+5} 191Z" fill="url(#${id}-jet)"/><rect x="${x-6}" y="183" width="12" height="13" rx="3" fill="#18283d" stroke="#70899e"/><path d="M${x-4} 194h8" stroke="${c}" stroke-width="3"/>`).join('');
 const ornaments=i>=6?`<g fill="none" stroke="${c}" stroke-width="1.2" opacity=".85"><path d="M65 143 82 113 93 119M175 143 158 113 147 119"/><path d="M60 151 73 156M180 151 167 156"/></g>`:'';
 const crown=i===9?`<path d="M120 11 108 34 120 29 132 34Z" fill="#fff0b2"/><path d="M98 55 87 38 83 68 100 98M142 55 153 38 157 68 140 98" fill="#cbae66" stroke="#fff0b2"/><path d="M27 161 44 138 54 148M213 161 196 138 186 148" fill="none" stroke="#fff2bd" stroke-width="3"/>`:'';
 const satellites=i===8?`<g fill="#d8f9ff" stroke="${c}"><path d="M24 82 15 110 23 130 31 110Z"/><path d="M216 82 209 110 217 130 225 110Z"/></g><path d="M24 132v18M216 132v18" stroke="${c}" stroke-width="2"/>`:'';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 250" role="img" aria-label="${s.name}"><defs><linearGradient id="${id}-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${metal}"/><stop offset=".38" stop-color="#7890a7"/><stop offset=".6" stop-color="#344b64"/><stop offset="1" stop-color="#142338"/></linearGradient><linearGradient id="${id}-body" x1="0" x2="1"><stop stop-color="#3f566b"/><stop offset=".48" stop-color="${metal}"/><stop offset=".51" stop-color="#a2b3c2"/><stop offset="1" stop-color="#20364f"/></linearGradient><linearGradient id="${id}-jet" x2="0" y2="1"><stop stop-color="#ffffff"/><stop offset=".25" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient></defs>${jets}${satellites}<g>${left}${panel}${cannons}</g><g transform="translate(240 0) scale(-1 1)">${left}${panel}${cannons}</g><path d="M120 ${i<2?43:24} L${i<2?100:96} 112 96 180 108 200 132 200 144 180 144 112Z" fill="url(#${id}-body)" stroke="${metal}" stroke-width="1.2"/><path d="M120 47 120 193 134 180 134 111Z" fill="#192e46" opacity=".52"/><path d="M120 74 108 119 112 143 128 143 132 119Z" fill="#0a172a" stroke="${c}" stroke-width="1.6"/><path d="M120 83 113 119 115 130 120 121Z" fill="${c}" opacity=".8"/><path d="M105 155v24l9 9M135 155v24l-9 9" fill="none" stroke="${c}" stroke-width="2"/><path d="M115 162h10m-10 6h10m-10 6h10" stroke="#142438" stroke-width="2"/>${ornaments}${crown}${i>3?`<circle cx="120" cy="153" r="4" fill="${c}"/><circle cx="120" cy="153" r="8" fill="none" stroke="${c}" opacity=".4"/>`:''}</svg>`;
}
const flightShipArt=SHIPS.map((_,i)=>{const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(shipSVG(i));return image;});

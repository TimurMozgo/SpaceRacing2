 'use strict';
(()=>{
 const key='spaceracing-tutorial-v1-'+(window.Telegram?.WebApp?.initDataUnsafe?.user?.id||'guest');
 try{if(localStorage.getItem(key)==='done')return}catch{}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const host=document.createElement('dialog');host.id='onboarding';host.setAttribute('aria-label','Знакомство со SpaceRacing');
 host.innerHTML=`<div class="tour-stars" aria-hidden="true"></div><div class="tour-shell"><div class="tour-top"><span>SPACE<span class="tour-accent">RACING</span> / ПЕРВЫЙ ПОЛЁТ</span><button class="tour-skip" type="button">Пропустить</button></div><div class="tour-stage" aria-live="polite"></div><footer class="tour-footer"><div class="tour-dots" aria-label="Шаг обучения"></div><button class="tour-next" type="button">Продолжить <span>↗</span></button></footer></div>`;
 document.body.append(host);
 const stage=host.querySelector('.tour-stage'),next=host.querySelector('.tour-next'),dots=host.querySelector('.tour-dots');
 let step=0,busy=false,closed=false;const previousFocus=document.activeElement,overflow=document.body.style.overflow;
 const ship='<div class="tour-craft"><div class="tour-exhaust"></div><img src="assets/ship-volume-0.svg" alt="Корабль PIONEER"></div>';
 const slides=[
 `<section class="tour-slide tour-welcome"><div class="tour-orbit" aria-hidden="true"></div><div class="tour-welcome-art">${ship}</div><span class="tour-kicker">ТВОЯ ИСТОРИЯ НАЧИНАЕТСЯ ЗДЕСЬ</span><h1 tabindex="-1">Добро пожаловать<br>в <em>SpaceRacing</em></h1><p>Твой корабль. Бескрайний космос. Новый рекорд.</p><p class="tour-sub">Уворачивайся от астероидов, собирай монеты и покоряй рейтинг.</p></section>`,
 `<section class="tour-slide"><span class="tour-kicker">01 / ВЫБЕРИ СВОЙ КОРАБЛЬ</span><h1 tabindex="-1">Твой первый<br><em>шаг к звёздам</em></h1><div class="tour-card"><img class="tour-capture" src="assets/tutorial-catalog.png" alt="Карточка PIONEER в каталоге"><div class="tour-card-craft">${ship}</div></div><p>Выбирай корабль и отправляйся в полёт.</p><p class="tour-sub">Новые корабли открываются за монеты или Telegram Stars.</p></section>`,
 `<section class="tour-slide"><span class="tour-kicker">02 / ОСВОЙ ПОЛЁТ</span><h1 tabindex="-1">Лови бонусы.<br><em>Обходи астероиды.</em></h1><div class="tour-flight"><img class="tour-capture" src="assets/tutorial-flight.jpg" alt="Полёт корабля среди астероидов и монет"><span class="tour-swipe">← Двигай корабль пальцем →</span></div><div class="tour-bonuses"><div><b>◇ Щит</b><span>Спасает от одного удара</span></div><div><b>∩ Магнит</b><span>Притягивает монеты</span></div><div><b>×2 Монеты</b><span>Удваивает сбор монет</span></div></div><p class="tour-sub">В каталоге улучшай длительность бонусов и прокачивай стрельбу.</p></section>`,
 `<section class="tour-slide"><span class="tour-kicker">03 / ОСТАВЬ СВОЙ СЛЕД</span><h1 tabindex="-1">Лети дальше.<br><em>Поднимайся выше.</em></h1><div class="tour-ranking"><img class="tour-capture" src="assets/tutorial-ranking.png" alt="Таблица лидеров и таймер конкурса"></div><p>В активном конкурсе дальность твоих полётов суммируется.</p><p class="tour-sub">Новый конкурс — новый отсчёт. На паузе метры не засчитываются. Баланс и статистика — в профиле.</p></section>`
 ];
 const wait=ms=>new Promise(r=>setTimeout(r,reduced?30:ms));
 function render(){stage.innerHTML=slides[step];dots.innerHTML=slides.map((_,i)=>`<i class="${i===step?'active':''}" aria-hidden="true"></i>`).join('');dots.setAttribute('aria-label',`Шаг ${step+1} из 4`);next.innerHTML=step===3?'В ангар <span>↗</span>':'Продолжить <span>↗</span>';stage.querySelector('h1').focus({preventScroll:true});}
 async function close(){if(closed)return;closed=true;try{localStorage.setItem(key,'done')}catch{}host.classList.add('tour-closing');await wait(380);host.close();host.remove();document.body.style.overflow=overflow;previousFocus?.focus?.({preventScroll:true});}
 next.onclick=async()=>{if(busy||closed)return;busy=true;next.disabled=true;if(step===3){await close();return}if(step===1){if(typeof sound==='function')sound('start');stage.classList.add('tour-launch');await wait(900)}stage.classList.add('tour-fade');await wait(330);if(closed)return;step++;render();stage.classList.remove('tour-launch');await new Promise(requestAnimationFrame);stage.classList.remove('tour-fade');await wait(350);busy=false;next.disabled=false;};
 host.querySelector('.tour-skip').onclick=close;host.addEventListener('cancel',e=>{e.preventDefault();close()});
 document.body.style.overflow='hidden';host.showModal();render();
})();

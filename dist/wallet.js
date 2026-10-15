'use strict';
let walletBusy=false,walletReady=false,walletSync=null;
const walletCommandKey=()=> 'spaceracing-coin-command-'+OrbitaCloud.identity;
function walletApply(wallet){
 if(!wallet||!Number.isSafeInteger(wallet.balance))throw new Error('Не удалось проверить баланс.');
 if(wallet.resetKey&&data.walletResetKey!==wallet.resetKey){data.history=[];data.best=0;data.totalCoins=0;data.totalDistance=0;data.flights=0;data.selected=0;data.walletResetKey=wallet.resetKey;}
 data.balance=wallet.balance;data.coinShips=wallet.owned.ships;data.gun=wallet.owned.gun;
 data.bonusLevels={magnet:wallet.owned.magnet,double:wallet.owned.double};
 if(!ownsShip(data.selected))data.selected=0;walletReady=true;save();render();
}
async function syncWallet(){
 if(!OrbitaCloud.enabled||!OrbitaCloud.wallet||g?.running||OrbitaCloud.pendingResult||walletBusy)return;
 if(walletSync)return walletSync;
 walletSync=(async()=>{
  const pending=localStorage.getItem(walletCommandKey());
  const result=pending?await OrbitaCloud.coinPurchase(JSON.parse(pending)):await OrbitaCloud.wallet({balance:data.balance,coinShips:data.coinShips,gun:data.gun,magnet:data.bonusLevels.magnet,double:data.bonusLevels.double});
  if(pending)localStorage.removeItem(walletCommandKey());
  if(!g?.running&&!OrbitaCloud.pendingResult)walletApply(result.wallet);
 })();
 try{return await walletSync;}finally{walletSync=null;}
}
async function buyCoins(product){
 if(walletBusy)return false;
 if(!OrbitaCloud.enabled){toast('Покупки за монеты доступны в Telegram.');return false;}
 if(OrbitaCloud.pendingResult){toast('Сохраняем полёт. Покупка станет доступна после подтверждения.');return false;}
 walletBusy=true;
 try{
  if(walletSync)await walletSync;
  const stored=localStorage.getItem(walletCommandKey());
  if(stored){const receipt=await OrbitaCloud.coinPurchase(JSON.parse(stored));localStorage.removeItem(walletCommandKey());walletApply(receipt.wallet);toast('Предыдущая покупка восстановлена.');return false;}
  if(!walletReady){const r=await OrbitaCloud.wallet({balance:data.balance,coinShips:data.coinShips,gun:data.gun,magnet:data.bonusLevels.magnet,double:data.bonusLevels.double});walletApply(r.wallet);}
  const command={commandId:crypto.randomUUID(),product};localStorage.setItem(walletCommandKey(),JSON.stringify(command));
  const result=await OrbitaCloud.coinPurchase(command);localStorage.removeItem(walletCommandKey());walletApply(result.wallet);return true;
 }catch(e){if(['INSUFFICIENT_FUNDS','INVALID_STATE','INVALID_RESULT','COMMAND_CONFLICT','WALLET_NOT_READY'].includes(e.code))localStorage.removeItem(walletCommandKey());toast(e.message);return false;}
 finally{walletBusy=false;}
}

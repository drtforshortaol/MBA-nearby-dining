'use strict';
// Lightweight PWA update controller: check on launch, when returning online,
// and periodically while open. Never interrupt an active browsing session.
(()=> {
  const status=document.getElementById('updateStatus');
  const button=document.getElementById('updateNow');
  if(!status||!button)return;
  const guest=new URL(location.href).searchParams.has('share');
  if(guest){status.hidden=true;button.hidden=true;return;}
  if(!('serviceWorker' in navigator)){status.textContent='Online updates unavailable';button.hidden=true;return;}
  let registration=null,checking=false,activated=false;
  const say=(message,showButton=false)=>{status.textContent=message;button.hidden=!showButton;};
  async function check(manual=false){
    if(checking||!navigator.onLine)return;
    checking=true;
    if(manual)say('Checking for updates…');
    try{
      registration=registration||await navigator.serviceWorker.getRegistration('./');
      if(!registration)registration=await navigator.serviceWorker.register('./sw.js');
      await registration.update();
      if(registration.waiting&&navigator.serviceWorker.controller){
        say('Update ready',true);
      }else if(manual){
        say('Up to date');
      }
    }catch(err){
      if(manual)say('Update check unavailable. Try again online.',true);
      console.warn('Eatery update check failed',err);
    }finally{checking=false;}
  }
  button.addEventListener('click',async()=>{
    if(!navigator.onLine){say('Connect to the internet to update.',true);return;}
    say('Checking for updates…');
    await check(true);
    if(registration?.waiting&&navigator.serviceWorker.controller){
      say('Installing update…');
      registration.waiting.postMessage({type:'SKIP_WAITING'});
    }
  });
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(activated)return;
    activated=true;
    // Reload only when the user is not editing a share basket or navigating a detail.
    // Basket/favorites persist in localStorage, and URL parameters are preserved.
    location.reload();
  });
  navigator.serviceWorker.ready.then(reg=>{
    registration=reg;
    reg.addEventListener('updatefound',()=>{
      const worker=reg.installing;
      worker?.addEventListener('statechange',()=>{
        if(worker.state==='installed'&&navigator.serviceWorker.controller)
          say('Update ready',true);
      });
    });
    check();
  }).catch(()=>{});
  window.addEventListener('online',()=>check());
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
  setInterval(()=>{if(!document.hidden)check()},30*60*1000);
})();

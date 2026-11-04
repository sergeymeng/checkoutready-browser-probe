'use strict';
(() => {
  const A='https://checkoutready-probe-a.sergeymeng.chatgpt.site';
  // A redirected iframe can lose its fragment through an upstream redirect.
  // Exchange state only with its exact parent on the pinned primary origin.
  if(new URLSearchParams(location.search).get('mode')==='landing'){
    window.addEventListener('message',e=>{
      const s=e.data?.state;
      if(e.origin!==A||e.source!==parent||e.data?.kind!=='redirect-state'||!s||!/^[A-Fa-f0-9]{32}$/.test(s.token)||!/^[a-f0-9-]{36}$/i.test(s.session)||!(s.expiresAt>Date.now()&&s.expiresAt<Date.now()+660000))return;
      parent.postMessage({kind:'redirect',token:s.token,session:s.session,origin:location.origin},A);
    });
    parent.postMessage({kind:'redirect-ready'},A);
    return;
  }
  let state;
  try { state=JSON.parse(decodeURIComponent(location.hash.slice(1))); } catch { return; }
  if (!state || !/^[A-Fa-f0-9]{32}$/.test(state.token) || !/^[a-f0-9-]{36}$/i.test(state.session) || Date.now()>state.expiresAt || state.expiresAt>Date.now()+660000) return;
  const name='cr_'+state.token, writeName=name+'_w', cookiePath='/checkoutready-browser-probe/';
  const hasCookie=n=>document.cookie.split(';').some(x=>x.trim()===n+'='+state.token);
  const setCookie=(n,age)=>{document.cookie=n+'='+state.token+'; Path='+cookiePath+'; SameSite=None; Secure; Max-Age='+age;};
  const mode=new URLSearchParams(location.search).get('mode');
  const message=(target,kind,data={})=>target?.postMessage({kind,token:state.token,session:state.session,...data},A);
  const encoded=()=>encodeURIComponent(JSON.stringify(state));
  if(mode==='baseline'){
    let cookie=false,storage=false;
    try {setCookie(name,600);cookie=hasCookie(name);} catch {}
    try {localStorage.setItem(name,state.token);storage=localStorage.getItem(name)===state.token;} catch {}
    state.baselineCookie=cookie;state.baselineStorage=storage;state.baselineAt=Date.now();state.baselineOrigin=location.origin;
    location.replace(A+'/run#'+encoded());
  } else if(mode==='third'){
    let cookieRead=false,cookieWrite=false,storageRead=false,storageWrite=false;
    try {cookieRead=hasCookie(name);setCookie(writeName,600);cookieWrite=hasCookie(writeName);setCookie(writeName,0);} catch {}
    try {storageRead=localStorage.getItem(name)===state.token;localStorage.setItem(writeName,state.token);storageWrite=localStorage.getItem(writeName)===state.token;localStorage.removeItem(writeName);} catch {}
    message(parent,'third',{cookieRead,cookieWrite,storageRead,storageWrite,origin:location.origin});
  } else if(mode==='landing'){
    message(parent,'redirect',{origin:location.origin,href:location.origin+location.pathname});
  } else if(mode==='popup'){
    message(opener,'popup',{origin:location.origin});document.getElementById('state').textContent='弹窗已打开';
  } else if(mode==='cleanup'){
    try {setCookie(name,0);setCookie(writeName,0);localStorage.removeItem(name);localStorage.removeItem(writeName);} catch {}
    document.getElementById('state').textContent='测试结束';
  }
})();

!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t){const n=document.querySelector("#loginBtn"),o=document.querySelector("#logoutBtn"),r=document.querySelector("#noteForm"),c=document.querySelector("#submitTextBtn"),i=document.querySelector("#submitTextSpinner"),a=document.querySelector(".cover-heading h2"),l=document.querySelector("#homeTabTextPrompt"),u=document.querySelector("#titleInput"),s=document.querySelector("#contentInput"),d=document.querySelector("#notes"),y=document.querySelector("#notesSpinner"),p=document.querySelector("audio"),m="https://davidguan.app",h="https://voice-notes-app.s3-ap-southeast-2.amazonaws.com",f=["homeTab","noteSubmitTab"];let b=document.querySelector("#homeTabContent"),v=document.querySelector("#homeTabLink");function S({acc:e}){const t={};return e&&(t.Authorization=`Bearer ${e}`),t}function g(e){e.isAuthenticated().then(t=>{n.disabled=t,o.disabled=!t,t&&(b.style.display="block",e.getTokenSilently().then(e=>{!function(e){r.style.display="block",c.addEventListener("click",t=>{t.preventDefault();const n=u.value,o=s.value,r=JSON.stringify({title:n,content:o});i.style.display="inline-block",c.style.display="none",fetch(`${m}/voice-notes`,{method:"POST",headers:{...S({acc:e}),"Content-Type":"application/json"},body:r}).then(()=>{c.style.display="inline-block",u.value="",s.value="",i.style.display="none"})}),fetch(`${m}/voice-notes`,{headers:{...S({acc:e})}}).then(e=>(200!=e.status&&(y.style.display="none",l.innerText="Sorry, this app is in the early test stage, only a small list of accounts are allowed to interacting with the APIs, please ask davidguandev@gmail.com to add your account, if you are interested to give it a go, thanks!"),e.json())).then(e=>{Array.isArray(e)&&(y.style.display="none",0!=e.length?(p.style.display="block",e.forEach(e=>{const t=document.createElement("button");t.innerText=e.name,t.className="btn btn-outline-primary note";const n=`${h}/${e.key}`;t.addEventListener("click",()=>{p.src=n,p.play()}),d.append(t)})):l.innerText='Thanks for using this app, please click "submit new note" to create your first note :)')})}(e)}),e.getUser().then(e=>{e.nickname&&(a.innerText=`Hello, ${e.nickname}`)}))})}!function(){for(const e of f){const t=document.querySelector(`#${e}Link`),n=document.querySelector(`#${e}Content`);t.addEventListener("click",()=>{b.style.display="none",(b=n).style.display="block",v.classList.remove("active"),(v=t).classList.add("active")})}}(),createAuth0Client({domain:"davidguan.auth0.com",client_id:"luC7PVwEEmjBTCC3HUenRepY5U3Zgrru",audience:"https://davidguan.app/voice-notes-app/api"}).then(e=>{g(e);const t=location.origin+location.pathname;n.addEventListener("click",()=>{e.loginWithRedirect({redirect_uri:t})}),o.addEventListener("click",()=>{e.logout({returnTo:t})});const r=location.search;r.includes("code=")&&r.includes("state=")&&e.handleRedirectCallback().then(()=>{history.replaceState({},document.title,t),g(e)})})}]);
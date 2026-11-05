// Carrusel
const track=document.getElementById("track"), slides=track.children, dots=document.getElementById("dots");
let cur=0, timer;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
[...slides].forEach((_,i)=>{const b=document.createElement("button");b.type="button";b.setAttribute("aria-label","Ir a la diapositiva "+(i+1));b.onclick=()=>go(i,true);dots.appendChild(b);});
function go(i,user){cur=(i+slides.length)%slides.length;track.style.transform=`translateX(-${cur*100}%)`;[...dots.children].forEach((d,j)=>d.setAttribute("aria-current",j===cur));if(user)restart();}
function restart(){clearInterval(timer);if(!reduce)timer=setInterval(()=>go(cur+1),5000);}
document.getElementById("prev").onclick=()=>go(cur-1,true);
document.getElementById("next").onclick=()=>go(cur+1,true);
let sx=null;track.addEventListener("touchstart",e=>sx=e.touches[0].clientX,{passive:true});
track.addEventListener("touchend",e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)go(cur+(dx<0?1:-1),true);sx=null;});
go(0);restart();

// Catálogo (sin precios hasta que el negocio los confirme). Después vendrá de la base de datos de la tienda.
const PRODUCTS=[
 {name:"Placa para mascota",cat:"Mascotas",desc:"Identificación con nombre y teléfono.",icon:"paw",tag:"Popular"},
 {name:"Termo con retrato de mascota",cat:"Termos",desc:"Grabamos el retrato de tu mascota.",icon:"cup",tag:"Favorito"},
 {name:"Termo con nombre",cat:"Termos",desc:"Nombre o ilustración en tu color favorito.",icon:"cup"},
 {name:"Caja personalizada",cat:"Regalos",desc:"Caja de madera grabada para regalo.",icon:"box"},
 {name:"Llavero grabado",cat:"Regalos",desc:"Con nombre, fecha o diseño.",icon:"key"},
 {name:"Portarretrato",cat:"Regalos",desc:"Marco de madera con mensaje grabado.",icon:"frame"},
 {name:"Gafete o pin para negocio",cat:"Negocios",desc:"Con tu logo y el nombre de tu equipo.",icon:"badge"},
 {name:"Playera personalizada",cat:"Playeras",desc:"Cuello redondo con logo estampado o parche bordado.",icon:"shirt"},
 {name:"Letrero Feliz Navidad",cat:"Navidad",desc:"Letrero de madera para tu casa.",icon:"tree",tag:"Temporada"},
 {name:"Reno con nombres",cat:"Navidad",desc:"Figura de madera con los nombres de tu familia.",icon:"gift",tag:"Temporada"},
 {name:"Esfera familiar",cat:"Navidad",desc:"Esfera con los nombres de cada integrante.",icon:"gift",tag:"Temporada"},
 {name:"Termo corporativo",cat:"Negocios",desc:"Termos con tu marca para equipos y clientes.",icon:"cup"},
];
const CATS=[["Mascotas","paw"],["Termos","cup"],["Regalos","gift"],["Negocios","badge"],["Playeras","shirt"],["Navidad","tree"],["Cajas","box"],["Llaveros","key"]];
const groups=["Todos","Mascotas","Termos","Regalos","Negocios","Playeras","Navidad"];
let active="Todos", query=""; const picked=new Set();
const tabs=document.getElementById("tabs"), grid=document.getElementById("grid");

const catsEl=document.getElementById("cats");
CATS.forEach(([c,ic])=>{const b=document.createElement("button");b.type="button";b.className="cat";
  b.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${ic}"/></svg>${c}`;
  b.onclick=()=>{if(c==="Cajas"||c==="Llaveros"){active="Todos";query=c.slice(0,-1).toLowerCase();document.getElementById("q").value=query;}else{active=c;query="";document.getElementById("q").value="";}renderTabs();renderGrid();document.getElementById("productos").scrollIntoView({behavior:reduce?"auto":"smooth"});};
  catsEl.appendChild(b);});

function renderTabs(){tabs.innerHTML="";groups.forEach(g=>{const b=document.createElement("button");b.type="button";b.className="tab";b.textContent=g;b.setAttribute("aria-pressed",g===active);b.onclick=()=>{active=g;renderTabs();renderGrid();};tabs.appendChild(b);});}
function norm(s){return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");}
function renderGrid(){
  grid.innerHTML="";
  const list=PRODUCTS.map((p,i)=>[p,i]).filter(([p])=>(active==="Todos"||p.cat===active)&&(!query||norm(p.name+" "+p.desc+" "+p.cat).includes(norm(query))));
  if(!list.length){grid.innerHTML=`<p class="empty-state">No encontramos “${query}”. Escríbenos por WhatsApp: si te lo imaginas, lo podemos hacer.</p>`;return;}
  list.forEach(([p,i])=>{
    const el=document.createElement("article");el.className="card";
    el.innerHTML=`<div class="pimg">${p.tag?`<span class="ptag">${p.tag}</span>`:""}
        <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${p.icon}"/></svg><span class="ph">Foto próximamente</span></div>
      <div class="pbody"><div class="pcat">${p.cat}</div><div class="pname">${p.name}</div><div class="pdesc">${p.desc}</div>
        <div class="prow"><div class="price">Precio <b>a cotizar</b></div>
        <button class="add" type="button"></button></div></div>`;
    const btn=el.querySelector(".add");
    const paint=()=>{const on=picked.has(i);btn.classList.toggle("on",on);btn.innerHTML=`<svg class="icon"><use href="#i-${on?"check":"plus"}"/></svg>${on?"En cotización":"Cotizar"}`;};
    btn.onclick=()=>{picked.has(i)?picked.delete(i):picked.add(i);paint();updateQuote();};
    paint();grid.appendChild(el);
  });
}
function updateQuote(){
  const n=picked.size;document.getElementById("qCount").textContent=n;
  const q=document.getElementById("quote");q.hidden=n===0;
  document.getElementById("quoteTxt").textContent=`${n} producto${n===1?"":"s"} en tu cotización`;
  const items=[...picked].map(i=>"• "+PRODUCTS[i].name).join("\n");
  document.getElementById("quoteSend").href="https://wa.me/5216151060936?text="+encodeURIComponent("Hola R&V, me gustaría cotizar:\n"+items);
}
document.getElementById("searchForm").addEventListener("submit",e=>{e.preventDefault();query=document.getElementById("q").value.trim();active="Todos";renderTabs();renderGrid();document.getElementById("productos").scrollIntoView({behavior:reduce?"auto":"smooth"});});
document.querySelectorAll("[data-cat]").forEach(a=>a.addEventListener("click",()=>{active=a.dataset.cat;query="";document.getElementById("q").value="";renderTabs();renderGrid();}));
renderTabs();renderGrid();

// Modo claro / oscuro: inicia en claro y recuerda la elección del visitante
const root=document.documentElement, themeBtn=document.getElementById("themeBtn");
const isDark=()=>root.dataset.theme==="dark";
function paintTheme(){const d=isDark();themeBtn.innerHTML=`<svg class="icon"><use href="#i-${d?"sun":"moon"}"/></svg>`;themeBtn.setAttribute("aria-label",d?"Cambiar a modo claro":"Cambiar a modo oscuro");}
themeBtn.onclick=()=>{const t=isDark()?"light":"dark";root.dataset.theme=t;try{localStorage.setItem("theme",t);}catch{}paintTheme();};
paintTheme();

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
const players=[
{id:"ronaldo",name:"Cristiano Ronaldo",ovr:97,pos:"ST",nation:"🇵🇹",club:"REAL MADRID",badge:"RM",kind:"legend",face:"🐐"},
{id:"messi",name:"Lionel Messi",ovr:98,pos:"RW",nation:"🇦🇷",club:"FC BARCELONA",badge:"FCB",kind:"legend",face:"⭐"},
{id:"pele",name:"Pelé",ovr:96,pos:"ST",nation:"🇧🇷",club:"SANTOS",badge:"SAN",kind:"legend",face:"👑"},
{id:"maradona",name:"Maradona",ovr:96,pos:"CAM",nation:"🇦🇷",club:"NAPOLI",badge:"NAP",kind:"legend",face:"✨"},
{id:"zidane",name:"Zinedine Zidane",ovr:97,pos:"CM",nation:"🇫🇷",club:"REAL MADRID",badge:"RM",kind:"legend",face:"🎩"},
{id:"ronaldo9",name:"Ronaldo Nazário",ovr:96,pos:"ST",nation:"🇧🇷",club:"REAL MADRID",badge:"RM",kind:"legend",face:"⚡"},
{id:"ronaldinho",name:"Ronaldinho",ovr:95,pos:"LW",nation:"🇧🇷",club:"FC BARCELONA",badge:"FCB",kind:"legend",face:"😁"},
{id:"beckham",name:"David Beckham",ovr:94,pos:"RM",nation:"🏴",club:"REAL MADRID",badge:"RM",kind:"legend",face:"🎯"},
{id:"mbappe",name:"Kylian Mbappé",ovr:95,pos:"ST",nation:"🇫🇷",club:"REAL MADRID",badge:"RM",kind:"current",face:"⚡"},
{id:"vini",name:"Vinícius Jr.",ovr:94,pos:"LW",nation:"🇧🇷",club:"REAL MADRID",badge:"RM",kind:"current",face:"🔥"},
{id:"bellingham",name:"Jude Bellingham",ovr:94,pos:"CAM",nation:"🏴",club:"REAL MADRID",badge:"RM",kind:"current",face:"💫"},
{id:"haaland",name:"Erling Haaland",ovr:95,pos:"ST",nation:"🇳🇴",club:"MAN CITY",badge:"MCI",kind:"current",face:"💥"}
];
let owned=["ronaldo","messi","zidane","ronaldinho","mbappe","vini","bellingham","haaland"];
let coins=12000,gems=250,squad=["vini","ronaldo","mbappe","ronaldinho","zidane","bellingham","beckham","messi","pele","maradona","ronaldo9"];
const $=id=>document.getElementById(id), get=id=>players.find(p=>p.id===id);
function card(p){return `<article class="player-card ${p.kind}"><div class="rating">${p.ovr}</div><div class="position">${p.pos}</div><div class="portrait">${p.face}</div><div class="player-name">${p.name}</div><div class="card-meta"><span>${p.nation}</span><span>⚡ ${p.ovr-4}</span></div><div class="club">🏅 ${p.badge} · ${p.club}</div></article>`}
function updateWallet(){$("coins").textContent=coins.toLocaleString("en-US");$("gems").textContent=gems}
function toast(t){$("toast").textContent=t;$("toast").style.display="block";setTimeout(()=>$("toast").style.display="none",2200)}
function show(name){["home","packs","collection","squad","play"].forEach(x=>$(x+"Screen").classList.toggle("hidden",x!==name));$("matchScreen").classList.add("hidden")}
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>show(b.dataset.go));
$("profileBtn").onclick=()=>$("authModal").classList.remove("hidden");$("closeAuth").onclick=()=>$("authModal").classList.add("hidden");
$("googleLogin").onclick=()=>toast("Google kirish uchun Firebase konfiguratsiyasini ulash kerak.");
$("featured").innerHTML=owned.slice(0,5).map(id=>card(get(id))).join("");
function renderCollection(filter="all"){$("collection").innerHTML=owned.map(get).filter(p=>filter==="all"||p.kind===filter).map(card).join("")}
renderCollection();
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderCollection(b.dataset.filter)});
let pending=[];
$("openPack").onclick=()=>{if(coins<2000)return toast("Tangalar yetarli emas!");coins-=2000;updateWallet();const pool=[...players].sort(()=>Math.random()-.5);pending=[pool[0],pool[1],pool.find(p=>p.ovr>=85)||pool[2]];$("pulled").innerHTML=pending.map(card).join("");$("reveal").classList.remove("hidden")};
$("claim").onclick=()=>{pending.forEach(p=>{if(!owned.includes(p.id))owned.push(p.id)});$("reveal").classList.add("hidden");renderCollection();$("featured").innerHTML=owned.slice(-5).map(id=>card(get(id))).join("");toast("Kartalar kolleksiyaga qo‘shildi!")};
function renderSquad(){$("formation").innerHTML=`<div class="lineup">${[0,1,2].map(i=>slot(i)).join("")}</div><div class="lineup">${[3,4,5,6].map(i=>slot(i)).join("")}</div><div class="lineup">${[7,8,9,10].map(i=>slot(i)).join("")}</div>`;let avg=Math.round(squad.map(get).reduce((a,p)=>a+p.ovr,0)/11);$("teamRating").textContent="OVR "+avg;document.querySelectorAll(".slot").forEach(s=>s.onclick=()=>pick(Number(s.dataset.i)))}
function slot(i){let p=get(squad[i]);return `<button class="slot" data-i="${i}"><b>${p.ovr}</b><strong>${p.name.split(" ").slice(-1)[0]}</strong><small>${p.pos} · ${p.nation}</small></button>`}
function pick(i){$("squadPicker").classList.remove("hidden");$("pickerCards").innerHTML=owned.map(id=>get(id)).map(p=>`<div data-pick="${p.id}">${card(p)}</div>`).join("");document.querySelectorAll("[data-pick]").forEach(el=>el.onclick=()=>{squad[i]=el.dataset.pick;renderSquad();$("squadPicker").classList.add("hidden");toast("Tarkib yangilandi")})}
renderSquad();
$("launchMatch").onclick=()=>{show("home");$("matchScreen").classList.remove("hidden");start3D()};
$("exitMatch").onclick=()=>{$("matchScreen").classList.add("hidden");stop3D();show("home")};

let renderer,scene,camera,raf,clock,matchScore=[0,0],matchTime=120,chosen,ball,ballVel,matchPlayers=[],move={x:0,y:0},drag=false;
function start3D(){
 const mount=$("matchMount");scene=new THREE.Scene();scene.background=new THREE.Color(0x9bcbe4);scene.fog=new THREE.Fog(0x9bcbe4,40,100);
 camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,120);camera.position.set(0,22,30);
 renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;mount.appendChild(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xffffff,0x31543a,2));let sun=new THREE.DirectionalLight(0xffffff,2.3);sun.position.set(-10,25,15);sun.castShadow=true;scene.add(sun);
 const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.8});
 let green=material(0x167b43),stripe=material(0x21884b),white=material(0xffffff),blue=material(0x176cce),red=material(0xd94343),skin=material(0xd8a47b),black=material(0x17232c);
 let pitch=new THREE.Mesh(new THREE.PlaneGeometry(28,46),green);pitch.rotation.x=-Math.PI/2;pitch.receiveShadow=true;scene.add(pitch);
 for(let i=0;i<8;i++){let m=new THREE.Mesh(new THREE.PlaneGeometry(3.5,46),i%2?green:stripe);m.rotation.x=-Math.PI/2;m.position.set(-12.25+i*3.5,.01,0);scene.add(m)}
 function line(x,z,w,d){let o=new THREE.Mesh(new THREE.BoxGeometry(w,.025,d),white);o.position.set(x,.025,z);scene.add(o)}
 line(0,0,.12,44);line(0,-22,28,.12);line(0,22,28,.12);line(-14,0,.12,44);line(14,0,.12,44);
 let ring=new THREE.Mesh(new THREE.TorusGeometry(4,.05,8,64),white);ring.rotation.x=Math.PI/2;ring.position.y=.04;scene.add(ring);
 function player(team,x,z,n){let g=new THREE.Group();let torso=new THREE.Mesh(new THREE.CylinderGeometry(.35,.42,.9,12),team?red:blue);torso.position.y=1.1;torso.castShadow=true;g.add(torso);let head=new THREE.Mesh(new THREE.SphereGeometry(.23,12,12),skin);head.position.y=1.75;g.add(head);for(let s of [-.16,.16]){let leg=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.5,8),black);leg.position.set(s,.22,0);g.add(leg)}g.position.set(x,0,z);g.userData={team,home:new THREE.Vector3(x,0,z)};scene.add(g);matchPlayers.push(g);return g}
 let formation=[[-9,-15],[-4,-16],[0,-16],[4,-16],[9,-15],[-8,-8],[-3,-8],[3,-8],[8,-8],[-3,-2],[3,-2]];
 formation.forEach((p,i)=>player(0,p[0],p[1],i));formation.forEach((p,i)=>player(1,-p[0],-p[1],i));
 ball=new THREE.Mesh(new THREE.SphereGeometry(.27,18,14),material(0xffffff));ball.position.set(0,.3,0);scene.add(ball);ballVel=new THREE.Vector3();chosen=9;matchScore=[0,0];matchTime=120;clock=new THREE.Clock();
 function tick(){raf=requestAnimationFrame(tick);let dt=Math.min(clock.getDelta(),.04);matchTime=Math.max(0,matchTime-dt);$("matchClock").textContent=`${String(Math.floor(matchTime/60)).padStart(2,"0")}:${String(Math.floor(matchTime%60)).padStart(2,"0")}`;let p=matchPlayers[chosen];p.position.x=THREE.MathUtils.clamp(p.position.x+move.x*dt*7,-13,13);p.position.z=THREE.MathUtils.clamp(p.position.z+move.y*dt*7,-21,21);if(p.position.distanceTo(ball.position)<1.1){ball.position.set(p.position.x,.3,p.position.z-.65);ballVel.set(0,0,0)}else{ball.position.addScaledVector(ballVel,dt);ballVel.multiplyScalar(.986)}matchPlayers.forEach((q,i)=>{if(i!==chosen)q.position.lerp(q.userData.home,dt*.45)});camera.position.lerp(new THREE.Vector3(p.position.x,22,p.position.z+29),dt*2);camera.lookAt(p.position.x,0,p.position.z-2);renderer.render(scene,camera);if(matchTime<=0){cancelAnimationFrame(raf);toast("Uchrashuv tugadi!");}}
 tick();
}
function stop3D(){if(raf)cancelAnimationFrame(raf);if(renderer){renderer.dispose();renderer.domElement.remove()}matchPlayers=[];renderer=null}
$("shoot").onclick=()=>{if(!ball||!matchPlayers.length)return;let p=matchPlayers[chosen];ball.position.set(p.position.x,.3,p.position.z-.8);ballVel.set((Math.random()-.5)*3,0,-20)};
$("pass").onclick=()=>{if(!ball||!matchPlayers.length)return;let p=matchPlayers[chosen];ball.position.set(p.position.x,.3,p.position.z-.7);ballVel.set((Math.random()-.5)*5,0,-13)};
$("switch").onclick=()=>{chosen=(chosen+1)%11};
const stick=$("stick"),knob=$("knob");function joystick(e){let r=stick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,d=Math.hypot(dx,dy),m=40;if(d>m){dx*=m/d;dy*=m/d}move={x:dx/m,y:dy/m};knob.style.left=(r.width/2-22+dx)+"px";knob.style.top=(r.height/2-22+dy)+"px"}stick.onpointerdown=e=>{drag=true;stick.setPointerCapture(e.pointerId);joystick(e)};stick.onpointermove=e=>{if(drag)joystick(e)};function release(){drag=false;move={x:0,y:0};knob.style.left="33px";knob.style.top="33px"}stick.onpointerup=release;stick.onpointercancel=release;

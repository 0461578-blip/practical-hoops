import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';

const S=new THREE.Scene(), C=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,300);
C.position.set(0,5.2,10);
const R=new THREE.WebGLRenderer({antialias:true}); R.setPixelRatio(Math.min(devicePixelRatio,2)); R.setSize(innerWidth,innerHeight); R.shadowMap.enabled=true; document.body.appendChild(R.domElement);
S.background=new THREE.Color(0x080b11);
S.add(new THREE.HemisphereLight(0xffffff,0x273044,2.2));
const sun=new THREE.DirectionalLight(0xffffff,3); sun.position.set(6,12,8); sun.castShadow=true; S.add(sun);

const M=c=>new THREE.MeshStandardMaterial({color:c,roughness:.62});
const floor=new THREE.Mesh(new THREE.BoxGeometry(28,.25,16),M(0x86552e)); floor.receiveShadow=true; S.add(floor);
function courtLine(x,z,w,d){const m=new THREE.Mesh(new THREE.BoxGeometry(w,.035,d),M(0xffffff));m.position.set(x,.04,z);S.add(m)}
courtLine(0,0,.07,16); courtLine(0,0,10,.07); courtLine(0,7.8,28,.12); courtLine(0,-7.8,28,.12);
const arc=new THREE.Mesh(new THREE.RingGeometry(2.95,3.02,64),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));arc.rotation.x=-Math.PI/2;arc.position.y=.05;S.add(arc);
function hoop(z){const p=new THREE.Mesh(new THREE.CylinderGeometry(.13,.17,3.4,16),M(0x252a32));p.position.set(0,1.7,z);S.add(p);const b=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.8,.12),M(0xe8e8e8));b.position.set(0,4.15,z);S.add(b);const r=new THREE.Mesh(new THREE.TorusGeometry(.64,.07,12,32),M(0xff6b00));r.rotation.x=Math.PI/2;r.position.set(0,3.35,z+(z>0?-.64:.64));S.add(r)}
hoop(7.4);hoop(-7.4);

function limb(a,b,r,c,g){const d=b.clone().sub(a),m=new THREE.Mesh(new THREE.CapsuleGeometry(r,d.length(),5,8),M(c));m.position.copy(a.clone().add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());m.castShadow=true;g.add(m);return m}
function avatar(color,number=3){
 const g=new THREE.Group(),skin=0x8b5a3c,white=0xf8fafc,dark=0x111827;
 g.userData={ballHand:'right',number,parts:{}};
 const torso=new THREE.Mesh(new THREE.BoxGeometry(.78,.82,.44),M(color));torso.position.y=1.52;g.add(torso);
 const trim=new THREE.Mesh(new THREE.BoxGeometry(.82,.12,.46),M(white));trim.position.y=1.2;g.add(trim);
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,.16,12),M(skin));neck.position.y=1.98;g.add(neck);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.32,18,14),M(skin));head.position.y=2.25;g.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.33,18,10,0,Math.PI*2,0,Math.PI*.48),M(dark));hair.position.y=2.39;g.add(hair);
 const band=new THREE.Mesh(new THREE.TorusGeometry(.30,.035,8,24),M(white));band.rotation.x=Math.PI/2;band.position.y=2.27;g.add(band);
 const shorts=new THREE.Mesh(new THREE.BoxGeometry(.72,.32,.42),M(dark));shorts.position.y=1.02;g.add(shorts);
 const parts=g.userData.parts;
 parts.lThigh=limb(new THREE.Vector3(-.22,.92,0),new THREE.Vector3(-.28,.57,0),.145,skin,g);
 parts.lShin=limb(new THREE.Vector3(-.28,.57,0),new THREE.Vector3(-.30,.14,0),.105,skin,g);
 parts.rThigh=limb(new THREE.Vector3(.22,.92,0),new THREE.Vector3(.28,.57,0),.145,skin,g);
 parts.rShin=limb(new THREE.Vector3(.28,.57,0),new THREE.Vector3(.30,.14,0),.105,skin,g);
 parts.lUpper=limb(new THREE.Vector3(-.41,1.76,0),new THREE.Vector3(-.62,1.47,0),.12,skin,g);
 parts.lFore=limb(new THREE.Vector3(-.62,1.47,0),new THREE.Vector3(-.76,1.17,0),.095,skin,g);
 parts.rUpper=limb(new THREE.Vector3(.41,1.76,0),new THREE.Vector3(.62,1.47,0),.12,skin,g);
 parts.rFore=limb(new THREE.Vector3(.62,1.47,0),new THREE.Vector3(.78,1.12,0),.095,skin,g);
 parts.lHand=new THREE.Vector3(-.76,1.17,0);parts.rHand=new THREE.Vector3(.78,1.12,0);
 const sl=new THREE.Mesh(new THREE.BoxGeometry(.45,.16,.70),M(white));sl.position.set(-.30,.04,-.12);g.add(sl);const sr=sl.clone();sr.position.x=.30;g.add(sr);
 const num=new THREE.Mesh(new THREE.PlaneGeometry(.28,.28),new THREE.MeshBasicMaterial({color:white,side:THREE.DoubleSide}));num.position.set(0,1.53,.226);g.add(num);
 return g
}
const me=avatar(0x2563eb,3);me.position.set(0,0,3);S.add(me);
const ball=new THREE.Mesh(new THREE.SphereGeometry(.22,20,16),M(0xb45309));ball.castShadow=true;S.add(ball);

const state={
 keys:{},score:0,opp:0,stamina:100,mode:1,playerBall:true,cpuBall:false,
 action:null,actionStart:0,ballFlight:null,ballOwner:null,dribbleClock:0,lastKey:{},
 yaw:0,pitch:.25,build:{pos:'PG',height:6.2,take:'Shot Creator'},shot:{speed:65,window:12},
 rep:0,level:1,badges:{}, takeover:0
};
let enemies=[],mates=[];
const ATTR={PG:{three:88,mid:84,layup:78,dunk:45,handle:92,speed:90,pass:88,perim:78,interior:40,steal:72,block:35,rebound:30,strength:45,stamina:92,vertical:70},SG:{three:92,mid:88,layup:82,dunk:65,handle:84,speed:86,pass:72,perim:82,interior:48,steal:75,block:42,rebound:42,strength:52,stamina:90,vertical:78},SF:{three:82,mid:80,layup:86,dunk:82,handle:72,speed:78,pass:70,perim:84,interior:66,steal:72,block:62,rebound:62,strength:68,stamina:86,vertical:84},PF:{three:70,mid:72,layup:84,dunk:90,handle:55,speed:70,pass:62,perim:72,interior:84,steal:55,block:82,rebound:88,strength:86,stamina:84,vertical:82},C:{three:55,mid:62,layup:86,dunk:94,handle:42,speed:58,pass:58,perim:55,interior:96,steal:40,block:94,rebound:97,strength:96,stamina:82,vertical:76}};
const BADGES=[
 ['Quick Draw','shoot','mid'],['Tunnel Vision','shoot','three'],['Limitless Shooter','shoot','three'],['Corner Spot-Up','shoot','three'],['Fade Artist','shoot','mid'],
 ['Dimer','play','pass'],['Quick Pass','play','pass'],['Quick Handles','play','handle'],['Soul Snatcher','play','handle'],['Space Maker','play','handle'],
 ['Intimidator','def','perim'],['Locks','def','perim'],['Thief','def','steal'],['Rim Saver','def','block'],['Rebound Chaser','def','rebound'],
 ['High Flyer','finish','dunk'],['Perfect Lays','finish','layup'],['Gymnast','finish','layup'],['Traffic Finisher','finish','strength'],['Alley-Oop Finisher','finish','dunk'],
 ['Deep Post Bag','post','strength'],['Paint King','post','strength'],['Post Footwork','post','handle'],['Post Lockdown','post','interior'],['Fast Breaker','physical','speed'],['Hustler','physical','stamina'],['Iron Screens','physical','strength']
];
const tiers=[65,75,85,92,97];
function attr(){return ATTR[state.build.pos]}
function badgeTier(name){const b=BADGES.find(x=>x[0]===name);if(!b)return 0;const key=b[2];const v=attr()[key]||0;let t=0;tiers.forEach((n,i)=>{if(v>=n)t=i+1});return t}
function refreshBadges(){state.badges={};BADGES.forEach(b=>{const t=badgeTier(b[0]);if(t)state.badges[b[0]]=t})}
refreshBadges();

function toast(t){const e=document.getElementById('toast');e.textContent=t;e.style.opacity=1;setTimeout(()=>e.style.opacity=0,650)}
function hud(){document.getElementById('score').textContent=state.score+' - '+state.opp;document.getElementById('stamina').textContent=Math.round(state.stamina);document.getElementById('modeHud').textContent=state.mode+'V'+state.mode;document.getElementById('ovr').textContent=Math.round(Object.values(attr()).reduce((a,b)=>a+b,0)/Object.keys(attr()).length)}
function handWorld(g,side){const p=side==='left'?g.userData.parts.lHand:g.userData.parts.rHand;return p.clone().applyMatrix4(g.matrixWorld)}
function nearestDef(){let best=null;for(const e of enemies){const d=e.position.distanceTo(me.position);if(!best||d<best.d)best={e,d}}return best}
function addRep(n){state.rep+=n;const old=state.level;state.level=1+Math.floor(state.rep/250);if(state.level>old){toast('REP UP! LEVEL '+state.level);state.takeover=Math.min(100,state.takeover+25)}}
function beginMeter(type){if(!state.playerBall||state.cpuBall||state.ballFlight||state.action)return;state.action=type;state.actionStart=performance.now();document.getElementById('meter').classList.remove('hidden');document.getElementById('meterName').textContent=type.toUpperCase()}
function releaseMeter(){
 if(!state.action)return;
 const held=(performance.now()-state.actionStart)/1000,charge=THREE.MathUtils.clamp(held/1.05,0,1);
 const def=nearestDef(),contest=def&&def.d<2.5, moving=Math.hypot((state.keys.d?1:0)-(state.keys.a?1:0),(state.keys.s?1:0)-(state.keys.w?1:0))>.1;
 let type=state.action;state.action=null;document.getElementById('meter').classList.add('hidden');
 if(type==='layup'&&Math.abs(me.position.z)<4.2){toast('DRIVE TO RIM');return}
 if(type==='dunk'&&Math.abs(me.position.z)<5.6){toast('GET CLOSER');return}
 let a=attr(),skill=type==='dunk'?a.dunk:type==='layup'?a.layup:(Math.abs(me.position.z)<4?a.mid:a.three);
 let width=(state.shot.window/100)*.22*(skill/90)*(state.stamina<35?.72:1)*(contest?.55:1);
 const green=Math.abs(charge-.72)<width;
 let make=green || (Math.random()<.08+skill/800&&!contest);
 if(type==='dunk')make=skill>=70&&state.stamina>15;
 if(contest&&!green&&type==='shoot')make=Math.random()<.04;
 let targetZ=me.position.z>0?-7.4:7.4,target=new THREE.Vector3(THREE.MathUtils.clamp(me.position.x,-5.8,5.8),3.35,targetZ);
 if(type==='layup')target.y=3.35;
 if(!make)target.x+= (Math.random()-.5)*(contest?2.0:1.0);
 state.ballFlight={t:0,dur:type==='dunk'?.5:type==='layup'?.65:1,start:handWorld(me,me.userData.ballHand),end:target,type,make,cpu:false};
 state.playerBall=false;
 if(green){addRep(type==='shoot'?12:8);toast('GREEN!')}else toast(contest?'CONTESTED':'EARLY / LATE');
}
function dunk(){if(Math.abs(me.position.z)>5.6&&state.stamina>15){state.stamina-=15;beginMeter('dunk')}else toast('GET TO RIM')}
function steal(){
 if(!state.cpuBall||!enemies[0]){toast('NO STEAL');return}
 const e=enemies[0],d=me.position.distanceTo(e.position),s=attr().steal;
 if(d>1.8){toast('TOO FAR');return}
 const chance=THREE.MathUtils.clamp(.12+s/180+(1-d)*.18,0,.78);
 if(Math.random()<chance){state.cpuBall=false;state.playerBall=true;state.ballOwner=me;addRep(10);toast('STEAL!')}else{state.stamina=Math.max(0,state.stamina-4);toast('REACH MISSED')}
}
function block(){
 if(!state.cpuBall||!enemies[0]){toast('NO SHOT');return}
 const e=enemies[0],d=e.position.distanceTo(me.position);
 if(state.ballFlight?.cpu&&d<2.1){state.ballFlight=null;state.cpuBall=false;state.playerBall=true;addRep(15);toast('BLOCK!');return}
 if(d<2.2){toast('CONTEST');addRep(2)}else toast('TOO FAR')
}
function pass(targetIndex=0,kind='chest'){
 if(!state.playerBall||!mates[targetIndex]){toast('NO TARGET');return}
 const mate=mates[targetIndex],start=handWorld(me,me.userData.ballHand),end=mate.position.clone();end.y=1.2;
 const a=attr(),accuracy=a.pass,bonus=state.badges['Dimer']?state.badges['Dimer']*0.03:0;
 const err=Math.random()>(.05+accuracy/150+bonus)?.7:0;
 if(err)end.x+=(Math.random()-.5)*1.5;
 state.playerBall=false;state.ballFlight={t:0,dur:Math.max(.25,.55-start.distanceTo(end)*.025),start,end,type:'pass',make:true,cpu:false,passTarget:mate};
 addRep(kind==='flashy'?5:3);toast(kind.toUpperCase()+' PASS')
}
function dribble(k){
 if(!state.playerBall)return;
 const now=performance.now(),last=state.lastKey[k]||0;state.lastKey[k]=now;
 const hand=state.build.pos==='C'?'right':me.userData.ballHand;
 if(k==='z'||k==='c'){me.userData.ballHand=hand==='right'?'left':'right';me.velocity.x+=(k==='z'?-1:1)*(state.keys.shift?3.2:1.8);toast(state.keys.shift?'EXPLOSIVE CROSS':'HESI / CROSS')}
 else if(k==='x'){me.velocity.z+=state.keys.w?3.0:-3.0;toast(now-last<330?'SNATCHBACK':'STEPBACK')}
 else if(k==='v'){me.velocity.x+=(me.userData.ballHand==='right'?-1:1)*2.2;toast('BEHIND BACK')}
 else if(k==='b'){me.rotation.y+=(me.userData.ballHand==='right'?-1:1)*.65;toast('SPIN')}
 else if(k==='g'){toast('POST UP')}
 else if(k==='c'&&now-last<330){toast('DOUBLE CROSS')}
}
function input(k){
 if(k==='e')beginMeter('shoot'); else if(k==='q')beginMeter('layup'); else if(k===' ')dunk(); else if(k==='f')steal(); else if(k==='r')block();
 else if(k==='t')pass(0,'chest'); else if(k>='1'&&k<='4')pass(+k-1,'chest'); else if('zxcvbg'.includes(k))dribble(k);
}
addEventListener('keydown',e=>{const k=e.key.toLowerCase();state.keys[k]=true;if(k==='tab'){e.preventDefault();document.getElementById('side').classList.toggle('hidden')}if(!e.repeat)input(k)});
addEventListener('keyup',e=>{const k=e.key.toLowerCase();state.keys[k]=false;if(['e','q',' '].includes(k))releaseMeter()});
R.domElement.onmousedown=e=>{state.drag=true;state.lx=e.clientX;state.ly=e.clientY};addEventListener('mouseup',()=>state.drag=false);addEventListener('mousemove',e=>{if(!state.drag)return;state.yaw-=(e.clientX-state.lx)*.006;state.pitch=THREE.MathUtils.clamp(state.pitch-(e.clientY-state.ly)*.004,-.2,.75);state.lx=e.clientX;state.ly=e.clientY});

function resetTeams(){
 [...enemies,...mates].forEach(x=>S.remove(x));enemies=[];mates=[];state.playerBall=true;state.cpuBall=false;state.ballFlight=null;
 const n=state.mode;for(let i=0;i<n;i++){const e=avatar(0xef4444,11+i);e.position.set((i-(n-1)/2)*3,-1-i*.5,-1);S.add(e);enemies.push(e)}
 for(let i=0;i<state.mode-1;i++){const m=avatar(0x2563eb,4+i);m.position.set((i-(state.mode-2)/2)*3,0,1+i);S.add(m);mates.push(m)}
}
resetTeams();

function animate(g,t,moving,def=false){
 const p=g.userData.parts;if(!p)return;const s=moving?Math.sin(t)*.5:0;
 p.lThigh.rotation.x=s;p.rThigh.rotation.x=-s;p.lShin.rotation.x=-s*.55;p.rShin.rotation.x=s*.55;
 p.lUpper.rotation.z=-s*.35;p.rUpper.rotation.z=s*.35;p.lFore.rotation.z=-s*.5;p.rFore.rotation.z=s*.5;
 if(def){p.lUpper.rotation.z=-.55;p.rUpper.rotation.z=.55;p.lFore.rotation.z=-.75;p.rFore.rotation.z=.75}
}
function cpuShoot(e){
 const d=e.position.distanceTo(me.position),contest=d<2.5,skill=ATTR[state.build.pos].mid;
 state.cpuBall=false;state.ballFlight={t:0,dur:1,start:handWorld(e,'right'),end:new THREE.Vector3(e.position.x,3.35,e.position.z>0?-7.4:7.4),type:'cpu',make:Math.random()<(contest?.18:.52),cpu:true,contested:contest};toast(contest?'CPU CONTESTED':'CPU SHOT')
}
function ai(dt){
 enemies.forEach((e,i)=>{
  const d=me.position.clone().sub(e.position);d.y=0;const dist=d.length();
  if(state.mode===1){
   if(state.cpuBall){if(dist>2.5)e.position.addScaledVector(d.normalize(),dt);e.userData.cpuDribble=true;e.userData.aiClock=(e.userData.aiClock||0)+dt;if(e.userData.aiClock>2.2&&dist>2.2){e.userData.aiClock=0;cpuShoot(e)}}
   else if(!state.ballFlight){if(dist>1.3)e.position.addScaledVector(d.normalize(),dt*2.2);else if(Math.random()<dt*.5){state.cpuBall=true;state.playerBall=false;toast('CPU HAS BALL')}}
  }else if(dist>1.8)e.position.addScaledVector(d.normalize(),dt*(1.2+i*.1));
 });
 mates.forEach((m,i)=>{const target=new THREE.Vector3(me.position.x+(i?2:-2),0,me.position.z+2);m.position.lerp(target,dt*.3)})
}
function tick(dt){
 const k=state.keys,ix=(k.d?1:0)-(k.a?1:0),iz=(k.s?1:0)-(k.w?1:0),len=Math.hypot(ix,iz);
 const sprint=k.shift&&state.stamina>0&&len;if(sprint)state.stamina=Math.max(0,state.stamina-24*dt);else state.stamina=Math.min(100,state.stamina+14*dt);
 const max=sprint?7:4.7,tx=len?ix/len*max:0,tz=len?iz/len*max:0;
 me.velocity??=new THREE.Vector3();me.velocity.x=THREE.MathUtils.damp(me.velocity.x,tx,22,dt);me.velocity.z=THREE.MathUtils.damp(me.velocity.z,tz,22,dt);
 if(!len){me.velocity.x=THREE.MathUtils.damp(me.velocity.x,0,18,dt);me.velocity.z=THREE.MathUtils.damp(me.velocity.z,0,18,dt)}
 me.position.x=THREE.MathUtils.clamp(me.position.x+me.velocity.x*dt,-12.5,12.5);me.position.z=THREE.MathUtils.clamp(me.position.z+me.velocity.z*dt,-6.5,6.5);
 if(len)me.rotation.y=Math.atan2(me.velocity.x,me.velocity.z);
 const t=performance.now()/130;animate(me,t,len, state.cpuBall&&nearestDef()?.d<3);enemies.forEach((e,i)=>animate(e,t+i,len||e.userData.cpuDribble));mates.forEach((m,i)=>animate(m,t+i,true));
 state.dribbleClock+=dt*(len?1.2:.8);
 if(!state.ballFlight){
  if(state.playerBall){const p=handWorld(me,me.userData.ballHand);ball.position.copy(p);ball.position.y-=Math.abs(Math.sin(state.dribbleClock*7.2))*.2}
  else if(state.cpuBall&&enemies[0]){const p=handWorld(enemies[0],'right');ball.position.copy(p);ball.position.y-=Math.abs(Math.sin(state.dribbleClock*7))*.18}
 }
 if(state.ballFlight){
  const f=state.ballFlight;f.t+=dt/f.dur;const q=THREE.MathUtils.clamp(f.t,0,1),p=f.start.clone().lerp(f.end,q);p.y+=f.type==='pass'?.6:4*Math.sin(Math.PI*q);ball.position.copy(p);
  if(q>=1){
   if(f.type==='pass'){state.playerBall=true;state.ballOwner=f.passTarget;toast('PASS COMPLETE')}
   else if(f.cpu){if(f.make){state.opp+=2;addRep(2);toast('CPU BUCKET')}else{toast('CPU MISS');state.playerBall=true}state.cpuBall=false}
   else if(f.make){state.score+=2;addRep(f.type==='dunk'?25:f.type==='layup'?15:20);toast(f.type==='dunk'?'DUNK!':'BUCKET');state.playerBall=false}else{toast('MISS');state.playerBall=true}
   state.ballFlight=null;
  }
 }
 if(state.action){const c=THREE.MathUtils.clamp((performance.now()-state.actionStart)/1050,0,1);document.getElementById('needle').style.left=(c*100)+'%'}
 ai(dt);hud();
 const target=new THREE.Vector3(me.position.x+Math.sin(state.yaw)*7,3.2+state.pitch*4,me.position.z+Math.cos(state.yaw)*7);C.position.lerp(target,.12);C.lookAt(me.position.x,1.15,me.position.z)
}
let last=performance.now();function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;tick(dt);R.render(S,C);requestAnimationFrame(loop)}requestAnimationFrame(loop);

play.onclick=()=>{menu.classList.add('hidden');hud.classList.remove('hidden')};
mode.onclick=()=>{state.mode=state.mode%3+1;mode.textContent='MODE: '+state.mode+'V'+state.mode;resetTeams();toast(state.mode+'V'+state.mode+' READY')};
build.onclick=()=>creator.classList.toggle('hidden');shot.onclick=()=>shotcreator.classList.toggle('hidden');park.onclick=()=>toast('PARK HUB — BUILDING');
meterCreatorBtn.onclick=()=>metercreator.classList.toggle('hidden');
document.querySelectorAll('.meterPick').forEach(b=>b.onclick=()=>{meterChoice.textContent='Selected: '+b.textContent;toast(b.textContent+' METER')});
saveBuild.onclick=()=>{state.build={pos:pos.value,height:+height.value,take:take.value};refreshBadges();hud();toast('BUILD SAVED')};
saveShot.onclick=()=>{state.shot.speed=+speed.value;state.shot.window=+window.value;toast('JUMPSHOT SAVED')};
document.querySelectorAll('.mobile [data-k]').forEach(b=>{b.onpointerdown=()=>{const k=b.dataset.k;if('wasd'.includes(k))state.keys[k]=true;else input(k)};b.onpointerup=()=>{const k=b.dataset.k;if('wasd'.includes(k))state.keys[k]=false;else if(state.action)releaseMeter()}});
addEventListener('resize',()=>{C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix();R.setSize(innerWidth,innerHeight)});

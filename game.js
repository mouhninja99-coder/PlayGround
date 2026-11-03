(()=>{
const canvas=document.querySelector('#game'),c=canvas.getContext('2d'),ui={kills:document.querySelector('#kills'),gas:document.querySelector('#gas'),gate:document.querySelector('#gatebar'),msg:document.querySelector('#message'),overlay:document.querySelector('#overlay'),title:document.querySelector('#title'),copy:document.querySelector('#copy'),eyebrow:document.querySelector('#eyebrow'),keys:document.querySelector('#keys'),start:document.querySelector('#start')};
let w=innerWidth,h=innerHeight,dpr=1,last=0,clock=0,state='intro',keys={},pointer={x:0,y:0},particles=[],slashes=[],shake=0;
const ground=()=>h*.82;
let hero,titans=[],kills=0,gate=100,seconds=100,gas=100,spawnTimer=0,hookLine=null,noticeTimer=0;
function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';c.setTransform(dpr,0,0,dpr,0,0);if(hero)hero.y=Math.min(hero.y,ground()-25)}
addEventListener('resize',resize);resize();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rand=(a,b)=>a+Math.random()*(b-a);
function start(){state='play';kills=0;gate=100;seconds=100;gas=100;spawnTimer=0;titans=[];hero={x:w*.23,y:ground()-26,vx:0,vy:0,face:1,onGround:true,invuln:0,boost:0,trail:[]};addTitan(w*.76);ui.overlay.classList.add('hide');last=performance.now()}
function addTitan(x){titans.push({x,y:ground(),scale:rand(.9,1.08),speed:rand(13,20),health:1,phase:rand(0,7),attack:0,flash:0,id:kills+titans.length+1})}
function nape(t){return{x:t.x+t.scale*29,y:t.y-t.scale*244}}
function hookAt(x,y,auto=false){if(state!=='play'||gas<4)return;let target=null;if(auto||!Number.isFinite(x)){let best=Infinity;titans.forEach(t=>{let p=nape(t),dist=Math.hypot(p.x-hero.x,p.y-hero.y);if(dist<best){best=dist;target=p}});if(target){x=target.x;y=target.y}}if(!target){const t=titans.find(t=>Math.abs(x-t.x)<t.scale*80&&y>t.y-t.scale*300&&y<t.y);if(t){target=nape(t);x=target.x;y=target.y}}if(x===undefined)return;hookLine={x:clamp(x,10,w-10),y:clamp(y,45,ground()-20),life:2.6};hero.vy-=90;gas=Math.max(0,gas-4);spark(hero.x,hero.y-8,'#e9d29b',5)}
function spark(x,y,color,n=8){for(let i=0;i<n;i++)particles.push({x,y,vx:rand(-170,170),vy:rand(-190,80),life:rand(.25,.7),max:.7,color,size:rand(1,4)})}
function strike(){if(state!=='play')return;let target=null,best=Infinity;titans.forEach(t=>{let p=nape(t),dist=Math.hypot(p.x-hero.x,p.y-hero.y);if(dist<best){best=dist;target=t}});if(target&&best<76&&hero.y<ground()-95){slashes.push({x:hero.x,y:hero.y-22,life:.25});spark(hero.x,hero.y-20,'#f8e6bf',22);shake=9;target.flash=.35;titans=titans.filter(t=>t!==target);kills++;gas=Math.min(100,gas+30);ui.msg.textContent='NAPE SEVERED — KEEP MOVING';ui.msg.classList.add('show');noticeTimer=1.5;if(kills>=3){finish(true);return}spawnTimer=1.1}else{slashes.push({x:hero.x+hero.face*26,y:hero.y-25,life:.12});spark(hero.x+hero.face*24,hero.y-25,'#d7c698',4)}}
function finish(win){state=win?'win':'lose';ui.overlay.classList.remove('hide');ui.eyebrow.textContent=win?'DISTRICT ROSE · SORTIE COMPLETE':'DISTRICT ROSE · GATE OVERRUN';ui.title.innerHTML=win?'THE WALL<br><em>HOLDS</em>':'THE WALL<br><em>FALLS</em>';ui.copy.textContent=win?'Three giants down. The gate stands, and the smoke begins to clear. The district will remember this morning.':'The outer gate has been breached. The squad has to fall back—but this is not the end.';ui.keys.innerHTML='<span>TIME '+Math.ceil(seconds)+' SECONDS</span><span>ELIMINATIONS '+kills+' / 3</span><span>GATE '+Math.round(gate)+'%</span>';ui.start.textContent='DEPLOY AGAIN  →'}
function update(dt){clock+=dt;if(noticeTimer>0){noticeTimer-=dt;if(noticeTimer<=0)ui.msg.classList.remove('show')}if(state!=='play')return;seconds-=dt;if(seconds<=0){finish(false);return}if(spawnTimer>0){spawnTimer-=dt;if(spawnTimer<=0)addTitan(w+90)}if(keys.ShiftLeft||keys.ShiftRight){if(gas>0){hero.boost=Math.max(hero.boost,.18);gas=Math.max(0,gas-21*dt)}}else gas=Math.min(100,gas+7*dt);
let dir=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);if(dir){hero.face=dir;hero.vx+=dir*(hero.boost>0?1550:1040)*dt}else hero.vx*=Math.pow(.08,dt);hero.vx=clamp(hero.vx,hero.boost?-640:-290,hero.boost?640:290);if(hero.boost>0)hero.boost-=dt;
if((keys.KeyW||keys.ArrowUp)&&hero.onGround){hero.vy=-500;hero.onGround=false;spark(hero.x,ground()-4,'#c7aa7b',4)}
if(hookLine){hookLine.life-=dt;let dx=hookLine.x-hero.x,dy=hookLine.y-hero.y,dist=Math.hypot(dx,dy)||1;hero.vx+=dx/dist*1050*dt;hero.vy+=dy/dist*1050*dt;hero.vx=clamp(hero.vx,-720,720);hero.vy=clamp(hero.vy,-720,720);gas=Math.max(0,gas-5*dt);if(dist<35||hookLine.life<=0)hookLine=null}
hero.vy+=1250*dt;hero.x+=hero.vx*dt;hero.y+=hero.vy*dt;hero.x=clamp(hero.x,22,w-28);if(hero.y>=ground()-26){hero.y=ground()-26;hero.vy=0;hero.onGround=true}else hero.onGround=false;if(hero.invuln>0)hero.invuln-=dt;hero.trail.push({x:hero.x,y:hero.y});if(hero.trail.length>8)hero.trail.shift();
for(const t of titans){t.x-=t.speed*dt;t.phase+=dt*2;t.flash=Math.max(0,t.flash-dt);if(t.x<hero.x+32&&Math.abs(hero.y-(t.y-t.scale*120))<100&&hero.invuln<=0){hero.invuln=1.2;hero.vx=-hero.face*260;hero.vy=-270;gate=Math.max(0,gate-12);spark(hero.x,hero.y,'#ba6851',10)}if(t.x<w*.16){titans=titans.filter(a=>a!==t);gate-=34;shake=12;spawnTimer=.6;if(gate<=0){finish(false);return}}}
for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=380*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);slashes.forEach(s=>s.life-=dt);slashes=slashes.filter(s=>s.life>0);shake=Math.max(0,shake-25*dt);ui.kills.textContent=kills+' / 3';ui.gas.textContent=Math.round(gas)+'%';ui.gate.style.width=gate+'%';const exposed=titans.some(t=>Math.hypot(nape(t).x-hero.x,nape(t).y-hero.y)<82);if(noticeTimer<=0){ui.msg.textContent=exposed?'NAPE EXPOSED — STRIKE NOW':'';ui.msg.classList.toggle('show',exposed)}}
function path(points,fill,stroke,width=1){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.lineWidth=width;c.strokeStyle=stroke;c.stroke()}}
function background(){let g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#506c78');g.addColorStop(.42,'#ba9b7c');g.addColorStop(1,'#594e43');c.fillStyle=g;c.fillRect(0,0,w,h);let sun=c.createRadialGradient(w*.69,h*.27,2,w*.69,h*.27,h*.42);sun.addColorStop(0,'#f2d4a0aa');sun.addColorStop(1,'#e4b78000');c.fillStyle=sun;c.fillRect(0,0,w,h);
// distant cloud bands
for(let i=0;i<7;i++){let x=((i*197-clock*7)%(w+300))-100,y=h*(.12+(i%3)*.07);c.fillStyle=['#e6d5bd18','#e5c7a328','#d8c6ae20'][i%3];c.beginPath();c.ellipse(x,y,100+i%3*35,12+i%2*8,-.04,0,Math.PI*2);c.fill()}
// wall
let gy=ground();c.fillStyle='#777361';c.fillRect(0,gy-106,w,106);for(let x=0;x<w;x+=58){c.fillStyle=x%116?'#898371':'#99917c';c.fillRect(x,gy-102,56,94);c.strokeStyle='#5e5c52';c.lineWidth=2;c.strokeRect(x+1,gy-101,53,92);c.fillStyle='#454b47';c.fillRect(x+18,gy-55,16,30)}
// gate arch
c.fillStyle='#4b4d48';c.fillRect(w*.105,gy-102,w*.13,103);c.fillStyle='#323a39';c.beginPath();c.arc(w*.17,gy-90,w*.055,Math.PI,0);c.lineTo(w*.225,gy);c.lineTo(w*.115,gy);c.closePath();c.fill();c.strokeStyle='#b49b74';c.lineWidth=3;c.strokeRect(w*.115,gy-100,w*.11,98);for(let y=gy-80;y<gy;y+=18){c.strokeStyle='#8c7657';c.lineWidth=2;c.beginPath();c.moveTo(w*.12,y);c.lineTo(w*.22,y);c.stroke()}
// rooftops
for(let i=0;i<12;i++){let x=i*w/10-w*.03,base=gy-105-(i%3)*12,bw=w*.07;path([[x,base],[x+bw*.48,base-38-(i%2)*18],[x+bw,base],[x+bw,gy-105],[x,gy-105]],i%2?'#555751':'#626057','#393d3b',2);c.fillStyle='#c39865';c.fillRect(x+bw*.28,base+8,6,13);c.fillRect(x+bw*.66,base+8,6,13);c.strokeStyle='#353b39';c.lineWidth=3;c.beginPath();c.moveTo(x-3,base);c.lineTo(x+bw*.48,base-41-(i%2)*18);c.lineTo(x+bw+3,base);c.stroke()}
// ground / debris
let grd=c.createLinearGradient(0,gy,0,h);grd.addColorStop(0,'#71634f');grd.addColorStop(1,'#292d2b');c.fillStyle=grd;c.fillRect(0,gy,w,h-gy);for(let i=0;i<30;i++){let x=(i*173+clock*9)%(w+20);c.fillStyle=i%2?'#d8c09a30':'#20262655';c.fillRect(x,gy+rand(4,1),rand(7,22),2)}
// fog and distant smoke
for(let i=0;i<6;i++){let x=(i*231+clock*12)%(w+200)-80,y=gy-50-(i%3)*34;c.fillStyle='#d2c2a22c';c.beginPath();c.ellipse(x,y,80,18,0,0,Math.PI*2);c.fill()}
}
function drawHero(){if(!hero)return;let x=hero.x,y=hero.y;if(hero.invuln>0&&Math.floor(clock*15)%2)return;
// trailing cloak
if(hero.boost>0||Math.abs(hero.vx)>180){c.strokeStyle='#7b9b8270';c.lineWidth=2;hero.trail.forEach((p,i)=>{c.beginPath();c.moveTo(p.x,p.y-25);c.lineTo(p.x-hero.face*(i+1)*5,p.y-22-i*1.3);c.stroke()})}
c.save();c.translate(x,y);c.scale(hero.face,1);c.fillStyle='#192322';c.beginPath();c.moveTo(-8,-33);c.lineTo(-27,-27);c.lineTo(-18,-5);c.lineTo(-4,-10);c.fill();c.fillStyle='#638268';path([[-8,-31],[-24,-26],[-18,-8],[-1,-13]],'#52735b','#34493d',1);c.fillStyle='#303c38';c.fillRect(-8,-29,17,20);c.fillStyle='#af9b77';c.fillRect(-10,-25,19,3);c.strokeStyle='#b9a17c';c.lineWidth=2;c.beginPath();c.moveTo(-5,-28);c.lineTo(-13,-14);c.moveTo(7,-28);c.lineTo(13,-14);c.stroke();c.fillStyle='#383d38';c.fillRect(-7,-12,6,11);c.fillRect(2,-12,6,11);c.fillStyle='#252b28';c.fillRect(-10,-3,11,4);c.fillRect(1,-3,11,4);c.fillStyle='#d5b98d';c.beginPath();c.arc(0,-37,6,0,Math.PI*2);c.fill();c.fillStyle='#26322f';c.fillRect(-7,-41,14,4);c.fillStyle='#b59059';c.fillRect(-4,-39,8,2);c.strokeStyle='#c9b48c';c.lineWidth=2;c.beginPath();c.moveTo(-10,-25);c.lineTo(-15,-19);c.moveTo(9,-25);c.lineTo(14,-19);c.stroke();c.fillStyle='#b6aa89';c.fillRect(-16,-20,5,8);c.fillRect(11,-20,5,8);
// crossed harness and blade glint
c.strokeStyle='#d0b782';c.lineWidth=1;c.beginPath();c.moveTo(-7,-30);c.lineTo(7,-14);c.moveTo(7,-30);c.lineTo(-7,-14);c.stroke();c.strokeStyle='#eee1bf';c.lineWidth=1;c.beginPath();c.moveTo(13,-17);c.lineTo(21,-31);c.stroke();c.restore()}
function drawTitan(t){
let s=t.scale,x=t.x,y=t.y,walk=Math.sin(t.phase)*.12,skin=t.flash?'#f0c4a0':'#b98970',shade=t.flash?'#dda78d':'#916955';c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha=.99;
// shadow
c.fillStyle='#211f1a66';c.beginPath();c.ellipse(4,0,55,9,0,0,Math.PI*2);c.fill();
// legs
path([[-24,-112],[-45,-82+walk*55],[-49,-17],[-31,-8],[-15,-75],[-4,-115]],skin,'#594d43',2);path([[8,-114],[25,-84-walk*55],[34,-16],[52,-8],[55,-85],[33,-121]],shade,'#594d43',2);c.fillStyle='#504c43';c.fillRect(-53,-12,28,12);c.fillRect(28,-12,32,12);
// torso broad shoulders, slight belly
path([[-34,-204],[-48,-191],[-37,-140],[-30,-105],[-17,-98],[12,-98],[34,-121],[38,-170],[30,-201],[15,-215],[-15,-214]],skin,'#5e4d44',2);c.fillStyle=shade;c.beginPath();c.ellipse(2,-151,17,29,.12,0,Math.PI*2);c.fill();
// arms
path([[-35,-195],[-57,-188],[-68,-152],[-84,-118],[-76,-105],[-62,-116],[-45,-143],[-20,-171]],shade,'#594b42',2);path([[28,-197],[52,-188],[61,-155],[77,-120],[71,-106],[59,-115],[38,-146],[17,-170]],skin,'#594b42',2);c.strokeStyle='#5c4d43';c.lineWidth=2;c.beginPath();c.moveTo(-79,-114);c.lineTo(-86,-103);c.moveTo(-73,-110);c.lineTo(-78,-97);c.moveTo(72,-113);c.lineTo(80,-100);c.stroke();
// neck and head
c.fillStyle=shade;c.fillRect(-12,-226,26,28);c.beginPath();c.ellipse(4,-245,25,30,-.05,0,Math.PI*2);c.fillStyle=skin;c.fill();c.strokeStyle='#604d43';c.lineWidth=2;c.stroke();c.fillStyle='#413631';c.beginPath();c.ellipse(-7,-247,4,3,0,0,Math.PI*2);c.ellipse(12,-247,4,3,0,0,Math.PI*2);c.fill();c.strokeStyle='#513e38';c.lineWidth=2;c.beginPath();c.moveTo(-8,-232);c.lineTo(5,-228);c.lineTo(14,-233);c.stroke();c.fillStyle='#d1a588';c.fillRect(-9,-236,24,2);
// nape marked on back of head
let pulse=.65+Math.sin(clock*6)*.25;c.shadowColor='#f3bd72';c.shadowBlur=15*pulse;c.fillStyle='#f0bd72';c.beginPath();c.ellipse(27,-244,5,9,.24,0,Math.PI*2);c.fill();c.shadowBlur=0;c.strokeStyle='#fff0c3';c.lineWidth=1;c.stroke();
// anatomy lines
c.strokeStyle='#684f47';c.globalAlpha=.55;c.lineWidth=1;c.beginPath();c.moveTo(-21,-192);c.quadraticCurveTo(-3,-180,17,-194);c.moveTo(-25,-174);c.quadraticCurveTo(0,-164,27,-176);c.moveTo(-18,-144);c.quadraticCurveTo(0,-137,19,-146);c.stroke();c.globalAlpha=1;
// drifting steam
for(let j=0;j<3;j++){let sy=-170-j*36,off=Math.sin(clock*2+j+t.phase)*13;c.fillStyle='#f0dfc044';c.beginPath();c.ellipse(off-23,sy,7+j*2,15+j*3,-.25,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(off+29,sy-8,6+j*2,13+j*3,.2,0,Math.PI*2);c.fill()}
c.restore()}
function render(){c.save();if(shake)c.translate(rand(-shake,shake),rand(-shake,shake));background();titans.forEach(drawTitan);
// nape lock indicator
for(const t of titans){let p=nape(t);c.strokeStyle='#f3cb81b0';c.lineWidth=1;c.setLineDash([4,5]);c.beginPath();c.arc(p.x,p.y,11+Math.sin(clock*6)*2,0,Math.PI*2);c.stroke();c.setLineDash([])}
if(hookLine){c.strokeStyle='#d9d3be';c.lineWidth=1.5;c.beginPath();c.moveTo(hero.x,hero.y-25);c.lineTo(hookLine.x,hookLine.y);c.stroke();c.fillStyle='#f4dfad';c.beginPath();c.arc(hookLine.x,hookLine.y,3,0,Math.PI*2);c.fill()}
drawHero();for(const p of particles){c.globalAlpha=clamp(p.life/p.max,0,1);c.fillStyle=p.color;c.beginPath();c.arc(p.x,p.y,p.size,0,Math.PI*2);c.fill()}c.globalAlpha=1;
for(const s of slashes){c.save();c.globalAlpha=clamp(s.life/.25,0,1);c.strokeStyle='#fff0c8';c.lineWidth=4;c.shadowColor='#f6d79d';c.shadowBlur=15;c.beginPath();c.arc(s.x,s.y,30+(1-s.life/.25)*18,-.9,1.3);c.stroke();c.restore()}
// restrained cinematic vignette
let vg=c.createRadialGradient(w/2,h*.48,h*.2,w/2,h*.48,h*.8);vg.addColorStop(.55,'#11181700');vg.addColorStop(1,'#111817a8');c.fillStyle=vg;c.fillRect(0,0,w,h);if(state==='play'&&seconds<18){c.fillStyle=`rgba(150,45,33,${(18-seconds)/95})`;c.fillRect(0,0,w,h)}c.restore();}
const action=(el,fn)=>el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();fn()});
action(ui.start,start);action(document.querySelector('#hook'),()=>hookAt(NaN,NaN,true));action(document.querySelector('#slash'),strike);
for(const [id,key] of [['moveL','ArrowLeft'],['moveR','ArrowRight']]){const el=document.querySelector('#'+id);el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);keys[key]=true});const stop=()=>keys[key]=false;el.addEventListener('pointerup',stop);el.addEventListener('pointercancel',stop);el.addEventListener('lostpointercapture',stop)}
addEventListener('keydown',e=>{keys[e.code]=true;if(['ArrowLeft','ArrowRight','ArrowUp','Space'].includes(e.code))e.preventDefault();if(e.repeat)return;if(state!=='play'&&(e.code==='Enter'||e.code==='Space'))start();if(e.code==='KeyQ')hookAt(NaN,NaN,true);if(e.code==='Space')strike()});addEventListener('keyup',e=>keys[e.code]=false);addEventListener('blur',()=>keys={});
canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top});canvas.addEventListener('pointerdown',e=>{if(state!=='play')return;const r=canvas.getBoundingClientRect();hookAt(e.clientX-r.left,e.clientY-r.top)});canvas.addEventListener('contextmenu',e=>e.preventDefault());
function frame(now){let dt=Math.min(.035,(now-last)/1000||0);last=now;update(dt);render();requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();


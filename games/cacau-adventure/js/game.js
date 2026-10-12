const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const livesEl = document.querySelector('#lives');
const snacksEl = document.querySelector('#snacks');
const bonesEl = document.querySelector('#bones');
const timerEl = document.querySelector('#timer');
const statusEl = document.querySelector('#status');
const overlay = document.querySelector('#overlay');
const overlayTitle = document.querySelector('#overlay-title');
const overlayText = document.querySelector('#overlay-text');
const overlayIcon = document.querySelector('#overlay-icon');
const overlayKicker = document.querySelector('#overlay-kicker');
const gameLogo = document.querySelector('#game-logo');
const soundToggle = document.querySelector('#sound-toggle');
const creditsOverlay = document.querySelector('#credits-overlay');
const keys = {};
const world = { width: 5200, height: 720, gravity: 1800 };
const checkpointX = 2620;
const goalX = 5030;
let player, camera, collectibles, enemies, gameState, lastTime = 0;
let cacauSprite = null;
let flagSprite = null;
let animationTime = 0;
let audioContext = null;
let musicTimer = null;
let musicStep = 0;
let soundEnabled = true;

const cacauImage = document.querySelector('#cacau-sprite-source');
cacauImage.addEventListener('load', () => { cacauSprite = cacauImage; });
if (cacauImage.complete && cacauImage.naturalWidth > 0) cacauSprite = cacauImage;
const flagImage = document.querySelector('#flag-source');
flagImage.addEventListener('load', () => { flagSprite = flagImage; });
if (flagImage.complete && flagImage.naturalWidth > 0) flagSprite = flagImage;

function ensureAudio() {
  if (!soundEnabled) return false;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === 'suspended') audioContext.resume();
  return true;
}
function playTone(frequency, duration, volume, type = 'sine', delay = 0) {
  if (!ensureAudio()) return;
  const now = audioContext.currentTime + delay;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + .02);
  gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + .03);
}
function startMusic() {
  if (musicTimer || !ensureAudio()) return;
  const melody = [659, 784, 880, 784, 698, 784, 988, 880, 784, 698, 659, 587, 698, 784, 659, 523];
  const chords = [[262, 330, 392], [294, 370, 440], [330, 415, 494], [294, 370, 440]];
  const playNote = () => {
    if (!gameState?.started || gameState.ended || !soundEnabled) return;
    const step = musicStep++;
    const chord = chords[Math.floor(step / 4) % chords.length];
    if (step % 4 === 0) {
      chord.forEach(note => playTone(note, .72, .009));
      playTone(chord[0] / 2, .6, .015, 'triangle');
    }
    playTone(melody[step % melody.length], .3, .025, 'triangle');
  };
  playNote();
  musicTimer = window.setInterval(playNote, 400);
}
function stopMusic() { if (musicTimer) window.clearInterval(musicTimer); musicTimer = null; }
function playJumpBark() {
  if (!ensureAudio()) return;
  const now = audioContext.currentTime;
  const bark = (start, high, low, volume) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(high, start);
    oscillator.frequency.exponentialRampToValueAtTime(low, start + .09);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .01);
    gain.gain.exponentialRampToValueAtTime(.0001, start + .11);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + .13);
  };
  bark(now, 215, 125, .045);
  bark(now + .075, 185, 110, .03);
}
function playSnackSound() {
  playTone(880, .12, .035, 'triangle');
  playTone(1175, .18, .022, 'sine', .07);
}
function playCheckpointSound() {
  playTone(659, .15, .03, 'triangle');
  playTone(784, .16, .028, 'triangle', .1);
  playTone(1047, .24, .025, 'sine', .2);
}

const platforms = [
  { x:0,y:590,w:720,h:130 }, { x:820,y:590,w:630,h:130 }, { x:1560,y:590,w:730,h:130 },
  { x:2400,y:590,w:720,h:130 }, { x:3230,y:590,w:700,h:130 }, { x:4040,y:590,w:1160,h:130 },
  { x:260,y:465,w:150,h:25 }, { x:485,y:390,w:135,h:25 },
  { x:930,y:500,w:120,h:25 }, { x:1110,y:430,w:145,h:25 }, { x:1320,y:360,w:105,h:25 },
  { x:1690,y:480,w:140,h:25 }, { x:1880,y:400,w:145,h:25 }, { x:2090,y:470,w:120,h:25 },
  { x:2500,y:495,w:135,h:25 }, { x:2680,y:420,w:145,h:25 }, { x:2870,y:345,w:125,h:25 }, { x:3050,y:465,w:120,h:25 },
  { x:3360,y:485,w:140,h:25 }, { x:3540,y:405,w:140,h:25 }, { x:3760,y:335,w:145,h:25 },
  { x:4270,y:470,w:145,h:25,moving:true,homeX:4270,distance:135,speed:1.4,phase:0 }, { x:4580,y:390,w:145,h:25 }, { x:4800,y:470,w:120,h:25 },
  { x:990,y:410,w:105,h:25,secretId:'roseira' }, { x:1140,y:330,w:115,h:25,secretId:'roseira' }, { x:1300,y:260,w:120,h:25,secretId:'roseira' },
  { x:3470,y:320,w:110,h:25,secretId:'bosque' }, { x:3640,y:245,w:120,h:25,secretId:'bosque' }, { x:3810,y:285,w:115,h:25,secretId:'bosque' }
];
const secretRoutes = [
  { id:'roseira',x:1160,y:340,label:'Trilha das flores' },
  { id:'bosque',x:3650,y:255,label:'Atalho do bosque' }
];

function reset(started = true) {
  player = { x:90,y:500,w:46,h:65,vx:0,vy:0,onGround:false,face:1,invincible:0,checkpoint:90,sniff:0,scentTarget:null };
  camera = { x:0 }; gameState = { lives:3,snacks:0,bones:0,elapsed:0,ended:false,started,revealedSecrets:new Set(),checkpointReached:false }; if (started) overlay.classList.add('hidden'); updateHud();
  collectibles = [
    {x:300,y:420,type:'snack'},{x:385,y:420,type:'snack'},{x:545,y:345,type:'bone'},
    {x:950,y:455,type:'snack'},{x:1170,y:385,type:'snack'},{x:1360,y:315,type:'bone'},
    {x:1740,y:435,type:'snack'},{x:1930,y:355,type:'snack'},{x:2140,y:425,type:'bone'},
    {x:2540,y:450,type:'snack'},{x:2730,y:375,type:'snack'},{x:2920,y:300,type:'bone'}, {x:3070,y:420,type:'snack'},
    {x:3400,y:440,type:'snack'},{x:3590,y:360,type:'bone'},{x:3810,y:290,type:'snack'},
    {x:4310,y:425,type:'snack'},{x:4630,y:345,type:'bone'},{x:4840,y:425,type:'snack'},{x:4950,y:545,type:'snack'},
    {x:1040,y:365,type:'snack',secretId:'roseira'},{x:1195,y:285,type:'bone',secretId:'roseira'},{x:1360,y:215,type:'snack',secretId:'roseira'},
    {x:3520,y:275,type:'snack',secretId:'bosque'},{x:3700,y:200,type:'bone',secretId:'bosque'},{x:3865,y:260,type:'snack',secretId:'bosque'}
  ];
  enemies = [
    {x:575,y:548,w:50,h:42,vx:-45,min:520,max:670,type:'cat'}, {x:1090,y:548,w:58,h:42,vx:35,min:870,max:1370,type:'vacuum'},
    {x:1790,y:548,w:50,h:42,vx:-42,min:1610,max:2180,type:'cat'}, {x:2050,y:548,w:58,h:42,vx:40,min:1810,max:2200,type:'vacuum'},
    {x:2780,y:548,w:50,h:42,vx:-48,min:2480,max:3030,type:'cat'}, {x:3490,y:548,w:58,h:42,vx:42,min:3270,max:3890,type:'vacuum'},
    {x:4380,y:548,w:50,h:42,vx:-45,min:4100,max:4780,type:'cat'}, {x:4880,y:548,w:58,h:42,vx:38,min:4600,max:5100,type:'vacuum'}
  ];
  if (started) startMusic();
}
function showStartMenu() {
  reset(false);
  overlayKicker.textContent = 'FASE 1 • PRIMEIROS PASSOS';
  gameLogo.hidden = false;
  overlayIcon.hidden = true;
  overlayTitle.hidden = true;
  overlayIcon.textContent = '🐾';
  overlayTitle.textContent = 'Cacau Adventure';
  overlayText.textContent = 'Ajude a yorkshire Cacau a atravessar o parque e encontrar seu brinquedo favorito.';
  document.querySelector('#restart').textContent = 'Começar a aventura';
  statusEl.textContent = 'Pronta para brincar';
  overlay.classList.remove('hidden');
}
function updateHud() { livesEl.textContent=gameState.lives; snacksEl.textContent=gameState.snacks; bonesEl.textContent=gameState.bones; const m=Math.floor(gameState.elapsed/60); const s=Math.floor(gameState.elapsed%60); timerEl.textContent=`${m}:${String(s).padStart(2,'0')}`; }
function resize() { canvas.width=Math.max(1,canvas.clientWidth); canvas.height=Math.max(1,canvas.clientHeight); }
function input() {
  const left = Boolean(keys.ArrowLeft || keys.a);
  const right = Boolean(keys.ArrowRight || keys.d);
  const jump = Boolean(keys[' '] || keys.ArrowUp || keys.w);
  const speed = keys.Shift ? 390 : 260;

  player.vx = (right ? speed : 0) - (left ? speed : 0);
  if (right) player.face = 1;
  if (left) player.face = -1;
  if (jump && player.onGround) {
    player.vy = -680;
    player.onGround = false;
    keys[' '] = false;
    keys.ArrowUp = false;
    keys.w = false;
    playJumpBark();
  }
  if (keys.f) {
    keys.f = false;
    activateSniff();
  }
}
function rectsOverlap(a,b) { return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y; }
function isSecretVisible(item) { return !item.secretId || gameState.revealedSecrets.has(item.secretId); }
function activateSniff() {
  const unrevealed = secretRoutes.filter(route => !gameState.revealedSecrets.has(route.id));
  const target = unrevealed.sort((a,b) => Math.abs(player.x-a.x)-Math.abs(player.x-b.x))[0];
  player.sniff = 2.2;
  if (target && Math.abs(player.x - target.x) < 1100) {
    gameState.revealedSecrets.add(target.id);
    player.scentTarget = target;
    statusEl.textContent = `Faro encontrou: ${target.label}!`;
    playTone(740, .16, .022, 'sine');
    playTone(988, .2, .016, 'sine', .09);
  } else {
    player.scentTarget = { x:goalX, y:470, label:'Bandeira da fase' };
    statusEl.textContent = 'O faro aponta para a bandeira!';
  }
}
function updateMovingPlatforms() {
  platforms.forEach(platform => {
    if (platform.moving) platform.x = platform.homeX + Math.sin(animationTime * platform.speed + platform.phase) * platform.distance;
  });
}
function update(dt) {
  if(!gameState.started || gameState.ended) return; animationTime += dt; gameState.elapsed += dt; updateHud(); updateMovingPlatforms(); input(); player.invincible=Math.max(0,player.invincible-dt); const wasSniffing=player.sniff>0; player.sniff=Math.max(0,player.sniff-dt); player.vy+=world.gravity*dt;
  player.x += player.vx * dt;
  player.x = Math.max(0, Math.min(world.width - player.w, player.x));
  const oldBottom = player.y + player.h;
  player.y += player.vy * dt;
  player.onGround = false;
  for(const p of platforms) if(isSecretVisible(p)) if(player.x+player.w>p.x&&player.x<p.x+p.w&&oldBottom<=p.y&&player.y+player.h>=p.y&&player.vy>=0) { player.y=p.y-player.h; player.vy=0; player.onGround=true; }
  if(!Number.isFinite(player.x) || !Number.isFinite(player.y)) reset();
  if(player.y>world.height+80) hurt();
  enemies.forEach(e=>{e.x+=e.vx*dt;if(e.x<e.min||e.x>e.max)e.vx*=-1;if(player.invincible<=0&&rectsOverlap(player,e)) hurt();});
  collectibles=collectibles.filter(c=>{if(!isSecretVisible(c))return true;const item={x:c.x-15,y:c.y-15,w:30,h:30};if(rectsOverlap(player,item)){if(c.type==='bone')gameState.bones++;else{gameState.snacks++;playSnackSound();}updateHud();return false;}return true;});
  if(!gameState.checkpointReached && player.x>checkpointX) { gameState.checkpointReached=true;player.checkpoint=2480;statusEl.textContent='Ponto seguro alcançado!';playCheckpointSound(); }
  if(player.x>goalX) finish();
  const viewWidth = canvas.clientWidth / (canvas.clientHeight / world.height);
  const targetCamera = Math.max(0, Math.min(world.width - viewWidth, player.x - viewWidth * .35));
  camera.x += (targetCamera - camera.x) * Math.min(1, dt * 7);
  if(wasSniffing && player.sniff===0) { player.scentTarget=null; if(statusEl.textContent.includes('Faro') || statusEl.textContent.includes('bandeira')) statusEl.textContent='Explorando'; }
}
function hurt() { if(player.invincible>0)return; gameState.lives--; updateHud(); if(gameState.lives<=0) return finish(false); player.x=player.checkpoint;player.y=400;player.vx=0;player.vy=0;player.invincible=2;statusEl.textContent='Cuidado!'; }
function finish(won=true) { gameState.ended=true;stopMusic();overlayKicker.textContent=won?'BRINQUEDO ENCONTRADO':'TENTE NOVAMENTE';gameLogo.hidden=true;overlayIcon.hidden=false;overlayTitle.hidden=false;overlay.classList.remove('hidden');overlayIcon.textContent=won?'🧸':'💔';overlayTitle.textContent=won?'Você conseguiu!':'A Cacau precisa descansar';overlayText.textContent=won?`Brinquedo encontrado! ${gameState.snacks} petisco(s) e ${gameState.bones} osso(s) coletados em ${timerEl.textContent}.`:'As tentativas acabaram. Tente mais uma vez!';document.querySelector('#restart').textContent='Jogar novamente';statusEl.textContent=won?'Fase concluída':'Fim de jogo'; }

function draw() { const w=canvas.clientWidth,h=canvas.clientHeight; ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h); const scale=h/world.height; ctx.save();ctx.scale(scale,scale);ctx.translate(-camera.x,0); drawWorld(w/scale);ctx.restore(); }
function drawWorld(viewWidth) { const grad=ctx.createLinearGradient(0,0,0,720);grad.addColorStop(0,'#65ccee');grad.addColorStop(1,'#d5f6f5');ctx.fillStyle=grad;ctx.fillRect(camera.x,0,viewWidth,720); drawClouds();drawParkDecor();platforms.filter(isSecretVisible).forEach(drawPlatform);drawFlag();drawScentTrail();collectibles.filter(isSecretVisible).forEach(drawCollectible);enemies.forEach(drawEnemy);drawCheckpoint();drawFaroSign();drawPlayer(); }
function drawClouds(){ctx.fillStyle='#fff8f5aa';[180,690,1290,2010,2800,3430,4180,4820].forEach((x,i)=>{const y=95+(i%3)*72;ctx.beginPath();ctx.arc(x,y,38,0,7);ctx.arc(x+40,y-22,48,0,7);ctx.arc(x+88,y,32,0,7);ctx.fill();});ctx.fillStyle='#70c982aa';[120,680,1370,2050,2820,3550,4320,5000].forEach((x,i)=>{ctx.beginPath();ctx.arc(x,585,72,3.2,6.2);ctx.arc(x+95,570-(i%2)*18,88,3.2,6.2);ctx.arc(x+190,585,70,3.2,6.2);ctx.fill();});}
function drawParkDecor(){
  [145,740,1510,2290,3160,3980,5100].forEach((x,i)=>{ctx.fillStyle='#2d8c52';ctx.beginPath();ctx.arc(x,560,32,3.2,6.2);ctx.arc(x+36,550,38,3.2,6.2);ctx.arc(x+74,563,30,3.2,6.2);ctx.fill();ctx.fillStyle='#f28bb1';ctx.beginPath();ctx.arc(x+30,548,5,0,7);ctx.arc(x+50,563,4,0,7);ctx.fill();});
  [540,1460,2250,3130,3940,4760].forEach((x,i)=>{ctx.fillStyle='#8b5a3d';ctx.fillRect(x,470,10,116);ctx.fillStyle=i%2?'#a7d86b':'#8dcd75';ctx.beginPath();ctx.arc(x+5,445,45,0,7);ctx.arc(x-25,465,30,0,7);ctx.arc(x+38,468,30,0,7);ctx.fill();});
}
function drawPlatform(p){
  const secret = Boolean(p.secretId);
  ctx.fillStyle=secret?'#b95583':'#a95f34';ctx.fillRect(p.x,p.y,p.w,p.h);
  ctx.fillStyle=secret?'#d976a8':'#c97740';for(let y=p.y+29;y<p.y+p.h;y+=33){ctx.fillRect(p.x+7,y,p.w-14,5);}
  ctx.fillStyle='rgba(255,213,135,.28)';for(let x=p.x+20;x<p.x+p.w;x+=46){ctx.beginPath();ctx.arc(x,p.y+46+(x%3)*13,4,0,7);ctx.fill();}
  ctx.fillStyle=secret?'#9f3e70':'#3d9138';ctx.fillRect(p.x,p.y-13,p.w,18);
  ctx.fillStyle=secret?'#f28abb':'#65ba42';for(let x=p.x+2;x<=p.x+p.w-22;x+=20){ctx.beginPath();ctx.arc(x+10,p.y+2,12,0,7);ctx.fill();}
  ctx.fillStyle=secret?'#ffd3e7':'#9de45e';ctx.fillRect(p.x+4,p.y-16,p.w-8,8);
  ctx.fillStyle=secret?'#ef78ae':'#4b9e37';for(let x=p.x+8;x<p.x+p.w-8;x+=34){ctx.beginPath();ctx.moveTo(x,p.y-13);ctx.lineTo(x+4,p.y-23);ctx.lineTo(x+7,p.y-13);ctx.fill();}
}
function drawScentTrail(){
  if(!player.sniff || !player.scentTarget)return;
  const startX=player.x+player.w/2;const target=player.scentTarget;const steps=7;
  for(let i=1;i<=steps;i++){
    const progress=i/(steps+1);const x=startX+(target.x-startX)*progress;const y=535-Math.sin(progress*Math.PI)*40;
    ctx.globalAlpha=.95-i*.09;ctx.fillStyle='#f397bf';ctx.beginPath();ctx.arc(x,y+4,4.5,0,7);ctx.arc(x-4,y-2,2.3,0,7);ctx.arc(x,y-5,2.3,0,7);ctx.arc(x+4,y-2,2.3,0,7);ctx.fill();
  }
  ctx.globalAlpha=.85;ctx.strokeStyle='#ffd6e7';ctx.lineWidth=3;ctx.beginPath();ctx.arc(target.x,target.y,20+Math.sin(animationTime*8)*5,0,7);ctx.stroke();ctx.fillStyle='#fff6fb';ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.fillText(target.label,target.x,target.y-31);ctx.globalAlpha=1;
}
function drawCheckpoint(){
  const x=checkpointX;
  ctx.fillStyle='#6f422e';ctx.fillRect(x+4,486,8,104);
  if(gameState.checkpointReached){
    ctx.fillStyle='#ef76a7';ctx.beginPath();ctx.moveTo(x+12,486);ctx.lineTo(x+108,515);ctx.lineTo(x+12,546);ctx.fill();
    ctx.fillStyle='#fff5fa';ctx.font='bold 15px system-ui';ctx.textAlign='center';ctx.fillText('SALVO',x+66,521);ctx.font='18px serif';ctx.fillText('★',x+29,522);
    return;
  }
  ctx.fillStyle='#653b2a';ctx.fillRect(x-43,449,104,48);ctx.fillStyle='#d88a45';ctx.fillRect(x-39,453,96,40);
  ctx.fillStyle='#ffd76f';ctx.beginPath();ctx.arc(x-23,473,11,0,7);ctx.fill();ctx.fillStyle='#a9662d';ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.fillText('★',x-23,478);
  ctx.fillStyle='#fff8e8';ctx.font='bold 12px system-ui';ctx.fillText('MEIO DA',x+19,469);ctx.font='bold 15px system-ui';ctx.fillText('FASE',x+19,486);
}
function drawFaroSign(){
  if(gameState.revealedSecrets.has('roseira'))return;
  const x=875;
  ctx.fillStyle='#6f422e';ctx.fillRect(x-4,487,8,103);
  ctx.fillStyle='#653b2a';ctx.fillRect(x-48,452,96,46);ctx.fillStyle='#f18abb';ctx.fillRect(x-44,456,88,38);
  ctx.fillStyle='#fff3fa';ctx.beginPath();ctx.arc(x-28,476,8,0,7);ctx.arc(x-34,468,3.5,0,7);ctx.arc(x-28,465,3.5,0,7);ctx.arc(x-22,468,3.5,0,7);ctx.fill();
  ctx.fillStyle='#8d3f67';ctx.font='bold 21px system-ui';ctx.textAlign='center';ctx.fillText('F',x,480);ctx.fillStyle='#fff8ef';ctx.font='bold 12px system-ui';ctx.fillText('FARO',x+23,486);
}
function drawCollectible(c){
  ctx.save();
  const bob=Math.sin(animationTime*3+c.x*0.01)*3;
  ctx.translate(c.x,c.y+bob);
  if(c.type==='bone'){
    ctx.rotate(-0.35);
    ctx.font='30px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('🦴',0,1);
  }else{
    ctx.fillStyle='#cf7b31';ctx.beginPath();ctx.arc(-7,-3,8,0,7);ctx.arc(7,-3,8,0,7);ctx.arc(0,6,10,0,7);ctx.fill();ctx.fillStyle='#f2ae54';ctx.beginPath();ctx.arc(-7,-5,7,0,7);ctx.arc(7,-5,7,0,7);ctx.arc(0,5,9,0,7);ctx.fill();ctx.fillStyle='#a95d2c';ctx.beginPath();ctx.arc(0,2,3.5,0,7);ctx.arc(-5,-3,2.2,0,7);ctx.arc(5,-3,2.2,0,7);ctx.arc(-7,2,2.2,0,7);ctx.arc(7,2,2.2,0,7);ctx.fill();
  }
  ctx.restore();
}
function drawEnemy(e){
  ctx.save();
  ctx.translate(e.x+e.w/2,e.y+e.h/2);
  ctx.fillStyle='rgba(53,43,54,.18)';
  ctx.beginPath();ctx.ellipse(0,22,27,5,0,0,7);ctx.fill();
  if(e.type==='cat'){
    ctx.strokeStyle='#54505f';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-17,8);ctx.quadraticCurveTo(-32,4,-28,-10);ctx.stroke();
    ctx.fillStyle='#5c5968';ctx.beginPath();ctx.ellipse(0,7,22,17,0,0,7);ctx.fill();
    ctx.fillStyle='#d6cfda';ctx.beginPath();ctx.ellipse(-10,20,8,4,0,0,7);ctx.ellipse(10,20,8,4,0,0,7);ctx.fill();
    ctx.fillStyle='#44414f';ctx.beginPath();ctx.moveTo(-18,-17);ctx.lineTo(-14,-38);ctx.lineTo(-2,-22);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(18,-17);ctx.lineTo(14,-38);ctx.lineTo(2,-22);ctx.closePath();ctx.fill();
    ctx.fillStyle='#f4a5bf';ctx.beginPath();ctx.moveTo(-14,-21);ctx.lineTo(-13,-31);ctx.lineTo(-7,-22);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(14,-21);ctx.lineTo(13,-31);ctx.lineTo(7,-22);ctx.closePath();ctx.fill();
    ctx.fillStyle='#a9a4b3';ctx.beginPath();ctx.ellipse(0,-11,21,19,0,0,7);ctx.fill();
    ctx.fillStyle='#777181';ctx.fillRect(-11,-27,4,11);ctx.fillRect(7,-27,4,11);ctx.fillRect(-2,-29,4,14);
    ctx.fillStyle='#fffaf1';ctx.beginPath();ctx.ellipse(-8,-11,6,7,0,0,7);ctx.ellipse(8,-11,6,7,0,0,7);ctx.ellipse(-5,1,8,6,0,0,7);ctx.ellipse(5,1,8,6,0,0,7);ctx.fill();
    ctx.fillStyle='#40343e';ctx.beginPath();ctx.arc(-8,-11,3,0,7);ctx.arc(8,-11,3,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-9,-13,1.2,0,7);ctx.arc(7,-13,1.2,0,7);ctx.fill();
    ctx.fillStyle='#5a3d48';ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(-4,-1);ctx.lineTo(0,3);ctx.lineTo(4,-1);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#51434d';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,3);ctx.quadraticCurveTo(-4,8,-8,4);ctx.moveTo(0,3);ctx.quadraticCurveTo(4,8,8,4);ctx.moveTo(-10,1);ctx.lineTo(-23,-2);ctx.moveTo(-10,4);ctx.lineTo(-23,6);ctx.moveTo(10,1);ctx.lineTo(23,-2);ctx.moveTo(10,4);ctx.lineTo(23,6);ctx.stroke();
  }else{
    ctx.fillStyle='#7b8e51';ctx.beginPath();ctx.ellipse(-27,-3,13,10,-.45,0,7);ctx.fill();
    ctx.fillStyle='#ed9b54';ctx.beginPath();ctx.ellipse(0,2,27,17,0,0,7);ctx.fill();
    ctx.fillStyle='#f6b86b';ctx.beginPath();ctx.ellipse(-4,-2,18,10,0,0,7);ctx.fill();
    ctx.fillStyle='#626b63';ctx.fillRect(-16,-8,32,14);ctx.fillStyle='#c7d1c3';ctx.fillRect(-12,-5,24,3);
    ctx.fillStyle='#4f5860';ctx.beginPath();ctx.arc(-15,17,7,0,7);ctx.arc(15,17,7,0,7);ctx.fill();ctx.fillStyle='#b7c2bd';ctx.beginPath();ctx.arc(-15,17,3,0,7);ctx.arc(15,17,3,0,7);ctx.fill();
    ctx.fillStyle='#7e9d55';ctx.beginPath();ctx.ellipse(-33,-11,9,4,-.6,0,7);ctx.ellipse(-38,-1,8,3,.2,0,7);ctx.fill();
    ctx.fillStyle='#e6f1de';ctx.beginPath();ctx.arc(11,-1,3,0,7);ctx.fill();ctx.fillStyle='#434c4c';ctx.beginPath();ctx.arc(11,-1,1.5,0,7);ctx.fill();
    ctx.fillStyle='#cc5c69';ctx.fillRect(21,-6,5,13);
  }
  ctx.restore();
}
function drawSniffEffect() {
  const pulse = (Math.sin(animationTime * 9) + 1) / 2;
  const colors = ['#ffd4e7', '#f394be', '#ffe293'];
  for (let i = 0; i < 3; i++) {
    const x = 28 + i * 10 + pulse * (i + 1) * 2;
    const y = -12 + Math.sin(animationTime * 10 + i * 1.8) * 4 - i * 3;
    ctx.globalAlpha = .9 - i * .18;
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.arc(x, y, 4 - i * .65, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff3fa';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x + 4, y);
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x, y + 4);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function drawPlayer(){
  if(player.invincible>0&&Math.floor(player.invincible*8)%2===0)return;
  ctx.save();
  ctx.translate(player.x+player.w/2,player.y+player.h/2);
  ctx.scale(player.face,1);

  if (cacauSprite) {
    ctx.drawImage(cacauSprite, -34, -48, 67, 82);
    if(player.sniff>0) drawSniffEffect();
    ctx.restore();
    return;
  }

  // Cacau: yorkshire castanha e preta com roupa e bone rosa, inspirada na referencia.
  ctx.fillStyle='#343238';
  ctx.beginPath();ctx.ellipse(-18,5,15,10,.4,0,7);ctx.fill();
  ctx.beginPath();ctx.ellipse(-3,10,25,20,0,0,7);ctx.fill();
  ctx.fillStyle='#e7a45e';
  ctx.beginPath();ctx.ellipse(15,26,8,12,.2,0,7);ctx.ellipse(-10,27,8,11,-.2,0,7);ctx.fill();
  ctx.fillStyle='#f39ac0';
  ctx.beginPath();ctx.ellipse(-2,7,23,16,0,0,7);ctx.fill();
  ctx.fillStyle='#ffd2e3';ctx.fillRect(-17,2,28,5);
  ctx.fillStyle='#343238';
  ctx.beginPath();ctx.moveTo(-19,-14);ctx.lineTo(-24,-40);ctx.lineTo(-6,-27);ctx.moveTo(17,-14);ctx.lineTo(23,-39);ctx.lineTo(5,-27);ctx.fill();
  ctx.fillStyle='#d9914e';
  ctx.beginPath();ctx.ellipse(0,-14,23,23,0,0,7);ctx.fill();
  ctx.fillStyle='#343238';
  ctx.beginPath();ctx.ellipse(-16,-13,8,17,-.25,0,7);ctx.ellipse(16,-13,8,17,.25,0,7);ctx.fill();
  ctx.fillStyle='#f4bb75';ctx.beginPath();ctx.ellipse(4,-4,14,10,0,0,7);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-8,-17,6,0,7);ctx.arc(8,-17,6,0,7);ctx.fill();
  ctx.fillStyle='#2f2428';ctx.beginPath();ctx.arc(-8,-17,3,0,7);ctx.arc(8,-17,3,0,7);ctx.arc(8,-7,4,0,7);ctx.fill();
  ctx.strokeStyle='#4b2d31';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(6,-2);ctx.quadraticCurveTo(12,3,17,-1);ctx.stroke();
  ctx.fillStyle='#ef76a7';ctx.beginPath();ctx.ellipse(0,-39,19,9,0,0,7);ctx.fill();ctx.fillStyle='#ffd2e3';ctx.beginPath();ctx.ellipse(0,-39,11,5,0,0,7);ctx.fill();
  ctx.fillStyle='#d8477d';ctx.beginPath();ctx.arc(-7,-46,7,0,7);ctx.arc(7,-46,7,0,7);ctx.fill();
  if(player.sniff>0) drawSniffEffect();
  ctx.restore();
}
function drawFlag(){
  if (flagSprite && flagSprite.naturalWidth>0) {
    const scale=.75;
    const fw=158*scale,fh=484*scale;
    const platformTop=590;
    // The mast center is 23px from the sprite's left edge.
    ctx.drawImage(flagSprite,goalX-23*scale,platformTop-fh,fw,fh);
    return;
  }
  ctx.fillStyle='#fff';ctx.fillRect(goalX,352,8,240);ctx.fillStyle='#ef76a7';ctx.beginPath();ctx.moveTo(goalX+8,358);ctx.lineTo(goalX+152,406);ctx.lineTo(goalX+8,452);ctx.fill();ctx.fillStyle='#ffd3e4';ctx.fillRect(goalX+8,363,84,6);const px=goalX+62,py=406;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(px-13,py-13,5,7.5,-.35,0,7);ctx.ellipse(px-4,py-17,5,8,-.1,0,7);ctx.ellipse(px+5,py-17,5,8,.1,0,7);ctx.ellipse(px+13,py-13,5,7.5,.35,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(px-4,py+5,11,8,0,0,7);ctx.ellipse(px+4,py+5,10,7,0,0,7);ctx.fill();ctx.strokeStyle='#e58bb0';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(px-4,py+5,11,8,0,0,7);ctx.ellipse(px+4,py+5,10,7,0,0,7);ctx.stroke();
}
function loop(time){const dt=Math.min(.033,(time-lastTime)/1000||0);lastTime=time;update(dt);draw();requestAnimationFrame(loop);} 
document.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp',' ','a','d','w','f','Shift'].includes(e.key)||e.code==='Space'){e.preventDefault();keys[e.key]=true;if(e.code==='Space')keys[' ']=true;}});document.addEventListener('keyup',e=>{keys[e.key]=false;if(e.code==='Space')keys[' ']=false;});document.querySelectorAll('[data-key]').forEach(btn=>{const key=btn.dataset.key==='left'?'ArrowLeft':btn.dataset.key==='right'?'ArrowRight':btn.dataset.key==='jump'?' ': 'f';btn.addEventListener('pointerdown',()=>keys[key]=true);btn.addEventListener('pointerup',()=>keys[key]=false);btn.addEventListener('pointerleave',()=>keys[key]=false);});document.querySelector('#restart').addEventListener('click',()=>reset(true));document.querySelector('#credits-button').addEventListener('click',()=>creditsOverlay.classList.remove('hidden'));document.querySelector('#credits-close').addEventListener('click',()=>creditsOverlay.classList.add('hidden'));soundToggle.addEventListener('click',()=>{soundEnabled=!soundEnabled;soundToggle.textContent=soundEnabled?'Som: ligado':'Som: desligado';if(soundEnabled&&gameState.started&&!gameState.ended)startMusic();else stopMusic();});window.addEventListener('resize',resize);showStartMenu();resize();requestAnimationFrame(loop);

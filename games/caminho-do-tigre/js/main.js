const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = HEIGHT - 105;

const livesDisplay = document.getElementById('lives-display');
const scoreDisplay = document.getElementById('score-display');

const input = new InputManager();
const player = new Player(120, GROUND_Y);

function updateHud() {
  livesDisplay.textContent = '❤️'.repeat(player.lives) + '🖤'.repeat(3 - player.lives);
  scoreDisplay.textContent = String(player.score).padStart(4, '0');
}

let lastTime = performance.now();

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 1 / 30);
  lastTime = now;

  player.update(dt, input);

  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawDojoBackground(ctx, WIDTH, HEIGHT, GROUND_Y);
  player.draw(ctx);

  updateHud();

  requestAnimationFrame(loop);
}

updateHud();
requestAnimationFrame(loop);

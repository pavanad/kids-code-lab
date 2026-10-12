const GRAVITY = 1800;
const JUMP_VELOCITY = -650;
const MOVE_SPEED = 220;
const GROUND_MARGIN = 40;

class Player {
  constructor(x, groundY) {
    this.x = x;
    this.y = groundY;
    this.groundY = groundY;
    this.vy = 0;
    this.width = 100;
    this.height = 170;
    this.facing = 1;
    this.onGround = true;
    this.state = 'idle';
    this.attackTimer = 0;
    this.specialTimer = 0;
    this.attackDuration = 0.28;
    this.specialDuration = 0.55;
    this.lives = 3;
    this.score = 0;

    this.sprites = {};
    const files = {
      guard: 'guarda.png',
      attack: 'ataque.png',
      defend: 'defesa.png',
      special: 'especial.png',
      damage: 'dano.png',
    };

    Object.entries(files).forEach(([state, file]) => {
      const sprite = new Image();
      sprite.src = `assets/sprites/${file}`;
      this.sprites[state] = sprite;
    });
  }

  update(dt, input) {
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.specialTimer = Math.max(0, this.specialTimer - dt);
    const isBusy = this.attackTimer > 0 || this.specialTimer > 0;
    let moving = false;

    if (!isBusy) {
      if (input.isDown('left')) {
        this.x -= MOVE_SPEED * dt;
        this.facing = -1;
        moving = true;
      }
      if (input.isDown('right')) {
        this.x += MOVE_SPEED * dt;
        this.facing = 1;
        moving = true;
      }
      if (input.isDown('jump') && this.onGround) {
        this.vy = JUMP_VELOCITY;
        this.onGround = false;
      }
    }

    this.vy += GRAVITY * dt;
    this.y += this.vy * dt;
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
      this.onGround = true;
    }

    if (input.isDown('attack') && this.onGround && !isBusy) {
      this.attackTimer = this.attackDuration;
    } else if (input.isDown('special') && this.onGround && !isBusy) {
      this.specialTimer = this.specialDuration;
    }

    const defending = input.isDown('defend') && this.onGround && !isBusy;
    this.isDefending = defending;

    if (!this.onGround) {
      this.state = 'jump';
    } else if (this.specialTimer > 0) {
      this.state = 'special';
    } else if (this.attackTimer > 0) {
      this.state = 'attack';
    } else if (defending) {
      this.state = 'defend';
    } else if (moving) {
      this.state = 'walk';
    } else {
      this.state = 'idle';
    }

    this.x = Math.max(40, Math.min(this.x, 960 - 40 - this.width));
  }

  draw(ctx) {
    const frame = {
      attack: 'attack',
      defend: 'defend',
      special: 'special',
    }[this.state] || 'guard';
    const sprite = this.sprites[frame];
    if (!sprite.complete || !sprite.naturalWidth) return;

    const layout = {
      guard: { maxWidth: 145, maxHeight: 190, anchor: 0.5 },
      attack: { maxWidth: 245, maxHeight: 190, anchor: 0.36 },
      defend: { maxWidth: 145, maxHeight: 190, anchor: 0.5 },
      special: { maxWidth: 310, maxHeight: 195, anchor: 0.34 },
      damage: { maxWidth: 155, maxHeight: 190, anchor: 0.5 },
    }[frame];
    const scale = Math.min(layout.maxWidth / sprite.naturalWidth, layout.maxHeight / sprite.naturalHeight);
    const drawWidth = sprite.naturalWidth * scale;
    const drawHeight = sprite.naturalHeight * scale;
    const centerX = this.x + this.width / 2;

    ctx.save();
    ctx.translate(centerX, 0);
    ctx.scale(this.facing, 1);
    ctx.translate(-centerX, 0);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(centerX, this.groundY + 6, 42, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite, centerX - drawWidth * layout.anchor, this.y - drawHeight + 12, drawWidth, drawHeight);
    ctx.restore();
  }

  getHitbox() {
    return {
      x: this.x,
      y: this.y - this.height,
      width: this.width,
      height: this.height,
    };
  }
}

window.Player = Player;
window.GROUND_MARGIN = GROUND_MARGIN;

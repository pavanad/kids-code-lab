// Mapa de ações do jogo -> teclas de teclado. Facilita trocar os controles depois.
const KEY_MAP = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'jump',
  ' ': 'jump',
  z: 'attack',
  Z: 'attack',
  x: 'defend',
  X: 'defend',
  c: 'special',
  C: 'special',
};

class InputManager {
  constructor() {
    this.actions = {
      left: false,
      right: false,
      jump: false,
      attack: false,
      defend: false,
      special: false,
    };

    window.addEventListener('keydown', (e) => this._setFromKey(e.key, true));
    window.addEventListener('keyup', (e) => this._setFromKey(e.key, false));

    this._bindTouchButtons();
  }

  _setFromKey(key, isDown) {
    const action = KEY_MAP[key];
    if (!action) return;
    this.actions[action] = isDown;
  }

  _bindTouchButtons() {
    const buttons = document.querySelectorAll('.ctrl-btn[data-action]');
    buttons.forEach((btn) => {
      const action = btn.dataset.action;
      if (!(action in this.actions)) return;

      const press = (e) => {
        e.preventDefault();
        this.actions[action] = true;
        btn.classList.add('active');
      };
      const release = (e) => {
        e.preventDefault();
        this.actions[action] = false;
        btn.classList.remove('active');
      };

      btn.addEventListener('mousedown', press);
      btn.addEventListener('touchstart', press, { passive: false });
      btn.addEventListener('mouseup', release);
      btn.addEventListener('mouseleave', release);
      btn.addEventListener('touchend', release);
      btn.addEventListener('touchcancel', release);
    });
  }

  isDown(action) {
    return !!this.actions[action];
  }
}

window.InputManager = InputManager;

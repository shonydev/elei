export type AuthMode = 'login' | 'register';

export interface AuthSubmitDetail {
  mode: AuthMode;
  email: string;
  password: string;
}

/** Pantalla completa de acceso: iniciar sesión / crear cuenta. Emite `elei-auth-submit`. */
export class EleiLoginScreen extends HTMLElement {
  private mode: AuthMode = 'login';
  private form!: HTMLFormElement;
  private emailInput!: HTMLInputElement;
  private passwordInput!: HTMLInputElement;
  private heading!: HTMLElement;
  private submitBtn!: HTMLButtonElement;
  private toggleBtn!: HTMLButtonElement;
  private errorBox!: HTMLElement;

  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host {
          position: fixed; inset: 0; z-index: 3000; display: flex; align-items: center; justify-content: center;
          background: var(--bg-map, #e3e7ea); padding: 20px; font-family: inherit; color: var(--ink, #2b2b28);
        }
        form {
          width: 100%; max-width: 340px; background: var(--panel, #fff); border-radius: 18px;
          box-shadow: var(--shadow, 0 2px 10px rgba(0,0,0,.15)); padding: 24px 20px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .brand { text-align: center; font-size: 34px; line-height: 1; }
        h1 { margin: 0; font-size: 18px; text-align: center; }
        input {
          padding: 12px; border-radius: 10px; border: 1px solid var(--panel-border, #e4e1d6);
          font-size: 16px; /* 16px evita el zoom automático de iOS al enfocar */
        }
        button { border-radius: 10px; padding: 12px 14px; font-size: 15px; font-weight: 700; cursor: pointer; }
        button:disabled { opacity: .6; cursor: default; }
        .primary { background: var(--accent, #4a7c59); color: #fff; border: none; }
        .link { background: none; border: none; color: var(--accent, #4a7c59); font-size: 13px; padding: 4px; }
        #error { color: #b3261e; font-size: 13px; min-height: 16px; text-align: center; }
      </style>
      <form novalidate>
        <div class="brand">☕</div>
        <h1 id="title"></h1>
        <input id="email" type="email" placeholder="Email" autocomplete="username" required maxlength="255" />
        <input id="password" type="password" placeholder="Contraseña" required maxlength="72" />
        <div id="error" role="alert"></div>
        <button id="submit" type="submit" class="primary"></button>
        <button id="toggle" type="button" class="link"></button>
      </form>
    `;

    this.form = root.querySelector('form')!;
    this.emailInput = root.getElementById('email') as HTMLInputElement;
    this.passwordInput = root.getElementById('password') as HTMLInputElement;
    this.heading = root.getElementById('title')!;
    this.submitBtn = root.getElementById('submit') as HTMLButtonElement;
    this.toggleBtn = root.getElementById('toggle') as HTMLButtonElement;
    this.errorBox = root.getElementById('error')!;

    this.toggleBtn.addEventListener('click', () => {
      this.mode = this.mode === 'login' ? 'register' : 'login';
      this.setError('');
      this.applyMode();
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = this.emailInput.value.trim();
      const password = this.passwordInput.value;
      if (!email || !password) return this.setError('Completa email y contraseña.');
      this.dispatchEvent(
        new CustomEvent<AuthSubmitDetail>('elei-auth-submit', { detail: { mode: this.mode, email, password }, bubbles: true })
      );
    });

    this.applyMode();
  }

  private applyMode() {
    const login = this.mode === 'login';
    this.heading.textContent = login ? 'Iniciar sesión' : 'Crear cuenta';
    this.submitBtn.textContent = login ? 'Entrar' : 'Registrarme';
    this.toggleBtn.textContent = login ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión';
    this.passwordInput.autocomplete = login ? 'current-password' : 'new-password';
    this.passwordInput.placeholder = login ? 'Contraseña' : 'Contraseña (mínimo 8 caracteres)';
  }

  setError(message: string) {
    this.errorBox.textContent = message;
  }

  setBusy(busy: boolean) {
    this.submitBtn.disabled = busy;
    this.toggleBtn.disabled = busy;
  }

  /** Limpia el formulario (se llama al mostrarlo de nuevo tras cerrar sesión). */
  reset(message = '') {
    this.form.reset();
    this.mode = 'login';
    this.applyMode();
    this.setBusy(false);
    this.setError(message);
  }
}

customElements.define('elei-login-screen', EleiLoginScreen);

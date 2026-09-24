import type { User } from '../types';

const ROLE_LABEL: Record<User['role'], string> = { admin: 'Administrador', user: 'Usuario' };

/** Botón circular (arriba a la derecha) con menú: email, rol y cerrar sesión. Emite `elei-logout`. */
export class EleiUserBadge extends HTMLElement {
  private avatar!: HTMLButtonElement;
  private menu!: HTMLElement;
  private emailEl!: HTMLElement;
  private roleEl!: HTMLElement;

  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host { position: absolute; top: 14px; right: 14px; z-index: 1000; display: block; font-family: inherit; }
        #avatar {
          width: 42px; height: 42px; border-radius: 50%; border: 2px solid #fff; cursor: pointer;
          background: var(--accent, #4a7c59); color: #fff; font-size: 16px; font-weight: 700;
          box-shadow: var(--shadow, 0 2px 10px rgba(0,0,0,.15)); text-transform: uppercase;
        }
        #menu {
          position: absolute; top: 50px; right: 0; min-width: 210px; padding: 12px;
          background: var(--panel, #fff); border: 1px solid var(--panel-border, #e4e1d6); border-radius: 12px;
          box-shadow: var(--shadow, 0 2px 10px rgba(0,0,0,.15)); display: none; flex-direction: column; gap: 8px;
          color: var(--ink, #2b2b28);
        }
        #menu.open { display: flex; }
        #email { font-size: 13px; font-weight: 600; word-break: break-all; }
        #role { font-size: 12px; color: var(--ink-soft, #5c5c56); }
        #logout {
          background: #fff; color: var(--ink, #2b2b28); border: 1px solid var(--panel-border, #e4e1d6);
          border-radius: 8px; padding: 9px 12px; font-size: 13px; font-weight: 700; cursor: pointer;
        }
      </style>
      <button id="avatar" type="button" aria-label="Cuenta"></button>
      <div id="menu">
        <div id="email"></div>
        <div id="role"></div>
        <button id="logout" type="button">Cerrar sesión</button>
      </div>
    `;

    this.avatar = root.getElementById('avatar') as HTMLButtonElement;
    this.menu = root.getElementById('menu')!;
    this.emailEl = root.getElementById('email')!;
    this.roleEl = root.getElementById('role')!;

    this.avatar.addEventListener('click', (e) => {
      e.stopPropagation();
      this.menu.classList.toggle('open');
    });
    // Un click en cualquier otro lado cierra el menú.
    document.addEventListener('click', () => this.menu.classList.remove('open'));

    root.getElementById('logout')!.addEventListener('click', () => {
      this.menu.classList.remove('open');
      this.dispatchEvent(new CustomEvent('elei-logout', { bubbles: true }));
    });
  }

  set user(user: User) {
    this.avatar.textContent = user.email.charAt(0);
    this.emailEl.textContent = user.email; // textContent: el email viene del servidor, no se inyecta como HTML
    this.roleEl.textContent = ROLE_LABEL[user.role];
  }
}

customElements.define('elei-user-badge', EleiUserBadge);

export class EleiFab extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    const label = this.textContent?.trim() || 'Agregar';
    root.innerHTML = `
      <style>
        :host {
          position: absolute; left: 50%; bottom: calc(24px + env(safe-area-inset-bottom, 0px));
          transform: translateX(-50%); z-index: 1000; display: block;
        }
        button {
          background: var(--accent, #4a7c59); color: #fff; border: none; border-radius: 999px;
          padding: 13px 22px; font-size: 15px; font-weight: 700; cursor: pointer;
          box-shadow: var(--shadow, 0 2px 10px rgba(0,0,0,.15));
        }
      </style>
      <button id="btn">${label}</button>
    `;
    root.getElementById('btn')!.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('elei-fab-click', { bubbles: true }));
    });
  }
}

customElements.define('elei-fab', EleiFab);

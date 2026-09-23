export class EleiPlaceBar extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host {
          position: absolute; left: 12px; right: 12px; bottom: calc(16px + env(safe-area-inset-bottom, 0px));
          z-index: 1000; max-width: 420px; margin: 0 auto; display: block;
          background: var(--panel, #fff); border-radius: 16px;
          box-shadow: var(--shadow, 0 2px 10px rgba(0,0,0,.15)); padding: 14px 16px;
        }
        p { margin: 0 0 10px; font-size: 14px; font-weight: 600; text-align: center; color: var(--ink, #2b2b28); }
        .row { display: flex; gap: 8px; }
        button { flex: 1; border-radius: 10px; padding: 11px 14px; font-size: 14px; font-weight: 700; cursor: pointer; }
        .primary { background: var(--accent, #4a7c59); color: #fff; border: none; }
        .ghost { background: #fff; color: var(--ink, #2b2b28); border: 1px solid var(--panel-border, #e4e1d6); }
      </style>
      <p>Mueve el mapa para ubicar la cafetería</p>
      <div class="row">
        <button type="button" class="ghost" id="cancel">Cancelar</button>
        <button type="button" class="primary" id="confirm">Confirmar ubicación</button>
      </div>
    `;
    root.getElementById('cancel')!.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('elei-place-cancel', { bubbles: true }))
    );
    root.getElementById('confirm')!.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('elei-place-confirm', { bubbles: true }))
    );
  }
}

customElements.define('elei-place-bar', EleiPlaceBar);

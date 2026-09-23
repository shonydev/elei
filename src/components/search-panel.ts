export class EleiSearchPanel extends HTMLElement {
  private input!: HTMLInputElement;

  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host {
          position: absolute; top: 14px; left: 14px; z-index: 1000;
          width: 280px; max-width: 82vw;
          background: var(--panel, #fff); border: 1px solid var(--panel-border, #e4e1d6);
          border-radius: 14px; box-shadow: var(--shadow, 0 2px 10px rgba(0,0,0,.15));
          padding: 14px 16px; display: block;
          font-family: inherit;
        }
        #searchRow { display: flex; gap: 6px; margin-bottom: 6px; }
        input {
          flex: 1; padding: 8px 10px; border-radius: 8px;
          border: 1px solid var(--panel-border, #e4e1d6); font-size: 13px;
        }
        button {
          background: var(--accent, #4a7c59); color: #fff; border: none;
          border-radius: 8px; padding: 8px 12px; font-size: 13px;
          cursor: pointer; font-weight: 600;
        }
        button:hover { filter: brightness(1.08); }
        #status { font-size: 12px; color: var(--ink-soft, #5c5c56); min-height: 16px; }
      </style>
      <div id="searchRow">
        <input id="searchInput" type="text" value="Los Ángeles, Biobío, Chile" />
        <button id="searchBtn">Ir</button>
      </div>
      <div id="status"></div>
    `;

    this.input = root.getElementById('searchInput') as HTMLInputElement;
    const btn = root.getElementById('searchBtn') as HTMLButtonElement;

    const fire = () => {
      const q = this.input.value.trim();
      if (q) this.dispatchEvent(new CustomEvent('elei-search', { detail: { query: q }, bubbles: true }));
    };

    btn.addEventListener('click', fire);
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') fire();
    });
  }

  setStatus(text: string) {
    (this.shadowRoot?.getElementById('status') as HTMLElement).textContent = text;
  }
}

customElements.define('elei-search-panel', EleiSearchPanel);

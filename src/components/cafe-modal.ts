export interface CafeSubmitDetail {
  name: string;
  photo: string | null;
}

export class EleiCafeModal extends HTMLElement {
  private form!: HTMLFormElement;
  private nameInput!: HTMLInputElement;
  private photoInput!: HTMLInputElement;
  private preview!: HTMLElement;
  private pendingPhoto: string | null = null;

  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host {
          position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,.4);
          display: flex; align-items: flex-end; justify-content: center;
        }
        .sheet {
          width: 100%; max-width: 420px; background: var(--panel, #fff);
          border-radius: 18px 18px 0 0; padding: 18px 18px calc(18px + env(safe-area-inset-bottom, 0px));
          display: flex; flex-direction: column; gap: 12px; align-items: stretch;
          font-family: inherit; color: var(--ink, #2b2b28);
        }
        h2 { margin: 0; font-size: 17px; text-align: center; }
        input[type="text"] {
          padding: 11px 12px; border-radius: 10px; border: 1px solid var(--panel-border, #e4e1d6); font-size: 15px;
        }
        .photoPick { display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; }
        #photoPreview {
          width: 96px; height: 96px; border-radius: 50%; background: var(--bg-map, #e3e7ea) center / cover no-repeat;
          border: 3px solid #fff; box-shadow: var(--shadow, 0 2px 10px rgba(0,0,0,.15));
          display: flex; align-items: center; justify-content: center; font-size: 32px;
        }
        .photoPick small { color: var(--ink-soft, #5c5c56); font-size: 12px; }
        .row { display: flex; gap: 8px; }
        .row button { flex: 1; border-radius: 10px; padding: 11px 14px; font-size: 14px; font-weight: 700; cursor: pointer; }
        .primary { background: var(--accent, #4a7c59); color: #fff; border: none; }
        .ghost { background: #fff; color: var(--ink, #2b2b28); border: 1px solid var(--panel-border, #e4e1d6); }
      </style>
      <form class="sheet">
        <h2>Nueva cafetería</h2>
        <label class="photoPick" for="cafePhoto">
          <span id="photoPreview">📷</span>
          <small>Agregar foto</small>
        </label>
        <input id="cafePhoto" type="file" accept="image/*" hidden />
        <input id="cafeName" type="text" placeholder="Nombre de la cafetería" required maxlength="60" />
        <div class="row">
          <button type="button" class="ghost" id="cancel">Cancelar</button>
          <button type="submit" class="primary">Guardar</button>
        </div>
      </form>
    `;

    this.form = root.querySelector('form')!;
    this.nameInput = root.getElementById('cafeName') as HTMLInputElement;
    this.photoInput = root.getElementById('cafePhoto') as HTMLInputElement;
    this.preview = root.getElementById('photoPreview')!;

    root.getElementById('cancel')!.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('elei-cafe-cancel', { bubbles: true }));
    });

    this.photoInput.addEventListener('change', () => this.handlePhotoChange());

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = this.nameInput.value.trim();
      if (!name) return;
      this.dispatchEvent(
        new CustomEvent<CafeSubmitDetail>('elei-cafe-submit', {
          detail: { name, photo: this.pendingPhoto },
          bubbles: true
        })
      );
    });
  }

  /** Reinicia el formulario y lo muestra. Llamar antes de setear `hidden = false`. */
  open() {
    this.form.reset();
    this.pendingPhoto = null;
    this.preview.style.backgroundImage = '';
    this.preview.textContent = '📷';
    this.nameInput.focus();
  }

  // Recorta la foto a cuadrado y la reduce (160px) para que pese poco.
  private toThumb(file: File, size = 160): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const s = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        canvas
          .getContext('2d')!
          .drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('imagen inválida'));
      };
      img.src = url;
    });
  }

  private async handlePhotoChange() {
    const file = this.photoInput.files?.[0];
    if (!file) return;
    try {
      this.pendingPhoto = await this.toThumb(file);
      this.preview.style.backgroundImage = `url(${this.pendingPhoto})`;
      this.preview.textContent = '';
    } catch {
      this.pendingPhoto = null;
      alert('No pude leer esa imagen.');
    }
  }
}

customElements.define('elei-cafe-modal', EleiCafeModal);

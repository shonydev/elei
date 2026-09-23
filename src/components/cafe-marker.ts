import type { Cafe } from '../types';

/**
 * Elemento del marcador que se le pasa a `new maplibregl.Marker({ element })`.
 * No usa Shadow DOM: MapLibre necesita medir/posicionar el elemento directamente
 * y las clases (.cafeMarker, .cafeMarkerImg) ya están definidas en styles/global.css.
 */
export class EleiCafeMarker extends HTMLElement {
  private _cafe!: Cafe;

  set cafe(value: Cafe) {
    this._cafe = value;
    this.render();
  }
  get cafe(): Cafe {
    return this._cafe;
  }

  private render() {
    this.className = 'cafeMarker';
    this.innerHTML = '';

    const img = document.createElement('div');
    img.className = 'cafeMarkerImg';
    if (this._cafe.photo) img.style.backgroundImage = `url(${this._cafe.photo})`;
    else img.textContent = '☕';
    this.appendChild(img);
  }

  /** Contenido del popup asociado (creado aparte porque vive en el DOM del Popup, no en el marcador). */
  createPopupContent(): HTMLElement {
    const box = document.createElement('div');
    box.className = 'cafePopup';

    const title = document.createElement('strong');
    title.textContent = this._cafe.name; // textContent: evita inyectar HTML

    const del = document.createElement('button');
    del.textContent = 'Eliminar';
    del.addEventListener('click', () => {
      if (!confirm(`¿Eliminar "${this._cafe.name}"?`)) return;
      this.dispatchEvent(new CustomEvent('elei-cafe-delete', { detail: { id: this._cafe.id }, bubbles: true }));
    });

    box.append(title, del);
    return box;
  }
}

customElements.define('elei-cafe-marker', EleiCafeMarker);

// Agregar cafeterías: pin fijo al centro (estilo Uber) + marcador con foto circular.
// Por ahora se guardan en localStorage. Todo el acceso a datos está en `store`,
// para cambiarlo luego por llamadas a un backend sin tocar el resto.
(() => {
    const STORAGE_KEY = 'elei.cafes';

    const store = {
        list() {
            try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
            catch { return []; }
        },
        add(cafe) {
            const all = store.list();
            all.push(cafe);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        },
        remove(id) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(store.list().filter(c => c.id !== id)));
        }
    };

    const $ = id => document.getElementById(id);
    const addBtn = $('addCafeBtn'), pin = $('centerPin'), bar = $('placeBar');
    const modal = $('cafeModal'), form = $('cafeForm');
    const nameInput = $('cafeName'), photoInput = $('cafePhoto'), preview = $('photoPreview');

    let placing = false;
    let pending = null;      // { lng, lat } elegido con el pin
    let pendingPhoto = null; // dataURL de la foto
    const markers = new Map();

    // ---------- Marcadores ----------
    function renderCafe(cafe) {
        const el = document.createElement('div');
        el.className = 'cafeMarker';
        const img = document.createElement('div');
        img.className = 'cafeMarkerImg';
        if (cafe.photo) img.style.backgroundImage = `url(${cafe.photo})`;
        else img.textContent = '☕';
        el.appendChild(img);

        const box = document.createElement('div');
        box.className = 'cafePopup';
        const title = document.createElement('strong');
        title.textContent = cafe.name; // textContent: evita inyectar HTML
        const del = document.createElement('button');
        del.textContent = 'Eliminar';
        box.append(title, del);

        const popup = new maplibregl.Popup({ offset: [0, -60], closeButton: false }).setDOMContent(box);
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([cafe.lng, cafe.lat])
            .setPopup(popup)
            .addTo(map);

        del.addEventListener('click', () => {
            if (!confirm(`¿Eliminar "${cafe.name}"?`)) return;
            store.remove(cafe.id);
            marker.remove();
            markers.delete(cafe.id);
        });
        markers.set(cafe.id, marker);
    }

    // ---------- Modo "ubicar" ----------
    function startPlacing() {
        placing = true;
        pin.hidden = false;
        bar.hidden = false;
        addBtn.hidden = true;
    }
    function stopPlacing() {
        placing = false;
        pin.hidden = true;
        bar.hidden = true;
        addBtn.hidden = false;
    }

    map.on('movestart', () => placing && pin.classList.add('lifted'));
    map.on('moveend', () => pin.classList.remove('lifted'));

    addBtn.addEventListener('click', startPlacing);
    $('placeCancel').addEventListener('click', stopPlacing);

    $('placeConfirm').addEventListener('click', () => {
        const c = map.getCenter(); // el pin apunta exactamente al centro del mapa
        pending = { lng: c.lng, lat: c.lat };
        stopPlacing();
        openForm();
    });

    // ---------- Formulario ----------
    function openForm() {
        form.reset();
        pendingPhoto = null;
        preview.style.backgroundImage = '';
        preview.textContent = '📷';
        modal.hidden = false;
        nameInput.focus();
    }
    function closeForm() {
        modal.hidden = true;
        pending = null;
    }
    $('cafeCancel').addEventListener('click', closeForm);

    // Recorta la foto a cuadrado y la reduce (160px) para que pese poco
    function toThumb(file, size = 160) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                const s = Math.min(img.width, img.height);
                const canvas = document.createElement('canvas');
                canvas.width = canvas.height = size;
                canvas.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
                URL.revokeObjectURL(url);
                resolve(canvas.toDataURL('image/jpeg', 0.82));
            };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('imagen inválida')); };
            img.src = url;
        });
    }

    photoInput.addEventListener('change', async () => {
        const file = photoInput.files[0];
        if (!file) return;
        try {
            pendingPhoto = await toThumb(file);
            preview.style.backgroundImage = `url(${pendingPhoto})`;
            preview.textContent = '';
        } catch {
            pendingPhoto = null;
            alert('No pude leer esa imagen.');
        }
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        if (!pending) return;
        const cafe = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            name: nameInput.value.trim(),
            lng: pending.lng,
            lat: pending.lat,
            photo: pendingPhoto
        };
        if (!cafe.name) return;
        try {
            store.add(cafe);
        } catch {
            alert('No se pudo guardar (almacenamiento lleno).');
            return;
        }
        renderCafe(cafe);
        closeForm();
    });

    // ---------- Carga inicial ----------
    store.list().forEach(renderCafe);
})();

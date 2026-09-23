/**
 * Recorta una imagen a un cuadrado centrado y la reduce a `size`x`size` px,
 * devolviendo un dataURL JPEG liviano.
 *
 * Vive en `utils/` (y no en `cafe-modal.ts`) porque es un algoritmo puro de
 * procesamiento de imagen: no sabe nada de formularios ni de cafeterías, y
 * cualquier otro componente que necesite una miniatura puede reusarlo.
 */
export function createSquareThumbnail(file: File, size = 160): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const thumbnail = drawCenteredSquare(img, size);
      URL.revokeObjectURL(objectUrl);
      resolve(thumbnail);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('imagen inválida'));
    };
    img.src = objectUrl;
  });
}

/** Dibuja el recorte central cuadrado de `img` en un canvas y lo codifica a JPEG. */
function drawCenteredSquare(img: HTMLImageElement, size: number): string {
  const cropSize = Math.min(img.width, img.height);
  const offsetX = (img.width - cropSize) / 2;
  const offsetY = (img.height - cropSize) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  canvas.getContext('2d')!.drawImage(img, offsetX, offsetY, cropSize, cropSize, 0, 0, size, size);

  return canvas.toDataURL('image/jpeg', 0.82);
}

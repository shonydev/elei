/**
 * Helper to resize and crop user-uploaded images to square dimensions
 * for circular markers and optimal localStorage storage.
 */
export async function processImageToSquare(file: File, maxSize: number = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const minDim = Math.min(img.width, img.height);
        
        // Calculate square crop coordinates (centered)
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        
        const finalSize = Math.min(minDim, maxSize);
        canvas.width = finalSize;
        canvas.height = finalSize;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, finalSize, finalSize);
        
        // Convert to webp/jpeg data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

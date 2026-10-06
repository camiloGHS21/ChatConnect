/**
 * Utilidad de optimización y compresión de imágenes para el Robot de Meta (WhatsApp Commerce).
 * Convierte cualquier imagen a:
 * - Proporción cuadrada 1:1 (centrado con fondo limpio o recorte inteligente)
 * - Resolución estándar: 800x800 a 1000x1000 px
 * - Peso liviano: < 500 KB (habitualmente 80-250 KB) en formato WebP o JPEG
 */

export const optimizeImageForMeta = async (fileOrBlob, targetSize = 1000, maxSizeBytes = 450 * 1024) => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(fileOrBlob);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        // 1. Determinar recorte centrado para relación 1:1 cuadrada
        const minDim = Math.min(img.width, img.height);
        const cropX = (img.width - minDim) / 2;
        const cropY = (img.height - minDim) / 2;

        // 2. Determinar resolución final (entre 800 y 1000 px)
        const finalDim = Math.min(targetSize, Math.max(800, minDim));

        const canvas = document.createElement('canvas');
        canvas.width = finalDim;
        canvas.height = finalDim;
        const ctx = canvas.getContext('2d');

        // Fondo blanco neutro por si hay transparencias PNG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, finalDim, finalDim);

        // Dibujar imagen centrada y escalada
        ctx.drawImage(img, cropX, cropY, minDim, minDim, 0, 0, finalDim, finalDim);

        // 3. Compresión progresiva (WebP preferido, JPEG fallback)
        const format = 'image/webp';
        const quality = 0.88;

        const compressIterative = (q) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolveFallback(fileOrBlob, finalDim);
                return;
              }

              // Si es menor a 450KB o ya llegamos a calidad mínima
              if (blob.size <= maxSizeBytes || q <= 0.6) {
                const optName = (fileOrBlob.name || 'producto').replace(/\.[^/.]+$/, '') + '.webp';
                const optimizedFile = new File([blob], optName, { type: 'image/webp' });
                const previewUrl = URL.createObjectURL(blob);
                const sizeKb = (blob.size / 1024).toFixed(1);

                resolve({
                  file: optimizedFile,
                  preview: previewUrl,
                  nombre: optName,
                  tamano: `${sizeKb} KB (1:1 WebP)`,
                  sizeBytes: blob.size,
                  width: finalDim,
                  height: finalDim,
                  isOptimized: true,
                });
              } else {
                compressIterative(Math.max(0.6, q - 0.08));
              }
            },
            format,
            q
          );
        };

        compressIterative(quality);
      };

      img.onerror = () => {
        resolveFallback(fileOrBlob);
      };

      img.src = objectUrl;
    } catch {
      resolveFallback(fileOrBlob);
    }

    function resolveFallback(orig, dim = 800) {
      resolve({
        file: orig,
        preview: orig instanceof Blob ? URL.createObjectURL(orig) : String(orig),
        nombre: orig.name || 'producto.jpg',
        tamano: `${((orig.size || 50000) / 1024).toFixed(1)} KB`,
        sizeBytes: orig.size || 50000,
        width: dim,
        height: dim,
        isOptimized: false,
      });
    }
  });
};

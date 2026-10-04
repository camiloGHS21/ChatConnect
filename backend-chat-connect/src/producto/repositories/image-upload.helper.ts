import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const logger = new Logger('ImageUploadHelper');

/**
 * Resuelve cualquier URL local de assets o base64 a una URL pública CDN permanente para Meta.
 */
export async function resolverUrlPublicaImagen(urlOPath?: string | null): Promise<string> {
  if (!urlOPath || !urlOPath.trim()) {
    return 'https://iili.io/nYj72us.jpg';
  }

  const trimmed = urlOPath.trim();

  // 1. Si ya es una URL pública HTTPS válida (que no sea localhost, dummy example.com ni Unsplash genérico)
  if (
    /^https?:\/\//i.test(trimmed) &&
    !trimmed.includes('localhost') &&
    !trimmed.includes('127.0.0.1') &&
    !trimmed.includes('example.com') &&
    !trimmed.includes('cdn.example.com') &&
    !trimmed.includes('photo-1581235720704') &&
    !trimmed.includes('photo-1533473359331')
  ) {
    return trimmed;
  }

  try {
    let fileBuffer: Buffer | null = null;
    let fileName = 'producto.png';
    let mimeType = 'image/png';

    // 2. Si es formato base64
    if (trimmed.startsWith('data:image/')) {
      const parts = trimmed.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch) mimeType = mimeMatch[1];
      fileBuffer = Buffer.from(parts[1], 'base64');
      fileName = `upload_${Date.now()}.${mimeType.split('/')[1] || 'png'}`;
    } else {
      // 3. Es ruta local de assets o relativa
      const cleanPath = trimmed.replace(/^\//, '');
      const possiblePaths = [
        path.resolve('c:/Users/Administrator/Desktop/crm-whatssap-practica', cleanPath),
        path.resolve(process.cwd(), '..', cleanPath),
        path.resolve(process.cwd(), cleanPath),
        path.resolve('c:/Users/Administrator/Desktop/crm-whatssap-practica/src/assets/images/products', path.basename(cleanPath)),
      ];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          fileBuffer = fs.readFileSync(p);
          fileName = path.basename(p);
          if (p.endsWith('.jpg') || p.endsWith('.jpeg')) mimeType = 'image/jpeg';
          else if (p.endsWith('.webp')) mimeType = 'image/webp';
          break;
        }
      }
    }

    if (fileBuffer) {
      const form = new FormData();
      form.append('key', '6d207e02198a847aa98d0a2a901485a5');
      form.append('action', 'upload');
      form.append('format', 'json');
      form.append('source', new Blob([fileBuffer as any], { type: mimeType }), fileName);

      const uploadRes = await fetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        body: form,
      });
      const uploadData: any = await uploadRes.json();
      if (uploadData?.image?.url) {
        logger.log(`✓ [MetaImages] Imagen local "${fileName}" subida a CDN permanente: ${uploadData.image.url}`);
        return uploadData.image.url;
      }
    }
  } catch (err: any) {
    logger.warn(`[MetaCatalog] Advertencia resolviendo URL de imagen pública: ${err.message}`);
  }

  return 'https://iili.io/nYj72us.jpg';
}

import React, { useState } from 'react';
import DropzoneGalleryCard from '@/components/producto/gallery/DropzoneGalleryCard';
import GalleryImagesGrid from '@/components/producto/gallery/GalleryImagesGrid';
import { optimizeImageForMeta } from '@/utils/imageOptimizer';

const FinishAndGalleryForm = ({
  formData,
  updateField,
  triggerDeleteConfirm,
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleFilesFromDropzone = async (acceptedFiles) => {
    if (!acceptedFiles || !acceptedFiles.length) return;
    setIsOptimizing(true);
    try {
      const currentImages = formData.imagenes || [];
      const optimizedResults = await Promise.all(
        acceptedFiles.map((f) => optimizeImageForMeta(f, 1000, 450 * 1024))
      );
      const newImages = optimizedResults.map((opt, idx) => ({
        id: Date.now() + idx,
        url: opt.preview,
        file: opt.file,
        nombre: opt.nombre,
        tamano: opt.tamano,
        principal: currentImages.length === 0 && idx === 0,
        orden: currentImages.length + idx + 1,
      }));
      updateField('imagenes', [...currentImages, ...newImages]);
    } catch {
      // Fallback si ocurre algún error en canvas
      const currentImages = formData.imagenes || [];
      const fallback = acceptedFiles.map((file, idx) => ({
        id: Date.now() + idx,
        url: file.preview || (file instanceof Blob ? URL.createObjectURL(file) : 'https://iili.io/nYj72us.jpg'),
        nombre: file.name || `imagen_${Date.now()}.png`,
        tamano: `${((file.size || 60000) / 1024).toFixed(1)} KB`,
        principal: currentImages.length === 0 && idx === 0,
        orden: currentImages.length + idx + 1,
      }));
      updateField('imagenes', [...currentImages, ...fallback]);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAddSampleImage = (sample) => {
    const currentImages = formData.imagenes || [];
    const newImage = {
      id: Date.now(),
      url: sample.url,
      nombre: sample.name,
      tamano: '120 KB (1:1 WebP)',
      principal: currentImages.length === 0,
      orden: currentImages.length + 1,
    };
    updateField('imagenes', [...currentImages, newImage]);
  };

  const handleSetPrincipalImage = (id) => {
    const updated = (formData.imagenes || []).map((img) => ({
      ...img,
      principal: img.id === id,
    }));
    updateField('imagenes', updated);
  };

  const handleRemoveImage = (id) => {
    const updated = (formData.imagenes || []).filter((img) => img.id !== id);
    if (updated.length > 0 && !updated.some((img) => img.principal)) {
      updated[0].principal = true;
    }
    updateField('imagenes', updated);
  };

  const handleUpdateImageOrder = (id, newOrder) => {
    const updated = (formData.imagenes || []).map((img) => {
      if (img.id === id) {
        return { ...img, orden: parseInt(newOrder) || 1 };
      }
      return img;
    });
    updateField('imagenes', updated);
  };

  return (
    <div className="product-finish-gallery-form">
      <div className="mb-3">
        <h5 className="card-title mb-1">Galería de Imágenes</h5>
        <p className="text-muted fs-14 mb-0">
          Sube las imágenes del producto con Dropzone y define la foto principal del catálogo
        </p>
      </div>

      <DropzoneGalleryCard
        onFileUpload={handleFilesFromDropzone}
        onAddSample={handleAddSampleImage}
        isOptimizing={isOptimizing}
      />

      <GalleryImagesGrid
        imagenes={formData.imagenes || []}
        onSetPrincipal={handleSetPrincipalImage}
        onRemoveImage={handleRemoveImage}
        onUpdateOrder={handleUpdateImageOrder}
        triggerDeleteConfirm={triggerDeleteConfirm}
      />
    </div>
  );
};

export default FinishAndGalleryForm;

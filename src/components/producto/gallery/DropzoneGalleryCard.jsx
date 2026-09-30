import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import DropzoneFormInput from '@/components/form/DropzoneFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const sampleImages = [
  { name: 'taladro_amarillo.jpg', url: 'https://iili.io/nYj72us.jpg' },
  { name: 'taladro_negro.jpg', url: 'https://iili.io/nYj7fn4.jpg' },
];

const DropzoneGalleryCard = ({ onFileUpload, onAddSample, isOptimizing }) => {
  return (
    <Card className="border shadow-none mb-3 bg-light-subtle rounded-3">
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="fs-14 fw-bold text-dark mb-0">Galería de Imágenes del Producto</label>
          <Badge bg="success-subtle" className="text-success border border-success-subtle fs-11 d-flex align-items-center gap-1">
            <IconifyIcon icon="bx:check-shield" />
            Optimizado para Robot de Meta (1:1, &lt; 500 KB)
          </Badge>
        </div>

        <DropzoneFormInput
          iconProps={{
            icon: isOptimizing ? 'bx:loader-alt' : 'bx:cloud-upload',
            height: 44,
            width: 44,
            className: `text-primary mb-2 ${isOptimizing ? 'bx-spin' : ''}`,
          }}
          text={isOptimizing ? 'Optimizando imágenes para Meta (1:1 cuadrado, &lt; 500 KB)...' : 'Arrastra imágenes aquí o haz clic para buscar'}
          helpText={
            <span className="text-muted fs-12 d-block mt-1">
              ✨ Se redimensionan automáticamente a proporción <strong>1:1 cuadrada (1000x1000 px)</strong> y se comprimen en <strong>WebP (&lt; 500 KB)</strong> para aprobación ultra-rápida en WhatsApp.
            </span>
          }
          showPreview={false}
          onFileUpload={onFileUpload}
        />

        <div className="mt-3 pt-2 border-top d-flex align-items-center justify-content-center gap-2 flex-wrap">
          <span className="text-muted fs-12">O agrega una imagen de demostración del sistema:</span>
          {sampleImages.map((s, i) => (
            <Button
              key={i}
              variant="outline-secondary"
              size="sm"
              className="fs-11 py-0 px-2"
              onClick={() => onAddSample(s)}
            >
              <IconifyIcon icon="bx:image-add" className="me-1" />
              {s.name}
            </Button>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default DropzoneGalleryCard;

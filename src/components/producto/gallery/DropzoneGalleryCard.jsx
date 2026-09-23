import React from 'react';
import { Card, Button } from 'react-bootstrap';
import DropzoneFormInput from '@/components/form/DropzoneFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const sampleImages = [
  { name: 'product-1(1).png', url: '/src/assets/images/products/product-1(1).png' },
  { name: 'product-1(2).png', url: '/src/assets/images/products/product-1(2).png' },
  { name: 'product-2.png', url: '/src/assets/images/products/product-2.png' },
  { name: 'product-3.png', url: '/src/assets/images/products/product-3.png' },
];

const DropzoneGalleryCard = ({ onFileUpload, onAddSample }) => {
  return (
    <Card className="border shadow-none mb-3 bg-light-subtle rounded-3">
      <Card.Body className="p-3">
        <DropzoneFormInput
          label="Galería de Imágenes del Producto"
          labelClassName="fs-14 fw-bold mb-2 text-dark"
          iconProps={{
            icon: 'bx:cloud-upload',
            height: 48,
            width: 48,
            className: 'text-primary mb-2',
          }}
          text="Arrastra las imágenes aquí o haz clic para buscar"
          helpText={
            <span className="text-muted fs-13">
              Formatos soportados: PNG, JPG, WEBP. Las imágenes se cargarán y podrás elegir la principal abajo.
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

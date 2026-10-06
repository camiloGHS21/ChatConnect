import { useState } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import SeoInputsCard from '@/components/producto/metadata/SeoInputsCard';
import SeoTargetAiCard from '@/components/producto/metadata/SeoTargetAiCard';
import ProductSummaryCard from '@/components/producto/metadata/ProductSummaryCard';

/**
 * Paso 5: Optimización SEO y Metadatos para Inteligencia Artificial.
 * Idéntico al diseño del template Reback y a la captura de pantalla oficial.
 */
const MetaDataForm = ({
  control,
  formData,
  updateField,
  setValue,
  catalogs = {},
}) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleGenerateWithAI = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      const prodName = formData?.nombre || 'Producto';
      const cleanSlug = prodName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const newTitle = `${prodName} | Tienda Oficial`;
      const newSlug = `/productos/${cleanSlug}`;
      const newDesc = `Compra ${prodName} con amortiguación de alta calidad. Envíos a todo el país y pago contraentrega.`;
      const newKeywords = `${prodName.toLowerCase()}, correr, calzado deportivo, zapatillas nike, tenis deportivos`;
      const newSynonyms = 'tenis deportivos, zapatillas para correr, calzado para correr';

      updateField('titulo_seo', newTitle);
      updateField('slug', newSlug);
      updateField('descripcion_seo', newDesc);
      updateField('palabras_clave', newKeywords);
      updateField('sinonimos', newSynonyms);

      if (setValue) {
        setValue('titulo_seo', newTitle);
        setValue('slug', newSlug);
        setValue('descripcion_seo', newDesc);
        setValue('palabras_clave', newKeywords);
        setValue('sinonimos', newSynonyms);
      }

      const merged = Array.from(new Set([...(formData?.etiquetas || []), 'Correr', 'Hombre', 'Nueva Colección', 'Tendencia']));
      updateField('etiquetas', merged);
      if (setValue) setValue('etiquetas', merged);

      setIsGeneratingAI(false);
    }, 500);
  };

  return (
    <div className="product-metadata-form">
      <div className="d-flex align-items-center justify-content-between mb-3 pb-2">
        <div>
          <h5 className="card-title mb-1">Metadatos del producto</h5>
          <p className="text-muted fs-14 mb-0">
            Optimización para motores de búsqueda (SEO), palabras clave, catálogo y sugerencias inteligentes
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleGenerateWithAI}
          disabled={isGeneratingAI}
          className="d-flex align-items-center shadow-sm"
        >
          {isGeneratingAI ? (
            <>
              <Spinner size="sm" animation="border" className="me-1" />
              Generando con IA...
            </>
          ) : (
            <>
              <IconifyIcon icon="bx:sparkles" className="me-1 fs-16" />
              Optimizar con IA
            </>
          )}
        </Button>
      </div>

      <Card className="border shadow-none mb-3 bg-light-subtle rounded-3">
        <Card.Body className="p-3">
          <SeoInputsCard
            control={control}
            formData={formData}
            updateField={updateField}
            setValue={setValue}
          />

          <SeoTargetAiCard
            control={control}
            formData={formData}
            updateField={updateField}
            setValue={setValue}
          />
        </Card.Body>
      </Card>

      <ProductSummaryCard
        formData={formData}
        catalogs={catalogs}
      />
    </div>
  );
};

export default MetaDataForm;

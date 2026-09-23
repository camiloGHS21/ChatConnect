import React from 'react';
import GeneralDetailsForm from '@/pages/catalogo/crear-producto/components/GeneralDetailsForm';
import PricingCostsForm from '@/pages/catalogo/crear-producto/components/PricingCostsForm';
import InventoryCodesForm from '@/pages/catalogo/crear-producto/components/InventoryCodesForm';
import FinishAndGalleryForm from '@/pages/catalogo/crear-producto/components/FinishAndGalleryForm';
import MetaDataForm from '@/pages/catalogo/crear-producto/components/MetaDataForm';

/**
 * Generador de los 5 pasos oficiales del Asistente Reback
 */
export const buildProductWizardSteps = ({
  productData,
  updateField,
  catalogs,
  setCatalogs,
  triggerDeleteConfirm,
  control,
  setValue,
  onGenerateCode,
}) => [
  {
    index: 1,
    name: 'Descripción',
    icon: 'bxs:detail',
    tab: (
      <GeneralDetailsForm
        formData={productData}
        updateField={updateField}
        catalogs={catalogs}
        setCatalogs={setCatalogs}
        onGenerateCode={onGenerateCode}
      />
    ),
  },
  {
    index: 2,
    name: 'Impuestos',
    icon: 'bxs:dollar-circle',
    tab: (
      <PricingCostsForm
        formData={productData}
        updateField={updateField}
        catalogs={catalogs}
        triggerDeleteConfirm={triggerDeleteConfirm}
      />
    ),
  },
  {
    index: 3,
    name: 'Inventario',
    icon: 'bxs:package',
    tab: (
      <InventoryCodesForm
        formData={productData}
        updateField={updateField}
        catalogs={catalogs}
        triggerDeleteConfirm={triggerDeleteConfirm}
      />
    ),
  },
  {
    index: 4,
    name: 'Imágenes',
    icon: 'bx:images',
    tab: (
      <FinishAndGalleryForm
        formData={productData}
        updateField={updateField}
        triggerDeleteConfirm={triggerDeleteConfirm}
      />
    ),
  },
  {
    index: 5,
    name: 'Metadata',
    icon: 'bxs:brain',
    tab: (
      <MetaDataForm
        control={control}
        formData={productData}
        updateField={updateField}
        setValue={setValue}
        catalogs={catalogs}
      />
    ),
  },
];

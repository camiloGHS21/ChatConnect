import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import FullPageLoader from '@/components/FullPageLoader';
import WizardTabsHeader from '@/components/producto/wizard/WizardTabsHeader';
import WizardNavigation from '@/components/producto/wizard/WizardNavigation';
import { buildProductWizardSteps } from '@/components/producto/wizard/buildProductWizardSteps';
import { getInitialProductState } from '@/components/producto/wizard/initialProductState';
import { validateStep } from '@/components/producto/wizard/productValidation';
import useProductCatalogs from '@/components/producto/wizard/useProductCatalogs';
import useProductSaveHandler from '@/components/producto/wizard/useProductSaveHandler';
import productoService from '@/services/productoService';
import ProductSubmittedForm from './ProductSubmittedForm';

/**
 * Asistente de Creación y Edición de Producto (5 Pasos Oficiales Reback)
 * Con soporte para edición y actualización diferencial en Meta WhatsApp.
 */
const CreateProductForms = ({ productId }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [productData, setProductData] = useState(() => getInitialProductState());
  const [validationErrors, setValidationErrors] = useState({});
  const [stepError, setStepError] = useState('');
  const [deleteModalConfig, setDeleteModalConfig] = useState({ show: false });

  const { control, setValue, reset } = useForm({ defaultValues: productData, mode: 'onChange' });

  const updateField = (name, val) => {
    setValue(name, val, { shouldValidate: true, shouldDirty: true });
    setProductData(prev => ({ ...prev, [name]: val }));
    if (validationErrors[name]) {
      setValidationErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
      setStepError('');
    }
  };

  const { catalogs, setCatalogs } = useProductCatalogs(updateField);

  const {
    isSubmitted,
    isSaving,
    isLoadingProduct,
    saveError,
    handleSaveProduct,
    handleResetForm,
  } = useProductSaveHandler({
    productId,
    productData,
    setProductData,
    reset,
    setActiveStep,
    setValidationErrors,
    setStepError,
  });

  const handleNext = () => {
    const val = validateStep(activeStep, productData);
    if (!val.isValid) { setValidationErrors(val.errors); setStepError(val.message); return; }
    setValidationErrors({}); setStepError('');
    setActiveStep(prev => Math.min(5, prev + 1));
  };

  const handleTabSelect = (stepNum) => {
    const target = Number(stepNum);
    if (target > activeStep) {
      const val = validateStep(activeStep, productData);
      if (!val.isValid) { setValidationErrors(val.errors); setStepError(val.message); return; }
    }
    setValidationErrors({}); setStepError('');
    setActiveStep(target);
  };

  const formSteps = buildProductWizardSteps({
    productData,
    updateField,
    catalogs,
    setCatalogs,
    triggerDeleteConfirm: cfg => setDeleteModalConfig({ show: true, ...cfg }),
    control,
    setValue,
    errors: validationErrors,
    onGenerateCode: async () => {
      const c = await productoService.getSiguienteCodigo(1);
      if (c) updateField('codigo_interno', c);
    },
  });

  if (isSubmitted) {
    return (
      <ProductSubmittedForm
        productData={productData}
        onCreateAnother={productId ? null : handleResetForm}
        isEditing={!!productId}
      />
    );
  }

  return (
    <>
      <FullPageLoader
        show={isSaving || isLoadingProduct}
        title={isLoadingProduct ? 'Cargando producto...' : productId ? 'Actualizando producto...' : 'Subiendo producto...'}
        message={
          isLoadingProduct
            ? 'Cargando datos desde la base de datos...'
            : productId
            ? 'Guardando cambios en PostgreSQL y actualizando en WhatsApp Meta solo lo que cambió...'
            : 'Guardando en la base de datos y publicando en el catálogo de Meta WhatsApp...'
        }
        badge="Meta WhatsApp Sync"
      />
      {stepError && (
        <div className="alert alert-warning py-2 px-3 fs-13 mb-3 d-flex align-items-center shadow-sm">
          <i className="bx bx-error-circle fs-18 me-2 text-warning" />
          <div className="flex-grow-1"><strong>Atención:</strong> {stepError}</div>
          <button type="button" className="btn-close fs-11" onClick={() => setStepError('')} />
        </div>
      )}
      {saveError && <div className="alert alert-danger py-2 fs-13 mb-3">{saveError}</div>}
      <WizardTabsHeader formSteps={formSteps} activeStep={activeStep} setActiveStep={handleTabSelect} />
      <WizardNavigation
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        onNext={handleNext}
        onPrev={() => { setStepError(''); setActiveStep(prev => Math.max(1, prev - 1)); }}
        totalSteps={formSteps.length}
        stepName={formSteps[activeStep - 1]?.name}
        onSave={handleSaveProduct}
        isSaving={isSaving}
        saveButtonText={productId ? 'Guardar Cambios' : 'Guardar y Crear Producto'}
      />
      <DeleteConfirmationModal
        show={deleteModalConfig.show}
        onHide={() => setDeleteModalConfig(p => ({ ...p, show: false }))}
        onConfirm={() => { if (deleteModalConfig.onConfirm) deleteModalConfig.onConfirm(); setDeleteModalConfig(p => ({ ...p, show: false })); }}
        {...deleteModalConfig}
      />
    </>
  );
};

export default CreateProductForms;
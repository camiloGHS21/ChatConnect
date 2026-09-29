import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import FullPageLoader from '@/components/FullPageLoader';
import WizardTabsHeader from '@/components/producto/wizard/WizardTabsHeader';
import WizardNavigation from '@/components/producto/wizard/WizardNavigation';
import { buildProductWizardSteps } from '@/components/producto/wizard/buildProductWizardSteps';
import { getInitialProductState } from '@/components/producto/wizard/initialProductState';
import { validateStep, validateAllProductData } from '@/components/producto/wizard/productValidation';
import useProductCatalogs from '@/components/producto/wizard/useProductCatalogs';
import productoService from '@/services/productoService';
import ProductSubmittedForm from './ProductSubmittedForm';

/**
 * Asistente de Creación de Producto (5 Pasos Oficiales Reback)
 * Con validaciones por paso y pre-guardado según reglas de PostgreSQL.
 */
const CreateProductForms = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [productData, setProductData] = useState(() => getInitialProductState());
  const [validationErrors, setValidationErrors] = useState({});
  const [stepError, setStepError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSaveProduct = async () => {
    const check = validateAllProductData(productData);
    if (!check.isValid) {
      setActiveStep(check.firstInvalidStep);
      setValidationErrors(check.errors);
      setStepError(check.message);
      return;
    }
    try {
      setIsSaving(true);
      setSaveError('');
      setStepError('');
      const res = await productoService.crearProducto(productData, 1);
      if (res?.producto) {
        setProductData(prev => ({
          ...prev,
          id: res.producto.id_producto || res.producto.id,
          codigo_interno: res.producto.codigo_interno || prev.codigo_interno,
        }));
      }
      setIsSubmitted(true);
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Error al persistir producto';
      setSaveError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetForm = async () => {
    setSaveError(''); setStepError(''); setValidationErrors({});
    const nextCode = await productoService.getSiguienteCodigo(1).catch(() => '');
    const fresh = getInitialProductState(nextCode);
    reset(fresh); setProductData(fresh); setIsSubmitted(false); setActiveStep(1);
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
    return <ProductSubmittedForm productData={productData} onCreateAnother={handleResetForm} />;
  }

  return (
    <>
      <FullPageLoader
        show={isSaving}
        title="Subiendo y sincronizando producto..."
        message="Guardando en la base de datos y publicando en el catálogo de Meta WhatsApp Business..."
        badge="Meta WhatsApp Commerce Sync"
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
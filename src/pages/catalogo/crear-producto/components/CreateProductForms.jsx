import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import WizardTabsHeader from '@/components/producto/wizard/WizardTabsHeader';
import WizardNavigation from '@/components/producto/wizard/WizardNavigation';
import { buildProductWizardSteps } from '@/components/producto/wizard/buildProductWizardSteps';
import { getInitialProductState } from '@/components/producto/wizard/initialProductState';
import productoService from '@/services/productoService';
import ProductSubmittedForm from './ProductSubmittedForm';

/**
 * Asistente de Creación de Producto (5 Pasos Oficiales Reback)
 * 1. Descripción | 2. Impuestos | 3. Inventario (incl. Variantes) | 4. Imágenes | 5. Metadata
 */
const CreateProductForms = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [catalogs, setCatalogs] = useState({});
  const [productData, setProductData] = useState(() => getInitialProductState());
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    show: false,
    title: '',
    message: '',
    itemName: '',
    itemType: '',
    onConfirm: null,
  });

  const { control, setValue, reset } = useForm({ defaultValues: productData, mode: 'onChange' });

  const triggerDeleteConfirm = (config) => {
    setDeleteModalConfig({ show: true, ...config });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catData, code] = await Promise.all([
          productoService.getCatalogos(1),
          productoService.getSiguienteCodigo(1),
        ]);
        const categoriesWithSubs = (catData.categorias || []).map(cat => ({
          ...cat,
          subcategorias: (catData.subcategorias || []).filter(sub => String(sub.categoria_id) === String(cat.id)),
        }));
        const attributesWithComps = (catData.atributos || []).map(attr => ({
          ...attr,
          id_atributo: attr.id,
          componentes: (catData.atributosComponentes || [])
            .filter(comp => String(comp.atributo_id) === String(attr.id))
            .map(comp => ({
              ...comp,
              id_atributo_componente: comp.id,
            })),
        }));
        setCatalogs({
          ...catData,
          categorias: categoriesWithSubs,
          atributos: attributesWithComps,
        });
        if (code) {
          updateField('codigo_interno', code);
        }
      } catch (err) {
        console.warn('Error al cargar catálogos desde backend:', err);
      }
    };
    loadData();
  }, []);

  const updateField = (fieldName, value) => {
    setValue(fieldName, value, { shouldValidate: true, shouldDirty: true });
    setProductData(prev => ({ ...prev, [fieldName]: value }));
  };

  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProduct = async () => {
    try {
      setIsSaving(true);
      setSaveError('');
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
      console.error('Error al persistir producto en PostgreSQL:', e);
      const msg = e.response?.data?.message || e.message || 'Error al guardar el producto en la base de datos';
      setSaveError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetForm = async () => {
    setSaveError('');
    const nextCode = await productoService.getSiguienteCodigo(1).catch(() => '');
    const fresh = getInitialProductState(nextCode);
    reset(fresh);
    setProductData(fresh);
    setIsSubmitted(false);
    setActiveStep(1);
  };

  const formSteps = buildProductWizardSteps({
    productData,
    updateField,
    catalogs,
    setCatalogs,
    triggerDeleteConfirm,
    control,
    setValue,
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
      {saveError && <div className="alert alert-danger py-2 fs-13 mb-3">{saveError}</div>}
      <WizardTabsHeader formSteps={formSteps} activeStep={activeStep} setActiveStep={setActiveStep} />
      <WizardNavigation
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        totalSteps={formSteps.length}
        stepName={formSteps[activeStep - 1]?.name}
        onSave={handleSaveProduct}
        isSaving={isSaving}
      />
      <DeleteConfirmationModal
        show={deleteModalConfig.show}
        onHide={() => setDeleteModalConfig(prev => ({ ...prev, show: false }))}
        onConfirm={() => {
          if (deleteModalConfig.onConfirm) deleteModalConfig.onConfirm();
          setDeleteModalConfig(prev => ({ ...prev, show: false }));
        }}
        title={deleteModalConfig.title}
        message={deleteModalConfig.message}
        itemName={deleteModalConfig.itemName}
        itemType={deleteModalConfig.itemType}
      />
    </>
  );
};

export default CreateProductForms;
import { useState, useEffect } from 'react';
import productoService from '@/services/productoService';
import { getInitialProductState } from './initialProductState';
import { validateAllProductData } from './productValidation';

export const useProductSaveHandler = ({
  productId,
  productData,
  setProductData,
  reset,
  setActiveStep,
  setValidationErrors,
  setStepError,
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Cargar datos para edición si productId existe
  useEffect(() => {
    if (!productId) return;
    setIsLoadingProduct(true);
    setSaveError('');
    productoService
      .getProducto(productId, 1)
      .then((data) => {
        if (data) {
          const formatted = {
            ...getInitialProductState(),
            ...data,
            id: data.id || productId,
          };
          reset(formatted);
          setProductData(formatted);
        }
      })
      .catch((err) => {
        setSaveError('Error al cargar datos del producto para edición');
      })
      .finally(() => setIsLoadingProduct(false));
  }, [productId, reset, setProductData]);

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

      let res;
      if (productId) {
        // Enviar actualización: el backend compara y actualiza en Meta solo lo que cambió
        res = await productoService.actualizarProducto(productId, productData, 1);
      } else {
        res = await productoService.crearProducto(productData, 1);
      }

      if (res?.producto) {
        setProductData((prev) => ({
          ...prev,
          ...res.producto,
          id: res.producto.id_producto || res.producto.id || prev.id,
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
    setSaveError('');
    setStepError('');
    setValidationErrors({});
    const nextCode = await productoService.getSiguienteCodigo(1).catch(() => '');
    const fresh = getInitialProductState(nextCode);
    reset(fresh);
    setProductData(fresh);
    setIsSubmitted(false);
    setActiveStep(1);
  };

  return {
    isSubmitted,
    isSaving,
    isLoadingProduct,
    saveError,
    setSaveError,
    handleSaveProduct,
    handleResetForm,
  };
};

export default useProductSaveHandler;

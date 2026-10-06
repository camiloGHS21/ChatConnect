import { useState, useEffect } from 'react';
import GeneralInfoCard from '@/components/producto/general/GeneralInfoCard';
import GeneralDescriptionCard from '@/components/producto/general/GeneralDescriptionCard';
import GeneralStatusCard from '@/components/producto/general/GeneralStatusCard';
import GeneralQuickModals from '@/components/producto/general/GeneralQuickModals';
import productoService from '@/services/productoService';

/**
 * Paso 1: Descripción y Datos Principales del Producto.
 * Idéntico al template Reback con estructura modular de tarjetas.
 */
const GeneralDetailsForm = ({ formData, updateField, catalogs = {}, onGenerateCode, setCatalogs, errors = {} }) => {
  const [categories, setCategories] = useState(catalogs?.categorias || []);
  const [brands, setBrands] = useState(catalogs?.marcas || []);

  useEffect(() => {
    if (catalogs?.categorias?.length) setCategories(catalogs.categorias);
    if (catalogs?.marcas?.length) setBrands(catalogs.marcas);
  }, [catalogs.categorias, catalogs.marcas]);

  const [showCatModal, setShowCatModal] = useState(false);
  const [showSubcatModal, setShowSubcatModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);

  const activeCategories = categories.length ? categories : (catalogs?.categorias || []);
  const activeBrands = brands.length ? brands : (catalogs?.marcas || []);
  const currentCat = activeCategories.find(c => String(c.id || c.id_categoria) === String(formData?.categoria_id));

  const handleSaveCategory = async (name) => {
    const created = await productoService.crearCategoria({ nombre: name });
    const newCat = { ...created, id: created.id, subcategorias: [] };
    if (setCatalogs) setCatalogs(p => ({ ...p, categorias: [...(p.categorias || []).filter(c => String(c.id || c.id_categoria) !== String(newCat.id)), newCat] }));
    setCategories(p => [...p.filter(c => String(c.id || c.id_categoria) !== String(newCat.id)), newCat]);
    updateField('categoria_id', newCat.id);
    return newCat;
  };

  const handleSaveSubcategory = async (name) => {
    if (!formData?.categoria_id) return;
    const created = await productoService.crearSubcategoria({ categoria_id: Number(formData.categoria_id), nombre: name });
    const newSub = { ...created, id: created.id, categoria_id: formData.categoria_id };
    if (setCatalogs) {
      setCatalogs(p => ({
        ...p,
        subcategorias: [...(p.subcategorias || []).filter(s => String(s.id || s.id_subcategoria) !== String(newSub.id)), newSub],
        categorias: (p.categorias || []).map(c => String(c.id || c.id_categoria) === String(formData.categoria_id) ? { ...c, subcategorias: [...(c.subcategorias || []).filter(s => s.id !== newSub.id), newSub] } : c)
      }));
    }
    setCategories(p => p.map(c => String(c.id || c.id_categoria) === String(formData.categoria_id) ? { ...c, subcategorias: [...(c.subcategorias || []).filter(s => s.id !== newSub.id), newSub] } : c));
    updateField('subcategoria_id', newSub.id);
    return newSub;
  };

  const handleSaveBrand = async (name) => {
    const created = await productoService.crearMarca({ nombre: name });
    const newBrand = { ...created, id: created.id };
    if (setCatalogs) setCatalogs(p => ({ ...p, marcas: [...(p.marcas || []).filter(b => String(b.id || b.id_marca) !== String(newBrand.id)), newBrand] }));
    setBrands(p => [...p.filter(b => String(b.id || b.id_marca) !== String(newBrand.id)), newBrand]);
    updateField('marca_id', newBrand.id);
    return newBrand;
  };

  return (
    <div className="product-general-form">
      <div className="mb-3">
        <h5 className="card-title mb-1">Descripción y Datos Principales del Producto</h5>
        <p className="text-muted fs-14 mb-0">Identificación interna, catálogo comercial y descripciones.</p>
      </div>

      <GeneralInfoCard
        formData={formData}
        updateField={updateField}
        categories={activeCategories}
        brands={activeBrands}
        onGenerateCode={onGenerateCode}
        errors={errors}
        onOpenCreateCategory={() => setShowCatModal(true)}
        onOpenCreateSubcategory={() => setShowSubcatModal(true)}
        onOpenCreateBrand={() => setShowBrandModal(true)}
      />

      <GeneralDescriptionCard
        formData={formData}
        updateField={updateField}
      />


      {/* CARD 3: Estado y Visibilidad */}
      <GeneralStatusCard
        formData={formData}
        updateField={updateField}
      />

      {/* Modales rápidos */}
      <GeneralQuickModals
        categoryModal={showCatModal}
        setCategoryModal={setShowCatModal}
        onSaveCategory={handleSaveCategory}
        subcategoryModal={showSubcatModal}
        setSubcategoryModal={setShowSubcatModal}
        onSaveSubcategory={handleSaveSubcategory}
        brandModal={showBrandModal}
        setBrandModal={setShowBrandModal}
        onSaveBrand={handleSaveBrand}
        currentCategoryName={currentCat?.nombre}
      />
    </div>
  );
};

export default GeneralDetailsForm;
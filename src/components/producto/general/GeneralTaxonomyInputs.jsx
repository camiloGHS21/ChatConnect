import React from 'react';
import { Col, Form, Button } from 'react-bootstrap';

/**
 * Fila de Selectores de Categoría, Subcategoría, Marca y Presentación
 */
const GeneralTaxonomyInputs = ({
  formData,
  updateField,
  categories = [],
  brands = [],
  onOpenCreateCategory,
  onOpenCreateSubcategory,
  onOpenCreateBrand,
}) => {
  const currentCatId = formData?.categoria_id ? String(formData.categoria_id) : '';
  const selectedCategory = categories.find(c => String(c.id || c.id_categoria) === currentCatId);
  const availableSubcategories = selectedCategory?.subcategorias || [];

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    updateField('categoria_id', val ? Number(val) : null);
    updateField('subcategoria_id', null);
  };

  return (
    <>
      {/* Categoría */}
      <Col lg={4} md={6}>
        <div>
          <div className="d-flex align-items-center justify-content-between mb-1">
            <Form.Label htmlFor="categoria_id" className="form-label fw-semibold mb-0 fs-13">
              Categoría <span className="text-danger">*</span>
            </Form.Label>
            {onOpenCreateCategory && (
              <Button
                variant="link"
                size="sm"
                type="button"
                className="p-0 fs-12 text-primary fw-semibold text-decoration-none"
                onClick={onOpenCreateCategory}
              >
                + Crear Categoría
              </Button>
            )}
          </div>
          <Form.Select
            id="categoria_id"
            size="sm"
            value={formData?.categoria_id != null ? String(formData.categoria_id) : ''}
            onChange={handleCategoryChange}
          >
            <option value="">-- Seleccionar Categoría --</option>
            {categories.map(cat => (
              <option key={cat.id || cat.id_categoria} value={String(cat.id || cat.id_categoria)}>
                {cat.nombre}
              </option>
            ))}
          </Form.Select>
        </div>
      </Col>

      {/* Subcategoría */}
      <Col lg={4} md={6}>
        <div>
          <div className="d-flex align-items-center justify-content-between mb-1">
            <Form.Label htmlFor="subcategoria_id" className="form-label fw-semibold mb-0 fs-13">
              Subcategoría
            </Form.Label>
            {onOpenCreateSubcategory && (
              <Button
                variant="link"
                size="sm"
                type="button"
                className="p-0 fs-12 text-primary fw-semibold text-decoration-none"
                onClick={onOpenCreateSubcategory}
                disabled={!currentCatId}
              >
                + Crear Subcategoría
              </Button>
            )}
          </div>
          <Form.Select
            id="subcategoria_id"
            size="sm"
            value={formData?.subcategoria_id != null ? String(formData.subcategoria_id) : ''}
            disabled={!currentCatId || availableSubcategories.length === 0}
            onChange={e => updateField('subcategoria_id', e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">
              {!currentCatId ? '-- Primero elija una categoría --' : availableSubcategories.length === 0 ? '-- Sin subcategorías --' : '-- Seleccionar Subcategoría --'}
            </option>
            {availableSubcategories.map(sub => (
              <option key={sub.id || sub.id_subcategoria} value={String(sub.id || sub.id_subcategoria)}>
                {sub.nombre}
              </option>
            ))}
          </Form.Select>
        </div>
      </Col>

      {/* Marca */}
      <Col lg={4} md={12}>
        <div>
          <div className="d-flex align-items-center justify-content-between mb-1">
            <Form.Label htmlFor="marca_id" className="form-label fw-semibold mb-0 fs-13">
              Marca
            </Form.Label>
            {onOpenCreateBrand && (
              <Button
                variant="link"
                size="sm"
                type="button"
                className="p-0 fs-12 text-primary fw-semibold text-decoration-none"
                onClick={onOpenCreateBrand}
              >
                + Crear Marca
              </Button>
            )}
          </div>
          <Form.Select
            id="marca_id"
            size="sm"
            value={formData?.marca_id != null ? String(formData.marca_id) : ''}
            onChange={e => updateField('marca_id', e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">-- Seleccionar Marca --</option>
            {brands.map(brand => (
              <option key={brand.id || brand.id_marca} value={String(brand.id || brand.id_marca)}>
                {brand.nombre}
              </option>
            ))}
          </Form.Select>
        </div>
      </Col>

    </>
  );
};

export default GeneralTaxonomyInputs;

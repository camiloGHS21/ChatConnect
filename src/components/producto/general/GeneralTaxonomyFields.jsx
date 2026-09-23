import { Col, Row, Form, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Selectores taxonómicos dinámicos: Categoría, Subcategoría dependiente y Marca.
 */
const GeneralTaxonomyFields = ({
  categories = [],
  brands = [],
  formData,
  updateField,
  onOpenCreateCategory,
  onOpenCreateSubcategory,
  onOpenCreateBrand
}) => {
  const currentCatId = formData?.categoria_id ? String(formData.categoria_id) : '';
  const selectedCategory = categories.find(c => String(c.id || c.id_categoria) === currentCatId);
  const availableSubcategories = selectedCategory?.subcategorias || [];

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    updateField('categoria_id', val ? Number(val) : null);
    // Limpiar subcategoría al cambiar de categoría
    updateField('subcategoria_id', null);
  };

  return (
    <Row className="g-3 mt-1">
      <Col md={4}>
        <Form.Group>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <Form.Label htmlFor="categoria_id" className="mb-0 fs-13 fw-semibold">
              Categoría <span className="text-danger">*</span>
            </Form.Label>
            {onOpenCreateCategory && (
              <Button
                variant="link"
                className="p-0 fs-12 text-primary text-decoration-none fw-semibold d-flex align-items-center"
                onClick={onOpenCreateCategory}
              >
                <IconifyIcon icon="bx:plus" className="me-1" />
                Nueva
              </Button>
            )}
          </div>
          <Form.Select
            id="categoria_id"
            value={formData?.categoria_id || ''}
            onChange={handleCategoryChange}
          >
            <option value="">-- Seleccionar Categoría --</option>
            {categories.map(cat => (
              <option key={cat.id || cat.id_categoria} value={cat.id || cat.id_categoria}>
                {cat.nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={4}>
        <Form.Group>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <Form.Label htmlFor="subcategoria_id" className="mb-0 fs-13 fw-semibold">
              Subcategoría
            </Form.Label>
            {onOpenCreateSubcategory && (
              <Button
                variant="link"
                className="p-0 fs-12 text-primary text-decoration-none fw-semibold d-flex align-items-center"
                disabled={!currentCatId}
                onClick={onOpenCreateSubcategory}
              >
                <IconifyIcon icon="bx:plus" className="me-1" />
                Nueva
              </Button>
            )}
          </div>
          <Form.Select
            id="subcategoria_id"
            value={formData?.subcategoria_id || ''}
            disabled={!currentCatId || availableSubcategories.length === 0}
            onChange={e => updateField('subcategoria_id', e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">
              {!currentCatId
                ? '-- Primero elija una categoría --'
                : availableSubcategories.length === 0
                ? '-- Sin subcategorías registradas --'
                : '-- Seleccionar Subcategoría --'}
            </option>
            {availableSubcategories.map(sub => (
              <option key={sub.id || sub.id_subcategoria} value={sub.id || sub.id_subcategoria}>
                {sub.nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={4}>
        <Form.Group>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <Form.Label htmlFor="marca_id" className="mb-0 fs-13 fw-semibold">
              Marca
            </Form.Label>
            {onOpenCreateBrand && (
              <Button
                variant="link"
                className="p-0 fs-12 text-primary text-decoration-none fw-semibold d-flex align-items-center"
                onClick={onOpenCreateBrand}
              >
                <IconifyIcon icon="bx:plus" className="me-1" />
                Nueva
              </Button>
            )}
          </div>
          <Form.Select
            id="marca_id"
            value={formData?.marca_id || ''}
            onChange={e => updateField('marca_id', e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">-- Sin Marca / Genérica --</option>
            {brands.map(brand => (
              <option key={brand.id || brand.id_marca} value={brand.id || brand.id_marca}>
                {brand.nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>
  );
};

export default GeneralTaxonomyFields;

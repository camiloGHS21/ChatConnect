import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const ProductSummaryCard = ({
  formData,
  catalogs = {},
}) => {
  const catName = formData?.categoria || catalogs.categorias?.find(c => String(c.id) === String(formData?.categoria_id))?.nombre || 'General';
  const subName = formData?.subcategoria || catalogs.subcategorias?.find(s => String(s.id) === String(formData?.subcategoria_id))?.nombre || '';
  const brandName = formData?.marca || catalogs.marcas?.find(b => String(b.id) === String(formData?.marca_id))?.nombre || 'Genérica';

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2 mt-4">
        <div>
          <h5 className="mb-1 text-primary fw-bold">
            <IconifyIcon icon="bx:file" className="me-2 fs-18 text-primary" />
            Resumen de Configuración del Producto
          </h5>
          <p className="text-muted fs-13 mb-0">Verifica los datos antes de guardar en el sistema</p>
        </div>
      </div>

      <Card className="border shadow-none bg-light-subtle mb-4 rounded-3">
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col lg={3} sm={6}>
              <span className="text-muted fs-12 d-block">Código Interno:</span>
              <span className="fw-bold font-monospace text-dark fs-14">
                {formData?.codigo_interno || 'Automático'}
              </span>
            </Col>

            <Col lg={5} sm={6}>
              <span className="text-muted fs-12 d-block">Nombre del Producto:</span>
              <span className="fw-bold text-dark fs-14">
                {formData?.nombre || '(Sin nombre)'}
              </span>
            </Col>

            <Col lg={4} sm={6}>
              <span className="text-muted fs-12 d-block">Categoría / Marca:</span>
              <span className="fw-medium text-dark fs-13">
                {catName} {subName ? `• ${subName}` : ''} | {brandName}
              </span>
            </Col>

            <Col lg={3} sm={6}>
              <span className="text-muted fs-12 d-block">Costo con Impuestos:</span>
              <span className="fw-bold text-dark fs-14 font-monospace">
                ${Number(formData?.costo_impuesto || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-muted fs-11 d-block">
                Base: ${Number(formData?.costo_base || 0).toLocaleString('es-CO')} ({formData?.impuestos_compra?.length || 0} imp.)
              </span>
            </Col>

            <Col lg={3} sm={6}>
              <span className="text-muted fs-12 d-block">Precio de Venta (PVP):</span>
              <span className="fw-bold text-success fs-15 font-monospace">
                ${Number(formData?.precio_impuesto || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-muted fs-11 d-block">
                Base: ${Number(formData?.precio_base || 0).toLocaleString('es-CO')} ({formData?.impuestos_venta?.length || 0} imp.)
              </span>
            </Col>

            <Col lg={3} sm={6}>
              <span className="text-muted fs-12 d-block">Margen de Utilidad:</span>
              <Badge bg="success" className="fs-12">
                {Number(formData?.utilidad_porcentaje || 0).toFixed(2)}% (${Number(formData?.utilidad_valor || 0).toLocaleString('es-CO')})
              </Badge>
            </Col>

            <Col lg={3} sm={6}>
              <span className="text-muted fs-12 d-block">Control de Inventario:</span>
              <span className="fw-medium fs-13">
                {formData?.maneja_inventario ? (
                  <Badge bg="info">Activo (Mín: {formData?.stock_minimo || 0} / Máx: {formData?.stock_maximo || 0})</Badge>
                ) : (
                  <Badge bg="secondary">No maneja stock</Badge>
                )}
              </span>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default ProductSummaryCard;


import { Table, Badge } from 'react-bootstrap';

/**
 * Tabla de Variantes del Producto.
 * Idéntico al diseño de la imagen (media_1790110117365.png) y Reback oficial.
 */
const VariantsTableCard = ({ variantes = [] }) => {
  return (
    <div className="mb-4">
      <div className="mb-3">
        <h5 className="card-title mb-1 fw-bold text-body fs-15">Variantes del Producto</h5>
        <p className="text-muted fs-14 mb-0">
          Combinaciones resultantes de los atributos con inventario y precio independiente
        </p>
      </div>

      <div className="table-responsive border rounded mb-3">
        <Table hover className="table-sm align-middle mb-0">
          <thead style={{ '--bs-table-bg': 'var(--bs-tertiary-bg)', '--bs-table-color': 'var(--bs-body-color)', '--bs-table-border-color': 'var(--bs-border-color)' }}>
            <tr>
              <th>SKU</th>
              <th>Combinación de Atributos</th>
              <th>Código de Barras</th>
              <th>Referencia</th>
              <th>Precio ($)</th>
              <th>Existencias</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {variantes.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-3 text-muted">
                  Este producto no genera variantes independientes o no tiene componentes seleccionados.
                </td>
              </tr>
            ) : (
              variantes.map(v => (
                <tr key={v.id}>
                  <td className="font-monospace fw-semibold text-primary">{v.sku}</td>
                  <td className="fw-medium text-body">{v.combinacion}</td>
                  <td className="font-monospace fs-12">{v.codigo_barras || '-'}</td>
                  <td className="text-muted fs-12">{v.referencia || '-'}</td>
                  <td className="fw-bold text-success">
                    ${Number(v.precio || 0).toLocaleString('es-CO')}
                  </td>
                  <td>
                    <Badge bg="info" className="bg-opacity-10 text-info">
                      {v.stock} unidades
                    </Badge>
                  </td>
                  <td>
                    <Badge bg="success" className="bg-opacity-10 text-success">
                      {v.estado || 'activo'}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default VariantsTableCard;


import { Table, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const ProveedoresTable = ({ proveedores = [], onRemove, triggerDeleteConfirm }) => {
  const formatMoney = (val) => {
    return '$' + Number(val || 0).toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleDelete = (p) => {
    if (triggerDeleteConfirm) {
      triggerDeleteConfirm({
        title: '¿Desvincular proveedor?',
        itemName: `${p.nombre_proveedor || ''} (${p.referencia_proveedor || 'Sin ref'})`,
        onConfirm: () => onRemove(p.id),
      });
    } else {
      onRemove(p.id);
    }
  };

  return (
    <div className="table-responsive border rounded-3 mb-0" style={{ borderColor: 'var(--bs-border-color)' }}>
      <Table hover className="table-sm align-middle mb-0">
        <thead style={{ '--bs-table-bg': 'var(--bs-tertiary-bg)', '--bs-table-color': 'var(--bs-body-color)' }}>
          <tr>
            <th className="py-2.5 px-3 fs-13 fw-semibold text-body-emphasis border-0">Proveedor</th>
            <th className="py-2.5 px-3 fs-13 fw-semibold text-body-emphasis border-0">Ref. Proveedor</th>
            <th className="py-2.5 px-3 fs-13 fw-semibold text-body-emphasis border-0">Precio Proveedor</th>
            <th className="py-2.5 px-3 fs-13 fw-semibold text-body-emphasis border-0 text-end">Acción</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-3 text-muted fs-13">
                No hay proveedores asignados a este producto.
              </td>
            </tr>
          ) : (
            proveedores.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid var(--bs-border-color)' }}>
                <td className="py-2.5 px-3 fw-semibold text-body-emphasis fs-13">
                  {p.nombre_proveedor}
                </td>
                <td className="py-2.5 px-3 text-secondary fs-13">
                  {p.referencia_proveedor || '-'}
                </td>
                <td className="py-2.5 px-3 fw-bold fs-13 font-monospace" style={{ color: '#16a34a' }}>
                  {p.precio_proveedor ? formatMoney(p.precio_proveedor) : '-'}
                </td>
                <td className="py-2.5 px-3 text-end">
                  <Button
                    variant="link"
                    className="text-danger p-0 border-0"
                    onClick={() => handleDelete(p)}
                    title="Eliminar proveedor"
                                        aria-label="Eliminar proveedor"
                    style={{ color: '#ef4444' }}
                  >
                    <IconifyIcon icon="bx:trash" className="fs-17" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ProveedoresTable;

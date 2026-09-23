import React from 'react';
import { Table } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Tabla de listas de precios asignadas al producto.
 * Idéntico al diseño de la imagen del usuario (media_1790108944931.png).
 */
const ListasPreciosTable = ({
  listasPrecios = [],
  onToggleState,
  onRemove,
  triggerDeleteConfirm
}) => {
  const formatMoney = (val) => {
    return '$' + Number(val || 0).toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleDelete = (item) => {
    if (triggerDeleteConfirm) {
      triggerDeleteConfirm({
        title: '¿Eliminar lista de precios?',
        itemName: `${item.nombre_lista} (Precio Venta: ${formatMoney(item.precio_venta)})`,
        itemType: 'lista de precios',
        onConfirm: () => onRemove(item.id)
      });
    } else {
      onRemove(item.id);
    }
  };

  return (
    <div className="table-responsive border rounded-3 mb-4" style={{ borderColor: '#eef2f6' }}>
      <Table hover className="align-middle mb-0">
        <thead style={{ backgroundColor: '#f4f6fa' }}>
          <tr style={{ backgroundColor: '#f4f6fa' }}>
            <th className="py-3 px-3 fs-13 fw-semibold text-dark border-0">Lista de Precio</th>
            <th className="py-3 px-3 fs-13 fw-semibold text-dark border-0">Precio Base</th>
            <th className="py-3 px-3 fs-13 fw-semibold text-dark border-0">% Utilidad</th>
            <th className="py-3 px-3 fs-13 fw-semibold text-dark border-0">Impuesto Venta</th>
            <th className="py-3 px-3 fs-13 fw-semibold text-dark border-0">Precio de Venta</th>
            <th className="py-3 px-3 fs-13 fw-semibold text-dark border-0 text-center">Estado</th>
            <th className="py-3 px-3 fs-13 fw-semibold text-dark border-0 text-end">Acción</th>
          </tr>
        </thead>
        <tbody>
          {listasPrecios.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4 text-muted fs-13">
                No hay listas de precios asignadas. Utiliza el selector superior para agregar una.
              </td>
            </tr>
          ) : (
            listasPrecios.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td className="py-3 px-3 fw-semibold text-dark fs-14">
                  {item.nombre_lista}
                </td>
                <td className="py-3 px-3 text-secondary fs-14">
                  {formatMoney(item.precio_base)}
                </td>
                <td className="py-3 px-3">
                  <span
                    style={{
                      backgroundColor: '#e0f2fe',
                      color: '#0284c7',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      display: 'inline-block'
                    }}
                  >
                    {Number(item.utilidad_porcentaje || 0).toFixed(2)}%
                  </span>
                </td>
                <td className="py-3 px-3 text-secondary fs-14">
                  {item.impuesto_porcentaje}%
                </td>
                <td className="py-3 px-3 fw-bold fs-14" style={{ color: '#16a34a', fontFamily: 'monospace' }}>
                  {formatMoney(item.precio_venta)}
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    type="button"
                    className="btn btn-sm p-0 px-3 py-1 fs-12 fw-medium rounded-pill text-white border-0"
                    style={{
                      backgroundColor: item.estado === 'activo' ? '#22c55e' : '#6c757d',
                      cursor: 'pointer'
                    }}
                    onClick={() => onToggleState(item.id)}
                    title="Clic para alternar estado"
                  >
                    {item.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="py-3 px-3 text-end">
                  <button
                    type="button"
                    className="btn btn-link p-0 text-danger border-0"
                    onClick={() => handleDelete(item)}
                    title="Eliminar de esta lista"
                    style={{ color: '#ef4444' }}
                  >
                    <IconifyIcon icon="bx:trash" className="fs-18" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ListasPreciosTable;

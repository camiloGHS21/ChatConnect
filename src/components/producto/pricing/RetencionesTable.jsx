import React from 'react';
import { Table, Badge, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const RetencionesTable = ({ retenciones = [], onRemove, triggerDeleteConfirm }) => {
  const handleDelete = (item) => {
    if (triggerDeleteConfirm) {
      triggerDeleteConfirm({
        title: '¿Eliminar retención fiscal?',
        itemName: `${item.nombre_retencion}`,
        onConfirm: () => onRemove(item.id),
      });
    } else {
      onRemove(item.id);
    }
  };

  return (
    <div className="table-responsive border rounded mb-2">
      <Table hover className="table-sm align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Retención</th>
            <th>Tipo</th>
            <th>Porcentaje</th>
            <th>Valor Fijo</th>
            <th>Estado</th>
            <th className="text-end">Acción</th>
          </tr>
        </thead>
        <tbody>
          {retenciones.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-3 text-muted fs-13">
                No hay retenciones asociadas a este producto.
              </td>
            </tr>
          ) : (
            retenciones.map(item => (
              <tr key={item.id}>
                <td className="fw-semibold text-dark">{item.nombre_retencion}</td>
                <td>
                  <Badge
                    bg={item.tipo === 'PORCENTAJE' ? 'primary-subtle' : 'warning-subtle'}
                    className={item.tipo === 'PORCENTAJE' ? 'text-primary' : 'text-warning'}
                  >
                    {item.tipo}
                  </Badge>
                </td>
                <td>{item.porcentaje ? `${item.porcentaje}%` : '-'}</td>
                <td>{item.valor_fijo ? `$${Number(item.valor_fijo).toLocaleString('es-CO')}` : '-'}</td>
                <td>
                  <Badge bg="success-subtle" className="text-success">{item.estado}</Badge>
                </td>
                <td className="text-end">
                  <Button
                    variant="link"
                    className="text-danger p-0"
                    onClick={() => handleDelete(item)}
                  >
                    <IconifyIcon icon="bx:trash" className="fs-16" />
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

export default RetencionesTable;

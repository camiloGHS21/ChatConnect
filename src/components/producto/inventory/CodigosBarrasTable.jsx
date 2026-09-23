import React from 'react';
import { Table, Badge, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const CodigosBarrasTable = ({ codigosBarras = [], onSetPrincipal, onRemove, triggerDeleteConfirm }) => {
  const handleDelete = (b) => {
    if (triggerDeleteConfirm) {
      triggerDeleteConfirm({
        title: '¿Eliminar código de barras?',
        itemName: b.codigo_barras,
        onConfirm: () => onRemove(b.id),
      });
    } else {
      onRemove(b.id);
    }
  };

  return (
    <div className="table-responsive border rounded">
      <Table hover className="table-sm align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Código</th>
            <th>Descripción</th>
            <th>Principal</th>
            <th className="text-end">Acción</th>
          </tr>
        </thead>
        <tbody>
          {codigosBarras.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-3 text-muted fs-13">
                No se han registrado códigos de barras para este producto.
              </td>
            </tr>
          ) : (
            codigosBarras.map(b => (
              <tr key={b.id}>
                <td className="fw-bold font-monospace text-dark">{b.codigo_barras}</td>
                <td className="text-muted">{b.descripcion || '-'}</td>
                <td>
                  {b.principal ? (
                    <Badge bg="success" className="fs-11">Principal</Badge>
                  ) : (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-muted fs-11 text-decoration-none"
                      onClick={() => onSetPrincipal(b.id)}
                    >
                      Marcar principal
                    </Button>
                  )}
                </td>
                <td className="text-end">
                  <Button
                    variant="link"
                    className="text-danger p-0"
                    onClick={() => handleDelete(b)}
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

export default CodigosBarrasTable;

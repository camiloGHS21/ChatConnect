import { Badge } from 'react-bootstrap';

export const getStatusBadge = (estado) => {
  switch (estado) {
    case 'entregado':
      return <Badge bg="success-subtle" className="text-success px-2 py-1">Entregado</Badge>;
    case 'despachado':
      return <Badge bg="primary-subtle" className="text-primary px-2 py-1">Despachado</Badge>;
    case 'en_preparacion':
      return <Badge bg="info-subtle" className="text-info px-2 py-1">En Preparación</Badge>;
    case 'confirmado':
      return <Badge bg="warning-subtle" className="text-warning px-2 py-1">Confirmado</Badge>;
    default:
      return <Badge bg="secondary-subtle" className="text-secondary px-2 py-1">Pendiente</Badge>;
  }
};

export default getStatusBadge;

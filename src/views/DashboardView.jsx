import React from 'react';
import { Card, CardBody, Button, Row, Col, Badge } from 'react-bootstrap';
import { useAuthContext } from '@/context/useAuthContext';

const DashboardView = () => {
  const { user, removeSession } = useAuthContext();
  const sessionUser = user?.user || user || {};
  const empresa = user?.empresa || { nombre: 'Distribuidora NovaTech S.A.S.', nit: '901.452.890-1' };

  return (
    <div className="py-4">
      <Card className="shadow-sm border-0 mb-4">
        <CardBody className="p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <span className="badge bg-primary-subtle text-primary mb-2">Arquitectura MVC Conectada</span>
              <h2 className="fw-bold mb-1">¡Bienvenido al Panel, {sessionUser.nombre || 'Usuario'}! 👋</h2>
              <p className="text-muted mb-0">
                Empresa activa: <strong>{empresa.nombre}</strong> (NIT: {empresa.nit || 'N/A'})
              </p>
            </div>
            <Button variant="outline-danger" onClick={removeSession} className="d-flex align-items-center gap-2">
              <i className="bx bx-log-out"></i> Cerrar Sesión
            </Button>
          </div>
        </CardBody>
      </Card>

      <Row className="g-3">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <div className="text-muted mb-1 small text-uppercase fw-semibold">Estado de Sesión</div>
              <h4 className="fw-bold text-success mb-2">Activa (JWT)</h4>
              <p className="text-muted small mb-0">Autenticado vía NestJS Backend MVC</p>
            </CardBody>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <div className="text-muted mb-1 small text-uppercase fw-semibold">Rol del Usuario</div>
              <h4 className="fw-bold text-primary mb-2">
                <Badge bg="info">{sessionUser.rol || 'Administrador'}</Badge>
              </h4>
              <p className="text-muted small mb-0">{sessionUser.email || 'test@techzaa.in'}</p>
            </CardBody>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <div className="text-muted mb-1 small text-uppercase fw-semibold">Base de Datos PostgreSQL</div>
              <h4 className="fw-bold text-dark mb-2">22 Entidades ERD</h4>
              <p className="text-muted small mb-0">Modelos Usuarios, Empresas, Roles configurados</p>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardView;

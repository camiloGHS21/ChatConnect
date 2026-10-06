
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Lista de atributos asignados al producto con selección de componentes.
 * Idéntico al diseño de la imagen (media_1790110117365.png) y Reback oficial.
 */
const AttributesAssignedList = ({
  assignedAttributes = [],
  allAttributes = [],
  onToggleComponent,
  onToggleObligatorio,
  onOpenAddComponent,
  onOpenEditComponent,
  onDeleteComponent,
  onRemoveAttribute,
  triggerDeleteConfirm,
}) => {
  if (assignedAttributes.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="mb-3">
        <h5 className="card-title mb-1 fw-bold text-body fs-15">Componentes y Opciones Disponibles</h5>
        <p className="text-muted fs-14 mb-0">
          Selecciona los componentes o valores de cada atributo para este producto
        </p>
      </div>

      <Row className="g-3">
        {assignedAttributes.map((assigned, idx) => {
          const meta = allAttributes.find(a =>
            String(a.id_atributo) === String(assigned.id_atributo) ||
            (a.codigo && assigned.codigo && a.codigo.toUpperCase() === assigned.codigo.toUpperCase())
          );
          const componentsList = meta?.componentes || [];
          const selectedIds = (assigned.componentes_seleccionados || []).map(String);

          return (
            <Col lg={6} md={12} key={assigned.id_atributo}>
              <Card className="border shadow-none rounded-3 bg-body h-100" style={{ borderColor: 'var(--bs-border-color)' }}>
                <Card.Header
                  className="py-2.5 px-3 d-flex align-items-center justify-content-between"
                  style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderBottom: '1px solid var(--bs-border-color)' }}
                >
                  <div className="d-flex align-items-center">
                    <span className="badge bg-primary rounded-pill px-2 py-1 fs-11 me-2 fw-bold">#{idx + 1}</span>
                    <span className="fw-bold text-body fs-14">Atributo: {assigned.nombre}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <Form.Check
                      type="switch"
                      id={`switch-obligatorio-${assigned.id_atributo}`}
                      label="Obligatorio"
                      checked={assigned.obligatorio ?? true}
                      onChange={(e) => onToggleObligatorio?.(assigned.id_atributo, e.target.checked)}
                      className="fs-12 fw-semibold text-secondary me-2 d-inline-flex align-items-center"
                    />
                    <Button
                      variant="link"
                      className="p-0 text-danger border-0"
                      onClick={() => triggerDeleteConfirm ? triggerDeleteConfirm({
                        title: '¿Desasociar atributo?',
                        itemName: assigned.nombre,
                        onConfirm: () => onRemoveAttribute(assigned.id_atributo)
                      }) : onRemoveAttribute(assigned.id_atributo)}
                      title="Eliminar atributo del producto"
                                            aria-label="Eliminar atributo del producto"
                    >
                      <IconifyIcon icon="bx:x" className="fs-18 text-danger" />
                    </Button>
                  </div>
                </Card.Header>

                <Card.Body className="p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fs-12 fw-semibold text-secondary">Componentes disponibles (marca para asociar):</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-primary p-0 fs-12 fw-semibold text-decoration-none d-flex align-items-center"
                      onClick={() => onOpenAddComponent(meta)}
                    >
                      <IconifyIcon icon="bx:plus-circle" className="me-1 fs-14" />
                      + Nuevo Componente
                    </Button>
                  </div>

                  <div className="border rounded p-2 bg-light-subtle d-flex flex-wrap gap-2">
                    {componentsList.length === 0 ? (
                      <span className="text-muted fs-12 p-1">No hay componentes disponibles para este atributo.</span>
                    ) : (
                      componentsList.map(comp => {
                        const isSelected = selectedIds.includes(String(comp.id_atributo_componente)) ||
                          selectedIds.includes(String(comp.nombre));
                        return (
                          <div
                            key={comp.id_atributo_componente}
                            className={`p-2 px-3 rounded border d-inline-flex align-items-center gap-2 transition-all cursor-pointer ${
                              isSelected ? 'bg-body border-primary shadow-sm' : 'bg-body-tertiary border-light-subtle opacity-75'
                            }`}
                            style={{ userSelect: 'none' }}
                          >
                            <label
                              htmlFor={`comp_${assigned.id_atributo}_${comp.id_atributo_componente}`}
                              className="d-inline-flex align-items-center gap-2 cursor-pointer mb-0"
                            >
                              <Form.Check.Input
                                type="checkbox"
                                id={`comp_${assigned.id_atributo}_${comp.id_atributo_componente}`}
                                aria-label={`Seleccionar ${comp.nombre} para ${assigned.nombre}`}
                                checked={isSelected}
                                onChange={() => onToggleComponent(assigned.id_atributo, comp.id_atributo_componente)}
                                className="m-0"
                              />
                              <span className={`fs-13 ${isSelected ? 'fw-bold text-body' : 'text-muted'}`}>
                                {comp.nombre}
                              </span>
                            </label>
                            <div className="d-inline-flex align-items-center ms-1 gap-1 border-start ps-1">
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 text-muted hover-text-primary border-0"
                                title="Editar componente"
                                                                aria-label={`Editar componente ${comp.nombre}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenEditComponent(assigned.id_atributo, assigned.nombre, comp);
                                }}
                              >
                                <IconifyIcon icon="bx:edit" className="fs-14" />
                              </Button>
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 text-danger opacity-75 hover-opacity-100 border-0"
                                title="Eliminar componente"
                                                                aria-label={`Eliminar componente ${comp.nombre}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteComponent(assigned.id_atributo, comp.id_atributo_componente);
                                }}
                              >
                                <IconifyIcon icon="bx:trash" className="fs-14" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default AttributesAssignedList;

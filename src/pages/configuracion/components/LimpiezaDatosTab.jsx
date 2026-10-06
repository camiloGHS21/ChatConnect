import { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Form, Button, Alert, Spinner, Modal, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import empresaDatosService from '@/services/empresaDatosService';

const LimpiezaDatosTab = ({ onDataPurged }) => {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [options, setOptions] = useState({
    eliminarMensajesIa: false,
    eliminarClientes: false,
    eliminarPedidos: false,
    eliminarProductos: false,
    eliminarCatalogos: false,
    eliminarTodo: false,
  });

  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const cargarResumen = useCallback(async (signal) => {
    try {
      setLoading(true);
      const data = await empresaDatosService.getResumen(1);
      if (!signal?.aborted) setResumen(data);
    } catch {
      if (signal?.aborted) return;
      setFeedback({ type: 'danger', message: 'Error consultando registros en PostgreSQL.' });
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    cargarResumen(controller.signal);
    return () => controller.abort();
  }, [cargarResumen]);

  const handleToggleOption = (key) => {
    if (key === 'eliminarTodo') {
      const nextVal = !options.eliminarTodo;
      setOptions({
        eliminarTodo: nextVal,
        eliminarMensajesIa: nextVal,
        eliminarClientes: nextVal,
        eliminarPedidos: nextVal,
        eliminarProductos: nextVal,
        eliminarCatalogos: nextVal,
      });
      return;
    }

    setOptions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const allSelected =
        next.eliminarMensajesIa &&
        next.eliminarClientes &&
        next.eliminarPedidos &&
        next.eliminarProductos &&
        next.eliminarCatalogos;
      next.eliminarTodo = allSelected;
      return next;
    });
  };

  const hasAnySelected = Object.entries(options).some(([k, v]) => k !== 'eliminarTodo' && v) || options.eliminarTodo;

  const handleOpenModal = () => {
    setConfirmText('');
    setShowModal(true);
  };

  const handleConfirmPurge = async () => {
    if (confirmText.trim().toUpperCase() !== 'ELIMINAR') return;

    try {
      setActionLoading(true);
      await empresaDatosService.purgarDatos(
        {
          ...options,
          confirmacion: 'ELIMINAR',
        },
        1
      );

      setShowModal(false);
      setFeedback({
        type: 'success',
        message: '¡Purga completada exitosamente! Se eliminaron los datos seleccionados en PostgreSQL.',
      });

      setOptions({
        eliminarMensajesIa: false,
        eliminarClientes: false,
        eliminarPedidos: false,
        eliminarProductos: false,
        eliminarCatalogos: false,
        eliminarTodo: false,
      });

      await cargarResumen();
      if (onDataPurged) onDataPurged();
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Error al ejecutar la purga de datos.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      {feedback.message && (
        <Alert
          variant={feedback.type}
          className="d-flex justify-content-between align-items-center py-2 fs-13 mb-3"
          onClose={() => setFeedback({ type: '', message: '' })}
          dismissible
          closeLabel="Cerrar aviso"
        >
          <span>{feedback.message}</span>
        </Alert>
      )}

      {/* Banner de Advertencia - Zona de Peligro */}
      <Card className="border-danger border-opacity-25 bg-danger bg-opacity-10 mb-3 shadow-none">
        <Card.Body className="p-3 d-flex align-items-start gap-3">
          <div className="bg-danger text-white p-2 rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center">
            <IconifyIcon icon="bx:error-circle" className="fs-22" />
          </div>
          <div>
            <h6 className="fw-bold text-danger mb-1 fs-14">Zona de Seguridad y Vaciado de Datos (PostgreSQL)</h6>
            <p className="text-muted fs-12 mb-0">
              Esta sección permite depurar la base de datos de la empresa de forma irreversible. Puedes elegir
              eliminar únicamente las interacciones de IA y mensajes, los clientes, los productos, o realizar un
              <strong> borrado total</strong> de los datos operativos.
            </p>
          </div>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <div className="text-muted fs-12 mt-2">Consultando registros en base de datos...</div>
        </div>
      ) : (
        <Card className="border shadow-none mb-3">
          <Card.Header className="bg-light py-2 d-flex justify-content-between align-items-center">
            <span className="fw-semibold fs-13 text-dark d-flex align-items-center gap-1">
              <IconifyIcon icon="bx:layer" className="fs-16 text-primary" />
              Selecciona los módulos a vaciar
            </span>
            <Button
              variant="outline-secondary"
              size="sm"
              className="py-0 px-2 fs-11"
              onClick={() => cargarResumen()}
            >
              <IconifyIcon icon="bx:refresh" className="me-1" />
              Actualizar conteos
            </Button>
          </Card.Header>
          <Card.Body className="p-3">
            {/* Master Switch: Eliminar Todo */}
            <div className="p-3 border rounded-3 bg-danger bg-opacity-10 mb-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="fw-bold text-danger fs-14 d-flex align-items-center gap-2">
                  <IconifyIcon icon="bx:bomb" className="fs-18" />
                  Restablecimiento Total de la Empresa (Eliminar TODO)
                </span>
                <small className="text-muted d-block fs-12">
                  Borra todos los pedidos, mensajes, IA, productos, inventario, catálogos y clientes. Conserva la configuración de la empresa y usuarios.
                </small>
              </div>
              <Form.Check
                type="switch"
                id="switch-eliminar-todo"
                checked={options.eliminarTodo}
                onChange={() => handleToggleOption('eliminarTodo')}
                className="fs-18"
              />
            </div>

            <Row className="g-3">
              {/* Opción 1: Mensajes e IA */}
              <Col md={6}>
                <div
                  className={`position-relative p-3 border rounded-3 h-100 cursor-pointer transition-all ${
                    options.eliminarMensajesIa ? 'border-danger bg-danger bg-opacity-10' : 'bg-light'
                  }`}
                >
                  <label htmlFor="purga-eliminarMensajesIa" className="stretched-link"><span className="visually-hidden">Seleccionar mensajes e interacciones de IA</span></label>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="fw-bold text-dark fs-13 d-flex align-items-center gap-2">
                      <IconifyIcon icon="bx:bot" className="fs-18 text-primary" />
                      Mensajes e Interacciones de IA
                    </span>
                    <Form.Check
                      type="checkbox"
                      id="purga-eliminarMensajesIa"
                      checked={options.eliminarMensajesIa}
                      onChange={() => handleToggleOption('eliminarMensajesIa')}
                    />
                  </div>
                  <p className="text-muted fs-12 mb-2">
                    Borra las conversaciones WhatsApp, mensajes entrantes/salientes y registros de procesamiento IA.
                  </p>
                  <div className="d-flex gap-1 flex-wrap">
                    <Badge bg="secondary-subtle" className="text-secondary fs-11">
                      {resumen?.mensajes || 0} mensajes
                    </Badge>
                    <Badge bg="secondary-subtle" className="text-secondary fs-11">
                      {resumen?.conversaciones || 0} chats
                    </Badge>
                    <Badge bg="secondary-subtle" className="text-secondary fs-11">
                      {resumen?.procesamientos_ia || 0} proc. IA
                    </Badge>
                  </div>
                </div>
              </Col>

              {/* Opción 2: Clientes */}
              <Col md={6}>
                <div
                  className={`position-relative p-3 border rounded-3 h-100 cursor-pointer transition-all ${
                    options.eliminarClientes ? 'border-danger bg-danger bg-opacity-10' : 'bg-light'
                  }`}
                >
                  <label htmlFor="purga-eliminarClientes" className="stretched-link"><span className="visually-hidden">Seleccionar clientes y contactos</span></label>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="fw-bold text-dark fs-13 d-flex align-items-center gap-2">
                      <IconifyIcon icon="bx:user-x" className="fs-18 text-warning" />
                      Clientes y Contactos
                    </span>
                    <Form.Check
                      type="checkbox"
                      id="purga-eliminarClientes"
                      checked={options.eliminarClientes}
                      onChange={() => handleToggleOption('eliminarClientes')}
                    />
                  </div>
                  <p className="text-muted fs-12 mb-2">
                    Elimina los contactos y clientes registrados en el módulo de Terceros.
                  </p>
                  <div>
                    <Badge bg="secondary-subtle" className="text-secondary fs-11">
                      {resumen?.clientes || 0} clientes en base de datos
                    </Badge>
                  </div>
                </div>
              </Col>

              {/* Opción 3: Productos e Inventario */}
              <Col md={6}>
                <div
                  className={`position-relative p-3 border rounded-3 h-100 cursor-pointer transition-all ${
                    options.eliminarProductos ? 'border-danger bg-danger bg-opacity-10' : 'bg-light'
                  }`}
                >
                  <label htmlFor="purga-eliminarProductos" className="stretched-link"><span className="visually-hidden">Seleccionar productos, inventario y precios</span></label>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="fw-bold text-dark fs-13 d-flex align-items-center gap-2">
                      <IconifyIcon icon="bx:package" className="fs-18 text-info" />
                      Productos, Inventario y Precios
                    </span>
                    <Form.Check
                      type="checkbox"
                      id="purga-eliminarProductos"
                      checked={options.eliminarProductos}
                      onChange={() => handleToggleOption('eliminarProductos')}
                    />
                  </div>
                  <p className="text-muted fs-12 mb-2">
                    Elimina todos los productos, variantes, atributos, imágenes y existencias. Reinicia la secuencia a 0001.
                  </p>
                  <div>
                    <Badge bg="secondary-subtle" className="text-secondary fs-11">
                      {resumen?.productos || 0} productos registrados
                    </Badge>
                  </div>
                </div>
              </Col>

              {/* Opción 4: Pedidos y Carritos */}
              <Col md={6}>
                <div
                  className={`position-relative p-3 border rounded-3 h-100 cursor-pointer transition-all ${
                    options.eliminarPedidos ? 'border-danger bg-danger bg-opacity-10' : 'bg-light'
                  }`}
                >
                  <label htmlFor="purga-eliminarPedidos" className="stretched-link"><span className="visually-hidden">Seleccionar pedidos y carritos</span></label>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="fw-bold text-dark fs-13 d-flex align-items-center gap-2">
                      <IconifyIcon icon="bx:cart-alt" className="fs-18 text-danger" />
                      Pedidos y Carritos Cotizados
                    </span>
                    <Form.Check
                      type="checkbox"
                      id="purga-eliminarPedidos"
                      checked={options.eliminarPedidos}
                      onChange={() => handleToggleOption('eliminarPedidos')}
                    />
                  </div>
                  <p className="text-muted fs-12 mb-2">
                    Borra las órdenes de pedido, sus líneas con impuestos desglosados y los carritos activos.
                  </p>
                  <div className="d-flex gap-1 flex-wrap">
                    <Badge bg="secondary-subtle" className="text-secondary fs-11">
                      {resumen?.pedidos || 0} pedidos
                    </Badge>
                    <Badge bg="secondary-subtle" className="text-secondary fs-11">
                      {resumen?.carritos || 0} carritos
                    </Badge>
                  </div>
                </div>
              </Col>

              {/* Opción 5: Catálogos Secundarios */}
              <Col md={12}>
                <div
                  className={`position-relative p-3 border rounded-3 cursor-pointer transition-all ${
                    options.eliminarCatalogos ? 'border-danger bg-danger bg-opacity-10' : 'bg-light'
                  }`}
                >
                  <label htmlFor="purga-eliminarCatalogos" className="stretched-link"><span className="visually-hidden">Seleccionar catálogos comerciales</span></label>
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className="fw-bold text-dark fs-13 d-flex align-items-center gap-2">
                      <IconifyIcon icon="bx:purchase-tag" className="fs-18 text-secondary" />
                      Catálogos Comerciales (Categorías y Marcas)
                    </span>
                    <Form.Check
                      type="checkbox"
                      id="purga-eliminarCatalogos"
                      checked={options.eliminarCatalogos}
                      onChange={() => handleToggleOption('eliminarCatalogos')}
                    />
                  </div>
                  <p className="text-muted fs-12 mb-2">
                    Elimina categorías, subcategorías y marcas creadas. (Se recomienda borrar productos primero).
                  </p>
                  <div className="d-flex gap-1 flex-wrap">
                    <Badge bg="secondary-subtle" className="text-secondary fs-11">
                      {resumen?.categorias || 0} categorías
                    </Badge>
                    <Badge bg="secondary-subtle" className="text-secondary fs-11">
                      {resumen?.marcas || 0} marcas
                    </Badge>
                  </div>
                </div>
              </Col>
            </Row>

            <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
              <span className="text-muted fs-12">
                {hasAnySelected
                  ? 'Listo para proceder. Se solicitará confirmación de seguridad.'
                  : 'Selecciona al menos una opción para continuar.'}
              </span>
              <Button
                variant="danger"
                size="sm"
                className="d-flex align-items-center gap-2 px-3 fw-semibold"
                disabled={!hasAnySelected || actionLoading}
                onClick={handleOpenModal}
              >
                <IconifyIcon icon="bx:trash" className="fs-16" />
                {options.eliminarTodo ? 'Ejecutar borrado total de la empresa' : 'Purgar Módulos Seleccionados'}
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modal de Confirmación de Seguridad */}
      <Modal show={showModal} onHide={() => !actionLoading && setShowModal(false)} centered>
        <Modal.Header closeLabel="Cerrar" closeButton={!actionLoading} className="border-danger bg-danger bg-opacity-10">
          <Modal.Title className="fs-15 fw-bold text-danger d-flex align-items-center gap-2">
            <IconifyIcon icon="bx:error-alt" className="fs-20" />
            Confirmación de Purga Permanente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <p className="fs-13 mb-3">
            Esta acción <strong>eliminará de forma irreversible</strong> los registros seleccionados directamente en
            la base de datos PostgreSQL:
          </p>

          <ul className="fs-12 text-muted mb-3">
            {options.eliminarTodo && <li className="text-danger fw-bold">Borrado completo de todos los datos operativos de la empresa</li>}
            {options.eliminarMensajesIa && !options.eliminarTodo && <li>Mensajes, conversaciones y procesamientos de IA</li>}
            {options.eliminarClientes && !options.eliminarTodo && <li>Clientes y contactos registrados</li>}
            {options.eliminarProductos && !options.eliminarTodo && <li>Productos, variantes, existencias e inventario</li>}
            {options.eliminarPedidos && !options.eliminarTodo && <li>Órdenes de pedido, detalles con impuestos y carritos</li>}
            {options.eliminarCatalogos && !options.eliminarTodo && <li>Categorías, subcategorías y marcas</li>}
          </ul>

          <div className="p-2 border rounded bg-light mb-3">
            <label htmlFor="confirmar-purga" className="fs-12 fw-semibold text-dark mb-1">
              Escribe la palabra <span className="text-danger font-monospace">ELIMINAR</span> para confirmar:
            </label>
            <Form.Control
              id="confirmar-purga"
              type="text"
              size="sm"
              placeholder="ELIMINAR"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={actionLoading}
              className="font-monospace text-uppercase"
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="py-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowModal(false)}
            disabled={actionLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={confirmText.trim().toUpperCase() !== 'ELIMINAR' || actionLoading}
            onClick={handleConfirmPurge}
            className="d-flex align-items-center gap-1"
          >
            {actionLoading ? (
              <>
                <Spinner size="sm" animation="border" />
                <span>Purgando datos...</span>
              </>
            ) : (
              <>
                <IconifyIcon icon="bx:trash" />
                <span>Confirmar y Purgar</span>
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LimpiezaDatosTab;

import { useState } from 'react';
import { Row, Col, Card, CardBody, CardHeader, CardTitle, Badge, Button, Form, Modal, Nav, Table } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import {
  CHATCONNECT_CATEGORIAS,
  CHATCONNECT_PRODUCTOS,
} from '@/assets/data/chatconnect-data';

const CatalogoPage = () => {
  const [products, setProducts] = useState(CHATCONNECT_PRODUCTOS);
  const [activeCategory, setActiveCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'critical' | 'in_stock'
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modales
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Formulario de Edición / Ajuste de Stock
  const [editFormData, setEditFormData] = useState({
    id: null,
    nombre: '',
    marca: '',
    categoria_id: 1,
    categoria: '',
    precio: 0,
    existencia: 0,
    reservado: 0,
    activo: true,
  });

  // Formulario de Nuevo Producto (RF-20)
  const [newFormData, setNewFormData] = useState({
    sku: `SKU-FER-${Date.now().toString().slice(-4)}`,
    nombre: '',
    marca: 'DeWalt',
    categoria_id: 1,
    precio: 150000,
    existencia: 10,
    impuesto: 'IVA 19%',
    imagen: 'bxs:wrench',
  });

  // Filtrado de productos
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === 'all' || p.categoria_id === parseInt(activeCategory);
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.marca.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'critical' && p.disponible <= 5) ||
      (stockFilter === 'in_stock' && p.disponible > 5);

    return matchesCategory && matchesSearch && matchesStock;
  });

  const totalProductos = products.length;
  const stockCriticoCount = products.filter((p) => p.disponible <= 5).length;
  const totalStockFisico = products.reduce((acc, p) => acc + p.existencia, 0);
  const totalReservados = products.reduce((acc, p) => acc + p.reservado, 0);

  // Abrir Ficha Técnica
  const handleOpenDetail = (prod) => {
    setSelectedProduct(prod);
    setShowDetailModal(true);
  };

  // Abrir Edición / Ajuste de Inventario
  const handleOpenEdit = (prod) => {
    setEditFormData({
      id: prod.id,
      nombre: prod.nombre,
      marca: prod.marca,
      categoria_id: prod.categoria_id,
      categoria: prod.categoria,
      precio: prod.precio,
      existencia: prod.existencia,
      reservado: prod.reservado,
      activo: prod.activo,
    });
    setShowEditModal(true);
  };

  // Guardar Edición / Ajuste de Stock (RF-07 y RF-20)
  const handleSaveEdit = (e) => {
    e.preventDefault();
    const catObj = CHATCONNECT_CATEGORIAS.find((c) => c.id === parseInt(editFormData.categoria_id));
    const nuevaExistencia = parseInt(editFormData.existencia) || 0;
    const nuevoReservado = editFormData.reservado || 0;
    const nuevoDisponible = Math.max(0, nuevaExistencia - nuevoReservado);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === editFormData.id
          ? {
              ...p,
              nombre: editFormData.nombre,
              marca: editFormData.marca,
              categoria_id: parseInt(editFormData.categoria_id),
              categoria: catObj ? catObj.nombre : p.categoria,
              precio: parseInt(editFormData.precio) || 0,
              existencia: nuevaExistencia,
              disponible: nuevoDisponible,
              activo: editFormData.activo,
            }
          : p
      )
    );

    if (selectedProduct && selectedProduct.id === editFormData.id) {
      setSelectedProduct((prev) => ({
        ...prev,
        nombre: editFormData.nombre,
        marca: editFormData.marca,
        categoria_id: parseInt(editFormData.categoria_id),
        categoria: catObj ? catObj.nombre : prev.categoria,
        precio: parseInt(editFormData.precio) || 0,
        existencia: nuevaExistencia,
        disponible: nuevoDisponible,
        activo: editFormData.activo,
      }));
    }

    setShowEditModal(false);
  };

  // Crear Nuevo Producto (RF-20)
  const handleCreateProduct = (e) => {
    e.preventDefault();
    const catObj = CHATCONNECT_CATEGORIAS.find((c) => c.id === parseInt(newFormData.categoria_id));
    const existenciaInicial = parseInt(newFormData.existencia) || 0;

    const newProd = {
      id: Date.now(),
      sku: newFormData.sku.trim(),
      nombre: newFormData.nombre.trim(),
      marca: newFormData.marca.trim(),
      categoria_id: parseInt(newFormData.categoria_id),
      categoria: catObj ? catObj.nombre : 'General',
      precio: parseInt(newFormData.precio) || 0,
      impuesto: 'IVA 19%',
      existencia: existenciaInicial,
      reservado: 0,
      disponible: existenciaInicial,
      activo: true,
      imagen: newFormData.imagen || 'bxs:wrench',
    };

    setProducts((prev) => [newProd, ...prev]);
    setShowCreateModal(false);

    // Reset form
    setNewFormData({
      sku: `SKU-FER-${Date.now().toString().slice(-4)}`,
      nombre: '',
      marca: 'DeWalt',
      categoria_id: 1,
      precio: 150000,
      existencia: 10,
      impuesto: 'IVA 19%',
      imagen: 'bxs:wrench',
    });
  };

  // Alternar estado activo / inactivo
  const handleToggleActive = (id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, activo: !p.activo } : p))
    );
  };

  return (
    <>
      <PageMetaData title="Administración de Catálogo - ChatConnect" />
      <PageBreadcrumb title="Catálogo de Productos" subName="Administración de Catálogo e Inventario (RF-20)" />

      {/* KPI Cards de Gestión de Inventario (RF-07, RF-20) */}
      <Row className="g-3 mb-3">
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <CardBody className="d-flex align-items-center gap-3">
              <div className="avatar-md rounded bg-primary-subtle text-primary flex-centered">
                <IconifyIcon icon="iconamoon:category-duotone" className="fs-24" />
              </div>
              <div>
                <h4 className="fw-bold mb-0">{totalProductos}</h4>
                <span className="text-muted fs-12">Referencias en Catálogo</span>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <CardBody className="d-flex align-items-center gap-3">
              <div className="avatar-md rounded bg-success-subtle text-success flex-centered">
                <IconifyIcon icon="mdi:package-variant-closed" className="fs-24" />
              </div>
              <div>
                <h4 className="fw-bold mb-0">{totalStockFisico} uds</h4>
                <span className="text-muted fs-12">Existencia Física en Bodega</span>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <CardBody className="d-flex align-items-center gap-3">
              <div className="avatar-md rounded bg-warning-subtle text-warning flex-centered">
                <IconifyIcon icon="bxl:whatsapp" className="fs-24" />
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-warning">{totalReservados} uds</h4>
                <span className="text-muted fs-12">Reservados en Carritos WhatsApp</span>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm">
            <CardBody className="d-flex align-items-center gap-3">
              <div className="avatar-md rounded bg-danger-subtle text-danger flex-centered">
                <IconifyIcon icon="mdi:alert-circle-outline" className="fs-24" />
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-danger">{stockCriticoCount}</h4>
                <span className="text-muted fs-12">Stock Crítico (≤ 5 unidades)</span>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Barra de Herramientas y Filtros Administrativos */}
      <Card className="border-0 shadow-sm mb-3">
        <CardBody className="p-3">
          <Row className="g-2 align-items-center justify-content-between">
            <Col lg={6}>
              <Nav
                variant="pills"
                activeKey={activeCategory}
                onSelect={(k) => setActiveCategory(k)}
                className="gap-1 flex-nowrap overflow-auto py-1"
              >
                <Nav.Item>
                  <Nav.Link eventKey="all" className="px-3 py-1 fs-12">
                    Todas ({products.length})
                  </Nav.Link>
                </Nav.Item>
                {CHATCONNECT_CATEGORIAS.map((cat) => (
                  <Nav.Item key={cat.id}>
                    <Nav.Link eventKey={String(cat.id)} className="px-3 py-1 fs-12 text-nowrap">
                      {cat.nombre}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </Col>

            <Col lg={6}>
              <div className="d-flex flex-wrap align-items-center justify-content-end gap-2">
                <div className="search-bar flex-grow-1" style={{ maxWidth: 220 }}>
                  <Form.Control
                    type="text"
                    placeholder="Buscar SKU, producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control-sm"
                  />
                </div>

                <div className="btn-group btn-group-sm">
                  <Button
                    variant={stockFilter === 'all' ? 'secondary' : 'outline-light'}
                    className={stockFilter === 'all' ? 'text-white' : 'text-dark'}
                    onClick={() => setStockFilter('all')}
                    title="Todos los estados de stock"
                  >
                    Todos
                  </Button>
                  <Button
                    variant={stockFilter === 'critical' ? 'danger' : 'outline-light'}
                    className={stockFilter === 'critical' ? 'text-white' : 'text-dark'}
                    onClick={() => setStockFilter('critical')}
                    title="Productos con stock crítico"
                  >
                    Crítico
                  </Button>
                </div>

                <div className="btn-group btn-group-sm">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'outline-light'}
                    className={viewMode === 'grid' ? 'text-white' : 'text-dark'}
                    onClick={() => setViewMode('grid')}
                    title="Vista Cuadrícula"
                  >
                    <IconifyIcon icon="bx:grid-alt" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'primary' : 'outline-light'}
                    className={viewMode === 'table' ? 'text-white' : 'text-dark'}
                    onClick={() => setViewMode('table')}
                    title="Vista Lista"
                  >
                    <IconifyIcon icon="bx:list-ul" />
                  </Button>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="d-flex align-items-center gap-1"
                  onClick={() => setShowCreateModal(true)}
                >
                  <IconifyIcon icon="bx:plus" className="fs-16" />
                  <span>Nuevo Producto</span>
                </Button>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Vista Cuadrícula (Cards de Gestión Administrativa) */}
      {viewMode === 'grid' ? (
        <Row className="g-3">
          {filteredProducts.map((prod) => {
            const isCritical = prod.disponible <= 5;

            return (
              <Col sm={6} md={4} xl={3} key={prod.id}>
                <Card className="border-0 shadow-sm h-100 product-card">
                  <CardBody className="d-flex flex-column justify-content-between p-3">
                    <div>
                      {/* Cabecera del Producto */}
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge bg="light" className="text-muted font-monospace fs-11">
                          {prod.sku}
                        </Badge>
                        <div className="d-flex align-items-center gap-1">
                          <Badge
                            bg={isCritical ? 'danger-subtle' : 'success-subtle'}
                            className={`fs-11 ${isCritical ? 'text-danger' : 'text-success'}`}
                          >
                            {isCritical ? `${prod.disponible} en stock` : `${prod.disponible} disponibles`}
                          </Badge>
                          <Badge
                            bg={prod.activo ? 'primary-subtle' : 'secondary-subtle'}
                            className={`fs-11 ${prod.activo ? 'text-primary' : 'text-secondary'}`}
                          >
                            {prod.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      </div>

                      {/* Icono / Ilustración del Producto */}
                      <div className="py-3 text-center bg-light rounded mb-3 position-relative">
                        <IconifyIcon icon={prod.imagen || 'bxs:wrench'} className="fs-48 text-primary" />
                        <div className="fs-11 fw-semibold text-secondary mt-1">{prod.marca}</div>
                      </div>

                      {/* Nombre y Categoría */}
                      <h6 className="fw-bold text-dark mb-1 text-truncate" title={prod.nombre}>
                        {prod.nombre}
                      </h6>
                      <span className="text-muted fs-11 d-block mb-2">{prod.categoria}</span>

                      {/* Desglose de Stock RF-07 */}
                      <div className="bg-light p-2 rounded mb-2 fs-11">
                        <div className="d-flex justify-content-between text-muted mb-1">
                          <span>Existencia física:</span>
                          <strong className="text-dark">{prod.existencia} uds</strong>
                        </div>
                        <div className="d-flex justify-content-between text-muted">
                          <span>Reservado carritos WhatsApp:</span>
                          <strong className="text-warning">{prod.reservado} uds</strong>
                        </div>
                      </div>
                    </div>

                    {/* Precios y Botones Administrativos */}
                    <div className="pt-2 border-top">
                      <div className="d-flex justify-content-between align-items-baseline mb-2">
                        <span className="fs-12 text-muted">{prod.impuesto}</span>
                        <h5 className="fw-bold text-primary mb-0">
                          ${prod.precio.toLocaleString('es-CO')} COP
                        </h5>
                      </div>

                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="w-50 d-flex align-items-center justify-content-center gap-1"
                          onClick={() => handleOpenDetail(prod)}
                        >
                          <IconifyIcon icon="bx:show" className="fs-15" />
                          <span>Ficha</span>
                        </Button>
                        <Button
                          variant="soft-primary"
                          size="sm"
                          className="w-50 d-flex align-items-center justify-content-center gap-1"
                          onClick={() => handleOpenEdit(prod)}
                        >
                          <IconifyIcon icon="bx:edit" className="fs-15" />
                          <span>Editar</span>
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        /* Vista Tabla Administrativa */
        <Card className="border-0 shadow-sm">
          <CardBody className="p-0">
            <div className="table-responsive">
              <Table hover className="table-centered align-middle mb-0">
                <thead className="table-light fs-12 text-muted">
                  <tr>
                    <th>SKU</th>
                    <th>Producto & Marca</th>
                    <th>Categoría</th>
                    <th>Precio Venta COP</th>
                    <th>Existencia Física</th>
                    <th>Reservado Carritos</th>
                    <th>Disponible Real</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id}>
                      <td className="font-monospace text-muted fs-12">{prod.sku}</td>
                      <td>
                        <div className="fw-semibold text-dark">{prod.nombre}</div>
                        <span className="badge bg-light text-muted fs-11">{prod.marca}</span>
                      </td>
                      <td className="text-muted fs-12">{prod.categoria}</td>
                      <td className="fw-bold text-dark fs-13">
                        ${prod.precio.toLocaleString('es-CO')} COP
                      </td>
                      <td className="text-center font-monospace">{prod.existencia} uds</td>
                      <td className="text-center font-monospace text-warning">{prod.reservado} uds</td>
                      <td>
                        <span className={`fw-bold ${prod.disponible <= 5 ? 'text-danger' : 'text-success'}`}>
                          {prod.disponible} uds
                        </span>
                      </td>
                      <td>
                        <Badge
                          bg={prod.activo ? 'success-subtle' : 'secondary-subtle'}
                          className={prod.activo ? 'text-success' : 'text-secondary'}
                        >
                          {prod.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end align-items-center gap-1">
                          <Button
                            variant="soft-secondary"
                            size="sm"
                            className="btn-icon rounded-circle"
                            onClick={() => handleOpenDetail(prod)}
                            title="Ficha Técnica"
                          >
                            <IconifyIcon icon="bx:show" className="fs-16" />
                          </Button>
                          <Button
                            variant="soft-primary"
                            size="sm"
                            className="btn-icon rounded-circle"
                            onClick={() => handleOpenEdit(prod)}
                            title="Editar Producto y Ajustar Stock"
                          >
                            <IconifyIcon icon="bx:edit" className="fs-16" />
                          </Button>
                          <Button
                            variant={prod.activo ? 'soft-success' : 'soft-warning'}
                            size="sm"
                            className="btn-icon rounded-circle"
                            onClick={() => handleToggleActive(prod.id)}
                            title={prod.activo ? 'Desactivar en Catálogo' : 'Activar en Catálogo'}
                          >
                            <IconifyIcon icon={prod.activo ? 'bx:check' : 'bx:x'} className="fs-16" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Modal Ficha Técnica del Producto (RF-20) */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-16">Ficha Técnica y Trazabilidad</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <div>
              <div className="text-center p-3 bg-light rounded mb-3">
                <IconifyIcon icon={selectedProduct.imagen || 'bxs:wrench'} className="fs-56 text-primary" />
                <h5 className="fw-bold text-dark mt-2 mb-0">{selectedProduct.nombre}</h5>
                <span className="text-muted fs-12">Marca: {selectedProduct.marca} | {selectedProduct.categoria}</span>
              </div>

              <Row className="g-2 mb-3">
                <Col xs={6}>
                  <div className="p-2 border rounded">
                    <small className="text-muted d-block">Código SKU</small>
                    <span className="font-monospace fw-bold">{selectedProduct.sku}</span>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="p-2 border rounded">
                    <small className="text-muted d-block">Precio de Venta</small>
                    <span className="fw-bold text-primary">
                      ${selectedProduct.precio.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="p-2 border rounded text-center">
                    <small className="text-muted d-block">Existencia Física</small>
                    <span className="fw-bold text-dark fs-14">{selectedProduct.existencia}</span>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="p-2 border rounded text-center">
                    <small className="text-muted d-block">Reservado Carrito</small>
                    <span className="fw-bold text-warning fs-14">{selectedProduct.reservado}</span>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="p-2 border rounded text-center">
                    <small className="text-muted d-block">Disponible Real</small>
                    <span className="fw-bold text-success fs-14">{selectedProduct.disponible}</span>
                  </div>
                </Col>
              </Row>

              <div className="alert alert-info border fs-12 mb-0">
                <strong>Regla de Negocio SRS (RF-07):</strong> El stock disponible para pedidos en Meta Cloud API se calcula mediante la fórmula: <code>disponible = existencia - reservado</code>.
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowDetailModal(false)}>
            Cerrar
          </Button>
          {selectedProduct && (
            <Button
              variant="primary"
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={() => {
                setShowDetailModal(false);
                handleOpenEdit(selectedProduct);
              }}
            >
              <IconifyIcon icon="bx:edit" />
              <span>Editar / Ajustar Stock</span>
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal Editar Producto y Ajustar Stock (RF-20) */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Form onSubmit={handleSaveEdit}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold fs-16">Editar Producto & Ajustar Inventario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fs-12 fw-semibold">Nombre del Producto</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={editFormData.nombre}
                    onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="fs-12 fw-semibold">Marca</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={editFormData.marca}
                    onChange={(e) => setEditFormData({ ...editFormData, marca: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="fs-12 fw-semibold">Categoría</Form.Label>
                  <Form.Select
                    value={editFormData.categoria_id}
                    onChange={(e) => setEditFormData({ ...editFormData, categoria_id: e.target.value })}
                  >
                    {CHATCONNECT_CATEGORIAS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="fs-12 fw-semibold">Precio de Venta COP (IVA Inc.)</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min={0}
                    step={100}
                    value={editFormData.precio}
                    onChange={(e) => setEditFormData({ ...editFormData, precio: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="fs-12 fw-semibold">Existencia Física en Bodega</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min={0}
                    value={editFormData.existencia}
                    onChange={(e) => setEditFormData({ ...editFormData, existencia: e.target.value })}
                  />
                  <Form.Text className="text-muted fs-11">
                    Reservado actual: {editFormData.reservado} uds.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Check
                  type="switch"
                  id="switch-activo"
                  label="Producto activo en catálogo de WhatsApp Meta Cloud API"
                  checked={editFormData.activo}
                  onChange={(e) => setEditFormData({ ...editFormData, activo: e.target.checked })}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Nuevo Producto (RF-20) */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Form onSubmit={handleCreateProduct}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold fs-16">Dar de Alta Nuevo Producto</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="fs-12 fw-semibold">Código SKU</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={newFormData.sku}
                    onChange={(e) => setNewFormData({ ...newFormData, sku: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="fs-12 fw-semibold">Marca</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={newFormData.marca}
                    onChange={(e) => setNewFormData({ ...newFormData, marca: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fs-12 fw-semibold">Nombre del Producto</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Ej. Pulidora Angular 7 Pulgadas 2200W"
                    value={newFormData.nombre}
                    onChange={(e) => setNewFormData({ ...newFormData, nombre: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="fs-12 fw-semibold">Categoría</Form.Label>
                  <Form.Select
                    value={newFormData.categoria_id}
                    onChange={(e) => setNewFormData({ ...newFormData, categoria_id: e.target.value })}
                  >
                    {CHATCONNECT_CATEGORIAS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="fs-12 fw-semibold">Precio de Venta COP</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min={0}
                    step={100}
                    value={newFormData.precio}
                    onChange={(e) => setNewFormData({ ...newFormData, precio: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="fs-12 fw-semibold">Existencia Física Inicial</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min={0}
                    value={newFormData.existencia}
                    onChange={(e) => setNewFormData({ ...newFormData, existencia: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="fs-12 fw-semibold">Impuesto Aplicable</Form.Label>
                  <Form.Control type="text" readOnly value="IVA 19% Incluido" />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Crear Producto
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default CatalogoPage;

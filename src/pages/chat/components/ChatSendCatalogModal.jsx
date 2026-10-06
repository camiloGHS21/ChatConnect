import { useState, useEffect } from 'react';
import { Modal, Button, Nav, Spinner, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import productoService from '@/services/productoService';
import ChatSendSingleProductTab from './ChatSendSingleProductTab';
import ChatSendCategoriesTab from './ChatSendCategoriesTab';

const ChatSendCatalogModal = ({ show, onHide, activeChat, onCatalogSent }) => {
  const [tab, setTab] = useState('producto');
  const [catalogo, setCatalogo] = useState({ categorias: [], productos: [] });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSku, setSelectedSku] = useState('');
  const [prodText, setProdText] = useState('');
  const [selectedCatIds, setSelectedCatIds] = useState([]);
  const [catTitle, setCatTitle] = useState('');
  const [catText, setCatText] = useState('');

  const isVentanaActiva = !!activeChat?.ventana_servicio?.activa;

  useEffect(() => {
    if (!show) return;
    setError(null);
    setLoading(true);
    productoService.getCatalogoDisponibleChat()
      .then(d => {
        setCatalogo(d || { categorias: [], productos: [] });
        if (d?.productos?.length) setSelectedSku(d.productos[0].codigo_interno);
        if (d?.categorias?.length) setSelectedCatIds([d.categorias[0].id]);
      })
      .catch(() => setError('Error al consultar productos para WhatsApp'))
      .finally(() => setLoading(false));
  }, [show]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!activeChat?.id) return setError('No hay conversación seleccionada');
    if (!isVentanaActiva) return setError('El cliente debe escribir primero para poder responder.');

    setSending(true);
    setError(null);
    try {
      let res;
      if (tab === 'producto') {
        if (!selectedSku) throw new Error('Selecciona un producto');
        res = await productoService.enviarProductoChat(activeChat.id, selectedSku, prodText);
      } else {
        if (!selectedCatIds.length) throw new Error('Selecciona al menos una categoría');
        res = await productoService.enviarCategoriasChat(activeChat.id, selectedCatIds, catTitle, catText);
      }

      onCatalogSent({
        id: res.id || Date.now(),
        emisor: 'asesor',
        tipo: 'interactive',
        texto: res.texto || (tab === 'producto' ? `📦 Producto enviado: ${selectedSku}` : `📦 Catálogo enviado`),
        hora: res.hora || new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      });
      onHide();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al enviar por WhatsApp';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal show={show} onHide={() => !sending && onHide()} centered size="lg">
      <Modal.Header closeLabel="Cerrar" closeButton={!sending} className="bg-body-tertiary py-2">
        <div className="d-flex align-items-center gap-2">
          <div className="avatar-xs rounded bg-success text-white d-flex align-items-center justify-content-center p-2">
            <IconifyIcon icon="bxl:whatsapp" className="fs-18" />
          </div>
          <div>
            <Modal.Title className="fs-15 fw-bold mb-0">Enviar Productos por WhatsApp</Modal.Title>
            <span className="fs-11 text-muted">Cliente: {activeChat?.nombre} ({activeChat?.whatsapp})</span>
          </div>
        </div>
      </Modal.Header>

      <form onSubmit={handleSend}>
        <Modal.Body className="fs-13">
          {error && <Alert variant="danger" className="py-2 fs-12 mb-3">{error}</Alert>}

          <Nav variant="pills" className="nav-justified mb-3 fs-13">
            <Nav.Item>
              <Nav.Link active={tab === 'producto'} onClick={() => setTab('producto')} className="cursor-pointer py-1">
                <IconifyIcon icon="bx:package" className="me-1" /> 1 Producto Individual
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link active={tab === 'categorias'} onClick={() => setTab('categorias')} className="cursor-pointer py-1">
                <IconifyIcon icon="bx:category" className="me-1" /> Por Categoría(s) Multi-Producto
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {loading ? (
            <div className="text-center py-4"><Spinner animation="border" variant="success" size="sm" /><p className="text-muted mt-2 fs-12">Cargando...</p></div>
          ) : tab === 'producto' ? (
            <ChatSendSingleProductTab productos={catalogo.productos} selectedSku={selectedSku} onSelectSku={setSelectedSku}
              customText={prodText} onCustomTextChange={setProdText} disabled={sending || !isVentanaActiva} />
          ) : (
            <ChatSendCategoriesTab categorias={catalogo.categorias} selectedCatIds={selectedCatIds}
              onToggleCatId={(id) => setSelectedCatIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
              onSelectAll={() => setSelectedCatIds(prev => prev.length === catalogo.categorias.length ? [] : catalogo.categorias.map(c => c.id))}
              customTitle={catTitle} onCustomTitleChange={setCatTitle} customText={catText} onCustomTextChange={setCatText}
              disabled={sending || !isVentanaActiva} />
          )}
        </Modal.Body>

        <Modal.Footer className="bg-body-tertiary py-2">
          <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={sending}>Cancelar</Button>
          <Button variant="success" size="sm" type="submit" disabled={sending || loading || !isVentanaActiva || (tab === 'producto' ? !selectedSku : !selectedCatIds.length)} className="d-flex align-items-center gap-1 shadow-sm">
            {sending ? <><Spinner size="sm" className="me-1" /> Enviando...</> : (
              <><IconifyIcon icon="bxl:whatsapp" className="fs-16" /> {tab === 'producto' ? 'Enviar Producto' : `Enviar ${selectedCatIds.length} Categoría(s)`}</>
            )}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default ChatSendCatalogModal;

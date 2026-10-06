import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import productoService from '@/services/productoService';

const ChatSendCollectionModal = ({ show, onHide, activeChat, onCollectionSent }) => {
  const [colecciones, setColecciones] = useState([]);
  const [selectedColId, setSelectedColId] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('product_list');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!show) return;
    setError(null);
    const load = async () => {
      setLoading(true);
      try {
        const res = await productoService.getColecciones();
        const cols = res?.colecciones || [];
        setColecciones(cols);
        if (cols.length > 0) setSelectedColId(cols[0].id);
      } catch {
        setError('Error al consultar colecciones en Meta');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [show]);

  const selectedCol = colecciones.find(c => c.id === selectedColId) || colecciones[0];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!activeChat?.whatsapp) return setError('No hay número de WhatsApp válido');
    setSending(true);
    setError(null);
    try {
      await productoService.enviarColeccionWhatsApp({
        telefono: activeChat.whatsapp,
        coleccionId: selectedCol?.id,
        nombreColeccion: selectedCol?.name || 'Catálogo Oficial',
        tipoMensaje,
        conversacionId: activeChat.id,
      });

      onCollectionSent({
        id: Date.now(),
        emisor: 'asesor',
        tipo: 'interactive',
        texto: `📦 Colección enviada por WhatsApp: "${selectedCol?.name || 'Catálogo'}" (${selectedCol?.product_count || 0} productos)`,
        hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      });
      onHide();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al enviar por WhatsApp');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal show={show} onHide={() => !sending && onHide()} centered>
      <Modal.Header closeLabel="Cerrar" closeButton={!sending} className="bg-body-tertiary">
        <div className="d-flex align-items-center gap-2">
          <div className="avatar-xs rounded bg-success text-white d-flex align-items-center justify-content-center p-2">
            <IconifyIcon icon="bxl:whatsapp" className="fs-18" />
          </div>
          <div>
            <Modal.Title className="fs-15 fw-bold mb-0">Enviar Colección a WhatsApp</Modal.Title>
            <span className="fs-11 text-muted">Cliente: {activeChat?.nombre} ({activeChat?.whatsapp})</span>
          </div>
        </div>
      </Modal.Header>
      <Form onSubmit={handleSend}>
        <Modal.Body className="fs-13">
          {error && <Alert variant="danger" className="py-2 fs-12">{error}</Alert>}
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="success" size="sm" />
              <p className="text-muted mt-2 fs-12">Cargando colecciones desde Meta...</p>
            </div>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Seleccionar Colección de Meta</Form.Label>
                <Form.Select value={selectedColId} onChange={e => setSelectedColId(e.target.value)} disabled={sending}>
                  {colecciones.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.product_count} productos)
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {selectedCol && (
                <div className="p-2 mb-3 bg-body-tertiary rounded border d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted fs-11 d-block">ID en el catálogo de Meta:</span>
                    <code className="text-body fs-12">{selectedCol.id}</code>
                  </div>
                  <Badge bg="success-subtle" className="text-success border border-success-subtle">
                    {selectedCol.product_count} productos
                  </Badge>
                </div>
              )}
              <Form.Group className="mb-2">
                <Form.Label className="fw-semibold">Formato Interactivo</Form.Label>
                <div className="d-flex gap-3">
                  <Form.Check type="radio" id="f-list" name="fType" label="Multi-Producto (Sección)"
                    checked={tipoMensaje === 'product_list'} onChange={() => setTipoMensaje('product_list')} />
                  <Form.Check type="radio" id="f-cat" name="fType" label="Catálogo Completo"
                    checked={tipoMensaje === 'catalog_message'} onChange={() => setTipoMensaje('catalog_message')} />
                </div>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-body-tertiary">
          <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={sending}>Cancelar</Button>
          <Button variant="success" size="sm" type="submit" disabled={sending || loading || !selectedColId}
            className="d-flex align-items-center gap-1 shadow-sm">
            {sending ? <><Spinner size="sm" className="me-1" /> Enviando...</> : (
              <><IconifyIcon icon="bxl:whatsapp" className="fs-16" /> Enviar al Cliente</>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ChatSendCollectionModal;

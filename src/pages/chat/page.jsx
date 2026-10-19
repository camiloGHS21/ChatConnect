import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useSearchParams, useLocation } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import productoService from '@/services/productoService';
import ChatSidebar from './components/ChatSidebar';
import ChatHeader from './components/ChatHeader';
import ChatMessagesList from './components/ChatMessagesList';
import ChatInputBar from './components/ChatInputBar';
import ChatSendCatalogModal from './components/ChatSendCatalogModal';

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [conversaciones, setConversaciones] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [showSendCatalog, setShowSendCatalog] = useState(false);
  const [togglingMode, setTogglingMode] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);


  const targetClienteId =
    searchParams.get('cliente_id') ||
    searchParams.get('clienteId') ||
    location.state?.clienteId ||
    location.state?.cliente_id ||
    location.state?.cliente?.id;

  const targetChatId =
    searchParams.get('chat_id') ||
    searchParams.get('id');

  const targetWhatsapp =
    searchParams.get('whatsapp') ||
    location.state?.whatsapp ||
    location.state?.cliente?.whatsapp;

  const targetNombre =
    searchParams.get('nombre') ||
    location.state?.nombre ||
    location.state?.cliente?.nombre;

  const orderAction = searchParams.get('action');
  const pedidoNumero = searchParams.get('pedido');

  useEffect(() => {
    if (orderAction === 'despachado' && pedidoNumero) {
      setInputText((prev) => prev || `¡Hola! Te informamos que tu pedido ${pedidoNumero} ha sido despachado 🚚📦.`);
    }
  }, [orderAction, pedidoNumero]);

  const matchConversation = useCallback(
    (list) => {
      if (!Array.isArray(list) || list.length === 0) return null;

      if (targetChatId) {
        const byId = list.find((c) => String(c.id) === String(targetChatId));
        if (byId) return byId;
      }

      if (targetClienteId) {
        const byCliente = list.find((c) => String(c.cliente_id) === String(targetClienteId));
        if (byCliente) return byCliente;
      }

      if (targetWhatsapp) {
        const cleanTarget = String(targetWhatsapp).replace(/\D/g, '');
        if (cleanTarget.length >= 7) {
          const byPhone = list.find((c) => {
            const cleanConv = String(c.whatsapp || '').replace(/\D/g, '');
            return cleanConv.endsWith(cleanTarget) || cleanTarget.endsWith(cleanConv);
          });
          if (byPhone) return byPhone;
        }
      }

      if (targetNombre && targetNombre.trim()) {
        const normTarget = targetNombre.toLowerCase().trim();
        const byName = list.find((c) => {
          const normConv = (c.nombre || '').toLowerCase().trim();
          return normConv.includes(normTarget) || normTarget.includes(normConv);
        });
        if (byName) return byName;
      }

      return null;
    },
    [targetChatId, targetClienteId, targetWhatsapp, targetNombre]
  );

  const fetchConversaciones = useCallback(
    async (signal) => {
      try {
        let convs = await productoService.getConversaciones();
        if (signal?.aborted) return;
        if (!Array.isArray(convs)) convs = [];

        let selected = matchConversation(convs);

        if (!selected && targetClienteId) {
          try {
            const nuevaConv = await productoService.obtenerOCrearConversacion(targetClienteId);
            if (nuevaConv && nuevaConv.id) {
              const alreadyInList = convs.some((c) => c.id === nuevaConv.id);
              if (!alreadyInList) {
                convs = [nuevaConv, ...convs];
              }
              selected = nuevaConv;
            }
          } catch (err) {
            console.warn('No se pudo obtener/crear conversación para el cliente:', err);
          }
        }

        setConversaciones(convs);

        if (selected) {
          setActiveChatId(selected.id);
        } else {
          setActiveChatId((prev) => prev || (convs[0] ? convs[0].id : null));
        }
      } catch {
        if (!signal?.aborted) setConversaciones([]);
      }
    },
    [matchConversation, targetClienteId]
  );

  const fetchMensajes = useCallback(async (convId, signal) => {
    if (!convId) return;
    try {
      const msgs = await productoService.getMensajesConversacion(convId);
      if (signal?.aborted) return;
      setMensajes(Array.isArray(msgs) ? msgs : []);
    } catch {
      if (!signal?.aborted) setMensajes([]);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchConversaciones(controller.signal);
    return () => controller.abort();
  }, [fetchConversaciones]);

  useEffect(() => {
    if (conversaciones.length === 0) return;
    if (targetChatId || targetClienteId || targetWhatsapp || targetNombre) {
      const matched = matchConversation(conversaciones);
      if (matched) {
        setActiveChatId((prev) => (prev !== matched.id ? matched.id : prev));
      }
    }
  }, [conversaciones, matchConversation, targetChatId, targetClienteId, targetWhatsapp, targetNombre]);

  useEffect(() => {
    const controller = new AbortController();
    if (activeChatId) fetchMensajes(activeChatId, controller.signal);
    return () => controller.abort();
  }, [activeChatId, fetchMensajes]);

  // Polling periódico para recibir nuevos mensajes del cliente
  useEffect(() => {
    if (!activeChatId) return;
    const interval = setInterval(() => {
      fetchMensajes(activeChatId);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeChatId, fetchMensajes]);

  const activeChat = conversaciones.find((c) => c.id === activeChatId) || conversaciones[0];


  const handleToggleMode = async () => {
    if (!activeChat) return;
    const newMode = activeChat.modo === 'ia' ? 'humano' : 'ia';
    setTogglingMode(true);
    try {
      await productoService.cambiarModoConversacion(activeChat.id, newMode);
      setConversaciones((prev) => prev.map((c) => (c.id === activeChat.id ? { ...c, modo: newMode } : c)));
    } finally {
      setTogglingMode(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeChatId) return;
    const textToSend = inputText.trim();
    setInputText('');
    setSendingMsg(true);

    const tempMsg = {
      id: Date.now(),
      emisor: activeChat?.modo === 'ia' ? 'ia' : 'asesor',
      tipo: 'text',
      texto: textToSend,
      hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    };
    setMensajes((prev) => [...prev, tempMsg]);

    try {
      const res = await productoService.enviarMensajeTexto(activeChatId, textToSend);
      if (res?.id) {
        setMensajes((prev) => prev.map((m) => (m.id === tempMsg.id ? { ...m, id: res.id, hora: res.hora } : m)));
      }
    } catch {
      // Revertido o error
    } finally {
      setSendingMsg(false);
    }
  };

  const handleCatalogSent = (newInteractiveMsg) => {
    setMensajes((prev) => [...prev, newInteractiveMsg]);
    setConversaciones((prev) =>
      prev.map((c) =>
        c.id === activeChatId ? { ...c, ultimo_mensaje: newInteractiveMsg.texto, hora: newInteractiveMsg.hora } : c
      )
    );
  };

  return (
    <>
      <PageMetaData title="Consola WhatsApp - ChatConnect" />
      <PageBreadcrumb title="Consola de WhatsApp" subName="Atención en Vivo y Catálogo Interactivo" />

      <Card className="border-0 shadow-sm overflow-hidden" style={{ height: 'calc(100dvh - 210px)', minHeight: 0 }}>
        <Row className="g-0 h-100">
          <Col md={5} lg={4} className="border-end d-flex flex-column h-100 bg-body">
            <ChatSidebar
              conversaciones={conversaciones}
              activeChatId={activeChatId}
              onSelectChat={setActiveChatId}
              searchContact={searchContact}
              onSearchChange={setSearchContact}
            />
          </Col>

          <Col md={7} lg={8} className="d-flex flex-column h-100 bg-light-subtle">
            <ChatHeader activeChat={activeChat} onToggleMode={handleToggleMode} togglingMode={togglingMode} />
            <ChatMessagesList mensajes={mensajes} activeChat={activeChat} />
            <ChatInputBar
              inputText={inputText}
              setInputText={setInputText}
              onSendMessage={handleSendMessage}
              onOpenSendCollection={() => setShowSendCatalog(true)}
              sending={sendingMsg}
              mode={activeChat?.modo}
              ventanaServicio={activeChat?.ventana_servicio}
            />
          </Col>
        </Row>
      </Card>

      <ChatSendCatalogModal
        show={showSendCatalog}
        onHide={() => setShowSendCatalog(false)}
        activeChat={activeChat}
        onCatalogSent={handleCatalogSent}
      />
    </>
  );
};

export default ChatPage;

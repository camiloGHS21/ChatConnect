import { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import productoService from '@/services/productoService';
import ChatSidebar from './components/ChatSidebar';
import ChatHeader from './components/ChatHeader';
import ChatMessagesList from './components/ChatMessagesList';
import ChatInputBar from './components/ChatInputBar';
import ChatSendCatalogModal from './components/ChatSendCatalogModal';

const ChatPage = () => {
  const [conversaciones, setConversaciones] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [showSendCatalog, setShowSendCatalog] = useState(false);
  const [togglingMode, setTogglingMode] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  const fetchConversaciones = async () => {
    try {
      const convs = await productoService.getConversaciones();
      if (Array.isArray(convs) && convs.length > 0) {
        setConversaciones(convs);
        setActiveChatId((prev) => prev || convs[0].id);
      }
    } catch {
      setConversaciones([]);
    }
  };

  const fetchMensajes = async (convId) => {
    if (!convId) return;
    try {
      const msgs = await productoService.getMensajesConversacion(convId);
      setMensajes(Array.isArray(msgs) ? msgs : []);
    } catch {
      setMensajes([]);
    }
  };

  useEffect(() => { fetchConversaciones(); }, []);
  useEffect(() => { if (activeChatId) fetchMensajes(activeChatId); }, [activeChatId]);

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
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
      <PageBreadcrumb title="Consola de WhatsApp" subName="Atención en Vivo & Catálogo Interactivo" />

      <Card className="border-0 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 210px)', minHeight: 620 }}>
        <Row className="g-0 h-100">
          <Col md={5} lg={4} className="border-end d-flex flex-column h-100 bg-white">
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

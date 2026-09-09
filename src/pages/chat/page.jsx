import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Row, Col, Card, CardBody, CardHeader, Badge, Button, Form, InputGroup, Dropdown } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import {
  CHATCONNECT_CONVERSACIONES,
  CHATCONNECT_EMPRESA,
  CHATCONNECT_CLIENTES,
} from '@/assets/data/chatconnect-data';

const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const clienteIdParam = searchParams.get('clienteId');
  const pedidoParam = searchParams.get('pedido');
  const actionParam = searchParams.get('action');

  const [conversaciones, setConversaciones] = useState(CHATCONNECT_CONVERSACIONES);
  const [activeChatId, setActiveChatId] = useState(CHATCONNECT_CONVERSACIONES[0].id);
  const [inputText, setInputText] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [pendingDispatch, setPendingDispatch] = useState(null);

  // Escuchar parámetros de navegación desde Pedidos u otros módulos
  useEffect(() => {
    if (clienteIdParam) {
      const cId = parseInt(clienteIdParam);
      let targetConv = conversaciones.find((c) => c.cliente_id === cId);

      // Si el cliente no estaba en conversaciones iniciales, lo instanciamos de CHATCONNECT_CLIENTES
      if (!targetConv) {
        const clienteObj = CHATCONNECT_CLIENTES.find((cl) => cl.id === cId);
        if (clienteObj) {
          targetConv = {
            id: 1000 + clienteObj.id,
            cliente_id: clienteObj.id,
            nombre: clienteObj.nombre,
            whatsapp: clienteObj.whatsapp,
            avatar: clienteObj.avatar,
            modo: 'humano',
            ultimo_mensaje: 'Conversación sincronizada desde gestión de pedidos.',
            hora: 'Ahora',
            no_leidos: 0,
            mensajes: [
              {
                id: Date.now(),
                emisor: 'cliente',
                texto: `Hola, deseo consultar sobre el estado de mi compra.`,
                hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          };
          setConversaciones((prev) => [targetConv, ...prev]);
        }
      }

      if (targetConv) {
        setActiveChatId(targetConv.id);

        // Forzar modo Asesor Humano para que el usuario tome control directo según RF-15/RF-22
        setConversaciones((prev) =>
          prev.map((c) => (c.id === targetConv.id ? { ...c, modo: 'humano' } : c))
        );

        if (actionParam === 'despachado' && pedidoParam) {
          const dispatchMsg = `Hola ${targetConv.nombre}, le informamos que su pedido ${pedidoParam} ha sido preparado y despachado 🚚. Nuestro transportador va en camino con sus productos.`;
          setInputText(dispatchMsg);
          setPendingDispatch({
            pedido: pedidoParam,
            cliente: targetConv.nombre,
            mensaje: dispatchMsg,
          });
        }
      }
    }
  }, [clienteIdParam, pedidoParam, actionParam]);

  const activeChat = conversaciones.find((c) => c.id === activeChatId) || conversaciones[0];

  const filteredConversaciones = conversaciones.filter((c) =>
    c.nombre.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.whatsapp.includes(searchContact)
  );

  const handleToggleMode = (chatId) => {
    setConversaciones((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const newMode = c.modo === 'ia' ? 'humano' : 'ia';
          return { ...c, modo: newMode };
        }
        return c;
      })
    );
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      emisor: activeChat.modo === 'ia' ? 'ia' : 'asesor',
      texto: inputText.trim(),
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversaciones((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            mensajes: [...c.mensajes, newMessage],
            ultimo_mensaje: newMessage.texto,
            hora: newMessage.hora,
          };
        }
        return c;
      })
    );

    setInputText('');
    setPendingDispatch(null);
  };

  const handleSendDirectDispatch = () => {
    if (!pendingDispatch) return;

    const newMessage = {
      id: Date.now(),
      emisor: 'asesor',
      texto: pendingDispatch.mensaje,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversaciones((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            modo: 'humano',
            mensajes: [...c.mensajes, newMessage],
            ultimo_mensaje: newMessage.texto,
            hora: newMessage.hora,
          };
        }
        return c;
      })
    );

    setInputText('');
    setPendingDispatch(null);
    setSearchParams({});
  };

  const handleQuickTemplate = (text) => {
    setInputText(text);
  };

  return (
    <>
      <PageMetaData title="Consola WhatsApp - ChatConnect" />
      <PageBreadcrumb title="Consola de WhatsApp" subName="Atención en Vivo & Supervisión IA" />

      <Card className="border-0 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 210px)', minHeight: 620 }}>
        <Row className="g-0 h-100">
          {/* Panel Izquierdo: Lista de Chats */}
          <Col md={5} lg={4} className="border-end d-flex flex-column h-100 bg-white">
            {/* Cabecera del Canal */}
            <div className="p-3 border-bottom bg-light">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar-xs rounded-circle bg-success text-white flex-centered">
                    <IconifyIcon icon="bxl:whatsapp" className="fs-16" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">Línea Ferretería</h6>
                    <span className="fs-11 text-muted">{CHATCONNECT_EMPRESA.whatsapp}</span>
                  </div>
                </div>
                <Badge bg="success-subtle" className="text-success fs-10 px-2 py-1">
                  En línea
                </Badge>
              </div>

              {/* Barra de búsqueda de contactos */}
              <div className="search-bar">
                <Form.Control
                  type="text"
                  placeholder="Buscar conversación..."
                  value={searchContact}
                  onChange={(e) => setSearchContact(e.target.value)}
                  className="form-control-sm"
                />
              </div>
            </div>

            {/* Lista de Conversaciones */}
            <div className="flex-grow-1 overflow-auto">
              {filteredConversaciones.map((conv) => {
                const isActive = conv.id === activeChatId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveChatId(conv.id)}
                    className={`d-flex align-items-center gap-3 p-3 border-bottom cursor-pointer transition-all ${
                      isActive ? 'bg-primary-subtle border-start border-3 border-primary' : 'hover-bg-light'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="position-relative">
                      <img
                        src={conv.avatar}
                        alt={conv.nombre}
                        className="rounded-circle"
                        width={42}
                        height={42}
                      />
                      <span
                        className={`position-absolute bottom-0 end-0 p-1 rounded-circle ${
                          conv.modo === 'ia' ? 'bg-info' : 'bg-success'
                        }`}
                        style={{ width: 10, height: 10 }}
                        title={conv.modo === 'ia' ? 'Gestionado por IA' : 'Atendido por Asesor'}
                      />
                    </div>

                    <div className="flex-grow-1 overflow-hidden">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold text-dark fs-13 text-truncate">
                          {conv.nombre}
                        </span>
                        <span className="text-muted fs-11">{conv.hora}</span>
                      </div>
                      <p className="text-muted fs-12 text-truncate mb-1">
                        {conv.ultimo_mensaje}
                      </p>
                      <div className="d-flex align-items-center gap-1">
                        <Badge
                          bg={conv.modo === 'ia' ? 'info-subtle' : 'warning-subtle'}
                          className={`fs-10 ${conv.modo === 'ia' ? 'text-info' : 'text-warning'}`}
                        >
                          <IconifyIcon
                            icon={conv.modo === 'ia' ? 'mdi:robot' : 'mdi:account-tie'}
                            className="me-1"
                          />
                          {conv.modo === 'ia' ? 'Bot IA' : 'Asesor'}
                        </Badge>
                        <span className="text-muted fs-11">{conv.whatsapp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Col>

          {/* Panel Derecho: Conversación Activa */}
          <Col md={7} lg={8} className="d-flex flex-column h-100 bg-light-subtle">
            {/* Cabecera del Chat Activo */}
            <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={activeChat.avatar}
                  alt={activeChat.nombre}
                  className="rounded-circle"
                  width={44}
                  height={44}
                />
                <div>
                  <h6 className="fw-bold mb-0 text-dark">{activeChat.nombre}</h6>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted fs-12">{activeChat.whatsapp}</span>
                    <a
                      href={`https://wa.me/${activeChat.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="badge bg-success-subtle text-success text-decoration-none"
                    >
                      Abrir en WhatsApp Web
                    </a>
                  </div>
                </div>
              </div>

              {/* Interruptor de Modo IA vs Humano */}
              <div className="d-flex align-items-center gap-2">
                <span className="fs-12 text-muted d-none d-sm-inline">
                  {activeChat.modo === 'ia' ? 'IA respondiendo:' : 'Control manual:'}
                </span>
                <Button
                  variant={activeChat.modo === 'ia' ? 'outline-info' : 'outline-warning'}
                  size="sm"
                  onClick={() => handleToggleMode(activeChat.id)}
                  className="d-flex align-items-center gap-1"
                >
                  <IconifyIcon
                    icon={activeChat.modo === 'ia' ? 'mdi:robot' : 'mdi:account-tie'}
                    className="fs-16"
                  />
                  <strong>{activeChat.modo === 'ia' ? 'Modo: IA Automática' : 'Modo: Asesor Humano'}</strong>
                </Button>
              </div>
            </div>

            {/* Aviso informativo de estado */}
            {activeChat.modo === 'humano' ? (
              <div className="bg-warning-subtle text-warning-emphasis px-3 py-1 fs-12 border-bottom d-flex align-items-center gap-2">
                <IconifyIcon icon="iconamoon:information-circle-duotone" className="fs-16 text-warning" />
                <span>
                  <strong>Atención Humana Activa:</strong> La inteligencia artificial está pausada para esta conversación. Tus mensajes se enviarán directamente al cliente.
                </span>
              </div>
            ) : (
              <div className="bg-info-subtle text-info-emphasis px-3 py-1 fs-12 border-bottom d-flex align-items-center gap-2">
                <IconifyIcon icon="mdi:robot-excited-outline" className="fs-16 text-info" />
                <span>
                  <strong>Piloto Automático IA:</strong> El modelo procesa cotizaciones, consultas de stock y enlaces de catálogo según el SRS ChatConnect.
                </span>
              </div>
            )}

            {/* Banner de Notificación de Despacho desde Módulo Pedidos */}
            {pendingDispatch && (
              <div className="bg-success-subtle text-success-emphasis px-3 py-2 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2 animate__animated animate__fadeIn">
                <div className="d-flex align-items-center gap-2">
                  <IconifyIcon icon="mdi:truck-fast" className="fs-22 text-success" />
                  <span className="fs-12">
                    <strong>Despacho de Pedido {pendingDispatch.pedido}:</strong> Notificación generada y lista para enviar a {pendingDispatch.cliente} por WhatsApp.
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    className="d-flex align-items-center gap-1 py-1 px-3 fs-12 shadow-sm"
                    onClick={handleSendDirectDispatch}
                  >
                    <IconifyIcon icon="mdi:send-check" className="fs-16" />
                    <span>Enviar Notificación Inmediata</span>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="py-1 px-2 fs-12"
                    onClick={() => setPendingDispatch(null)}
                    title="Cerrar aviso"
                  >
                    <IconifyIcon icon="mdi:close" />
                  </Button>
                </div>
              </div>
            )}

            {/* Ventana de Mensajes */}
            <div className="flex-grow-1 p-3 overflow-auto d-flex flex-column gap-3" style={{ backgroundColor: '#efeae2' }}>
              {activeChat.mensajes.map((msg) => {
                const isClient = msg.emisor === 'cliente';
                const isIA = msg.emisor === 'ia';

                return (
                  <div
                    key={msg.id}
                    className={`d-flex flex-column ${isClient ? 'align-items-start' : 'align-items-end'}`}
                  >
                    <div
                      className={`p-3 rounded shadow-sm position-relative ${
                        isClient
                          ? 'bg-white text-dark'
                          : isIA
                          ? 'bg-success text-white'
                          : 'bg-primary text-white'
                      }`}
                      style={{ maxWidth: '78%', borderRadius: 12 }}
                    >
                      <div className="d-flex align-items-center justify-content-between gap-3 mb-1">
                        <span className={`fs-11 fw-bold ${isClient ? 'text-secondary' : 'text-white-50'}`}>
                          {isClient ? activeChat.nombre : isIA ? '🤖 ChatConnect IA' : '👨‍💼 Asesor Humano'}
                        </span>
                        <span className={`fs-10 ${isClient ? 'text-muted' : 'text-white-50'}`}>
                          {msg.hora}
                        </span>
                      </div>
                      <div className="fs-13" style={{ whiteSpace: 'pre-line', lineHeight: 1.45 }}>
                        {msg.texto}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Plantillas Rápidas y Área de Envío */}
            <div className="p-3 bg-white border-top">
              {/* Sugerencias de Respuesta Rápida */}
              <div className="d-flex align-items-center gap-2 mb-2 overflow-auto pb-1">
                <span className="fs-11 text-muted text-nowrap">Respuestas rápidas:</span>
                <Button
                  variant="outline-light"
                  size="sm"
                  className="text-dark fs-11 text-nowrap py-0 px-2"
                  onClick={() =>
                    handleQuickTemplate(
                      '¡Hola! Con gusto te comparto nuestro catálogo ferretero oficial con precios actualizados e IVA incluido.'
                    )
                  }
                >
                  📄 Enviar Catálogo
                </Button>
                <Button
                  variant="outline-light"
                  size="sm"
                  className="text-dark fs-11 text-nowrap py-0 px-2"
                  onClick={() =>
                    handleQuickTemplate(
                      'Tenemos disponibilidad inmediata en bodega para despacho el día de hoy en Bogotá y Sabana.'
                    )
                  }
                >
                  🚚 Despacho Inmediato
                </Button>
                <Button
                  variant="outline-light"
                  size="sm"
                  className="text-dark fs-11 text-nowrap py-0 px-2"
                  onClick={() =>
                    handleQuickTemplate(
                      '¿Deseas formalizar la orden con pago contra entrega o transferencia bancaria (Bancolombia / Nequi / Daviplata)?'
                    )
                  }
                >
                  💳 Métodos de Pago
                </Button>
              </div>

              {/* Input y Botón de Envío */}
              <Form onSubmit={handleSendMessage}>
                <InputGroup>
                  <Button variant="light" type="button" title="Adjuntar Imagen o Ficha Técnica">
                    <IconifyIcon icon="mdi:paperclip" className="fs-18 text-muted" />
                  </Button>
                  <Form.Control
                    type="text"
                    placeholder={`Escribe una respuesta como ${activeChat.modo === 'ia' ? 'ChatConnect IA' : 'Asesor'}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <Button variant="success" type="submit" className="d-flex align-items-center gap-1 px-3">
                    <IconifyIcon icon="mdi:send" className="fs-16" />
                    <span>Enviar</span>
                  </Button>
                </InputGroup>
              </Form>
            </div>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default ChatPage;

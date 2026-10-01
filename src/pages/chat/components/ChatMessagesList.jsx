import { useEffect, useRef } from 'react';
import { Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const ChatMessagesList = ({ mensajes = [], activeChat }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  return (
    <div
      className="flex-grow-1 p-3 overflow-auto d-flex flex-column gap-3"
      style={{ backgroundColor: '#efeae2' }}
    >
      {mensajes.length === 0 ? (
        <div className="text-center py-5 text-muted fs-13">
          <IconifyIcon icon="bx:message-square-dots" className="fs-36 mb-2 d-block mx-auto text-secondary opacity-50" />
          No hay mensajes en esta conversación. Escribe un mensaje o envía una colección de productos.
        </div>
      ) : (
        mensajes.map((msg) => {
          const isClient = msg.emisor === 'cliente';
          const isIA = msg.emisor === 'ia';
          const isInteractive = msg.tipo === 'interactive';

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
                style={{ maxWidth: '82%', borderRadius: 12 }}
              >
                {/* Emisor y Hora */}
                <div className="d-flex align-items-center justify-content-between gap-3 mb-1">
                  <span className={`fs-11 fw-bold ${isClient ? 'text-secondary' : 'text-white-50'}`}>
                    {isClient ? (activeChat?.nombre || 'Cliente') : isIA ? '🤖 ChatConnect IA' : '👨‍💼 Asesor Humano'}
                  </span>
                  <span className={`fs-10 ${isClient ? 'text-muted' : 'text-white-50'}`}>
                    {msg.hora}
                  </span>
                </div>

                {/* Renderizado de Mensaje Interactivo de Colección de WhatsApp */}
                {isInteractive ? (
                  <div className="mt-1 p-2 rounded bg-white text-dark border">
                    <div className="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom">
                      <div className="avatar-xs rounded bg-success-subtle text-success d-flex align-items-center justify-content-center p-1">
                        <IconifyIcon icon="bxl:whatsapp" className="fs-16" />
                      </div>
                      <div>
                        <strong className="fs-12 text-success d-block">Colección de Productos WhatsApp</strong>
                        <span className="fs-10 text-muted">Mensaje interactivo enviado vía Meta Cloud API</span>
                      </div>
                    </div>
                    <div className="fs-12 mb-2" style={{ whiteSpace: 'pre-line' }}>
                      {msg.texto}
                    </div>
                    <div className="d-flex align-items-center justify-content-between pt-1 border-top fs-11 text-muted">
                      <span className="badge bg-light text-dark border">
                        <IconifyIcon icon="bx:store" className="me-1 align-middle" />
                        Catálogo de WhatsApp
                      </span>
                      <span className="text-success fw-semibold">
                        <IconifyIcon icon="bx:check-double" className="me-1" />
                        Entregado
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="fs-13" style={{ whiteSpace: 'pre-line', lineHeight: 1.45 }}>
                    {msg.texto}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessagesList;

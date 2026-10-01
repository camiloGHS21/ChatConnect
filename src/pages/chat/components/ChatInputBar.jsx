import { Form, InputGroup, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const ChatInputBar = ({
  inputText,
  setInputText,
  onSendMessage,
  onOpenSendCollection,
  sending,
  mode = 'ia',
  ventanaServicio,
}) => {
  const isBloqueadoPorVentana = Boolean(ventanaServicio && !ventanaServicio.activa);

  const quickTemplates = [
    { label: '📄 Enviar Catálogo', text: '¡Hola! Te compartimos nuestro catálogo oficial con precios y disponibilidad en tiempo real.' },
    { label: '🚚 Despacho Inmediato', text: 'Tenemos disponibilidad inmediata en bodega para despacho el día de hoy.' },
    { label: '💳 Métodos de Pago', text: 'Aceptamos transferencia (Bancolombia, Nequi, Daviplata) o pago contra entrega.' },
  ];

  return (
    <div className="p-3 bg-white border-top">
      {/* Sugerencias Rápidas y Botón de Catálogo */}
      <div className="d-flex align-items-center gap-2 mb-2 overflow-auto pb-1">
        <Button
          variant={isBloqueadoPorVentana ? 'secondary' : 'success'}
          size="sm"
          className="text-nowrap py-1 px-2 fs-11 d-flex align-items-center gap-1 shadow-sm"
          onClick={onOpenSendCollection}
          disabled={isBloqueadoPorVentana}
        >
          <IconifyIcon icon="bxl:whatsapp" className="fs-14" />
          <strong>📦 Enviar Producto / Catálogo</strong>
        </Button>

        <span className="fs-11 text-muted text-nowrap ms-1">Respuestas:</span>
        {quickTemplates.map((t, idx) => (
          <Button
            key={idx}
            variant="outline-light"
            size="sm"
            className="text-dark fs-11 text-nowrap py-0 px-2"
            onClick={() => setInputText(t.text)}
            disabled={isBloqueadoPorVentana}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {/* Input de Texto y Botón Enviar */}
      <Form onSubmit={onSendMessage}>
        <InputGroup>
          <Button
            variant="light"
            type="button"
            title="Enviar Producto o Categorías"
            onClick={onOpenSendCollection}
            disabled={isBloqueadoPorVentana}
            className="text-success border-end-0"
          >
            <IconifyIcon icon="bx:package" className="fs-18" />
          </Button>

          <Form.Control
            type="text"
            placeholder={
              isBloqueadoPorVentana
                ? 'Esperando respuesta del cliente para poder contestar...'
                : `Escribe un mensaje como ${mode === 'ia' ? 'ChatConnect IA' : 'Asesor'}...`
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending || isBloqueadoPorVentana}
          />

          <Button
            variant="success"
            type="submit"
            disabled={sending || isBloqueadoPorVentana || !inputText.trim()}
            className="d-flex align-items-center gap-1 px-3 shadow-sm"
          >
            <IconifyIcon icon="mdi:send" className="fs-16" />
            <span>Enviar</span>
          </Button>
        </InputGroup>
      </Form>
    </div>
  );
};

export default ChatInputBar;

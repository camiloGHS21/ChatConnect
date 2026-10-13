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
  const isModoIA = mode === 'ia';
  const isDeshabilitado = sending || isBloqueadoPorVentana || isModoIA;

  const quickTemplates = [
    { label: '📄 Enviar Catálogo', text: '¡Hola! Te compartimos nuestro catálogo oficial con precios y disponibilidad en tiempo real.' },
    { label: '🚚 Despacho Inmediato', text: 'Tenemos disponibilidad inmediata en bodega para despacho el día de hoy.' },
    { label: '💳 Métodos de Pago', text: 'Aceptamos transferencia (Bancolombia, Nequi, Daviplata) o pago contra entrega.' },
  ];

  const getPlaceholder = () => {
    if (isModoIA) {
      return 'Modo Bot IA activo. Cambia a Asesor para poder escribir...';
    }
    if (isBloqueadoPorVentana) {
      return 'Esperando respuesta del cliente para poder contestar...';
    }
    return 'Escribe un mensaje como Asesor...';
  };

  return (
    <div className="p-3 bg-body border-top">
      {/* Sugerencias Rápidas y Botón de Catálogo */}
      <div className="d-flex align-items-center gap-2 mb-2 overflow-auto pb-1">
        <Button
          variant={isDeshabilitado ? 'secondary' : 'success'}
          size="sm"
          className="text-nowrap py-1 px-2 fs-11 d-flex align-items-center gap-1 shadow-sm"
          onClick={onOpenSendCollection}
          disabled={isDeshabilitado}
        >
          <IconifyIcon icon="bxl:whatsapp" className="fs-14" />
          <strong>📦 Enviar Producto / Catálogo</strong>
        </Button>

        <span className="fs-11 text-muted text-nowrap ms-1">Respuestas:</span>
        {quickTemplates.map((t) => (
          <Button
            key={t.label}
            variant="outline-secondary"
            size="sm"
            className="fs-11 text-nowrap py-0 px-2"
            onClick={() => setInputText(t.text)}
            disabled={isDeshabilitado}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {/* Input de Texto y Botón Enviar */}
      <Form onSubmit={onSendMessage}>
        <InputGroup>
          <Button
            variant="outline-success"
            type="button"
            title="Enviar Producto o Categorías"
            onClick={onOpenSendCollection}
            disabled={isDeshabilitado}
            className="border-end-0"
          >
            <IconifyIcon icon="bx:package" className="fs-18" />
          </Button>

          <Form.Control
            type="text"
            placeholder={getPlaceholder()}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isDeshabilitado}
          />

          <Button
            variant={isModoIA ? 'secondary' : 'success'}
            type="submit"
            disabled={isDeshabilitado || !inputText.trim()}
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

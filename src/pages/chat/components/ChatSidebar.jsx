import { Badge, Form } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const ChatSidebar = ({
  conversaciones = [],
  activeChatId,
  onSelectChat,
  searchContact,
  onSearchChange,
  channelInfo = { name: 'Línea Ferretería', whatsapp: '+57 302 4610721' },
}) => {
  const filtered = conversaciones.filter((c) =>
    (c.nombre || '').toLowerCase().includes((searchContact || '').toLowerCase()) ||
    (c.whatsapp || '').includes(searchContact || '')
  );

  return (
    <div className="d-flex flex-column h-100 bg-white">
      {/* Cabecera del Canal de WhatsApp */}
      <div className="p-3 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center gap-2">
            <div className="avatar-xs rounded-circle bg-success text-white d-flex align-items-center justify-content-center p-2">
              <IconifyIcon icon="bxl:whatsapp" className="fs-18" />
            </div>
            <div>
              <h6 className="fw-bold mb-0 text-dark fs-13">{channelInfo.name}</h6>
              <span className="fs-11 text-muted">{channelInfo.whatsapp}</span>
            </div>
          </div>
          <Badge bg="success-subtle" className="text-success fs-10 px-2 py-1">
            En línea
          </Badge>
        </div>

        {/* Buscador */}
        <div className="search-bar">
          <Form.Control
            type="text"
            placeholder="Buscar conversación..."
            value={searchContact}
            onChange={(e) => onSearchChange(e.target.value)}
            className="form-control-sm"
          />
        </div>
      </div>

      {/* Lista de Conversaciones */}
      <div className="flex-grow-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-4 text-muted fs-12">
            No se encontraron conversaciones
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = conv.id === activeChatId;
            const isIA = conv.modo === 'ia';

            return (
              <div
                key={conv.id}
                onClick={() => onSelectChat(conv.id)}
                className={`d-flex align-items-center gap-3 p-3 border-bottom cursor-pointer transition-all ${
                  isActive
                    ? 'bg-primary-subtle border-start border-3 border-primary'
                    : 'hover-bg-light'
                }`}
                style={{ cursor: 'pointer' }}
              >
                <div className="position-relative">
                  <img
                    src={conv.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${conv.id}`}
                    alt={conv.nombre}
                    className="rounded-circle border"
                    width={40}
                    height={40}
                  />
                  <span
                    className={`position-absolute bottom-0 end-0 p-1 rounded-circle ${
                      isIA ? 'bg-info' : 'bg-success'
                    }`}
                    style={{ width: 10, height: 10 }}
                    title={isIA ? 'Gestionado por IA' : 'Atendido por Asesor'}
                  />
                </div>

                <div className="flex-grow-1 overflow-hidden">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold text-dark fs-13 text-truncate">
                      {conv.nombre}
                    </span>
                    <span className="text-muted fs-10">{conv.hora}</span>
                  </div>
                  <p className="text-muted fs-11 text-truncate mb-1">
                    {conv.ultimo_mensaje}
                  </p>
                  <div className="d-flex align-items-center justify-content-between gap-1">
                    <Badge
                      bg={isIA ? 'info-subtle' : 'warning-subtle'}
                      className={`fs-10 py-0 px-1 ${isIA ? 'text-info' : 'text-warning'}`}
                    >
                      <IconifyIcon
                        icon={isIA ? 'mdi:robot' : 'mdi:account-tie'}
                        className="me-1 fs-12 align-middle"
                      />
                      {isIA ? 'Bot IA' : 'Asesor'}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;

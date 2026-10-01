import { Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const ChatHeader = ({ activeChat, onToggleMode, togglingMode }) => {
  if (!activeChat) return null;

  const isIA = activeChat.modo === 'ia';
  const cleanPhone = (activeChat.whatsapp || '').replace(/[^0-9]/g, '');

  return (
    <>
      <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <img
            src={activeChat.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeChat.id}`}
            alt={activeChat.nombre}
            className="rounded-circle border"
            width={44}
            height={44}
          />
          <div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h6 className="fw-bold mb-0 text-dark fs-14">{activeChat.nombre}</h6>
            </div>
            <div className="d-flex align-items-center gap-2 mt-1">
              <span className="text-muted fs-11">{activeChat.whatsapp}</span>
              {cleanPhone && (
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="badge bg-success-subtle text-success text-decoration-none fs-10"
                >
                  <IconifyIcon icon="bxl:whatsapp" className="me-1 align-middle" />
                  Abrir WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Interruptor Modo IA vs Humano */}
        <div className="d-flex align-items-center gap-2">
          <Button
            variant={isIA ? 'outline-info' : 'outline-warning'}
            size="sm"
            onClick={onToggleMode}
            disabled={togglingMode}
            className="d-flex align-items-center gap-1 shadow-sm py-1 px-2"
          >
            <IconifyIcon icon={isIA ? 'mdi:robot' : 'mdi:account-tie'} className="fs-16" />
            <strong className="fs-12">
              {isIA ? 'Piloto Automático IA' : 'Atención Asesor'}
            </strong>
          </Button>
        </div>
      </div>

      {/* Banner Informativo de Modo */}
      {!isIA ? (
        <div className="bg-warning-subtle text-warning-emphasis px-3 py-1 fs-12 border-bottom d-flex align-items-center gap-2">
          <IconifyIcon icon="iconamoon:information-circle-duotone" className="fs-16 text-warning flex-shrink-0" />
          <span>
            <strong>Atención Asesor Activa:</strong> La IA está pausada. Puedes responder y enviar productos directamente.
          </span>
        </div>
      ) : (
        <div className="bg-info-subtle text-info-emphasis px-3 py-1 fs-12 border-bottom d-flex align-items-center gap-2">
          <IconifyIcon icon="mdi:robot-excited-outline" className="fs-16 text-info flex-shrink-0" />
          <span>
            <strong>Piloto Automático IA:</strong> Atendiendo al cliente en tiempo real.
          </span>
        </div>
      )}
    </>
  );
};

export default ChatHeader;


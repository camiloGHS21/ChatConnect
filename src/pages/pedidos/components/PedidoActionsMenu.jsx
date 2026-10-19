import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const ESTADOS = [
  { id: 'pendiente', label: 'Marcar Pendiente' },
  { id: 'en_preparacion', label: 'Marcar En Preparación' },
  { id: 'despachado', label: 'Marcar Despachado' },
  { id: 'entregado', label: 'Marcar Entregado' },
];

const MENU_WIDTH = 210;
const MENU_HEIGHT = 340;

/**
 * Menú de tres puntos renderizado en un portal sobre `document.body`,
 * para que quede por encima de la tabla sin generar scroll ni recortes.
 */
const PedidoActionsMenu = ({ order, onUpdateStatus, onNotificarDespacho, onExport }) => {
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const close = useCallback(() => setPos(null), []);

  const toggle = () => {
    if (pos) return close();
    const r = btnRef.current.getBoundingClientRect();
    const abajo = window.innerHeight - r.bottom > MENU_HEIGHT;
    setPos({
      top: abajo ? r.bottom + 4 : Math.max(8, r.top - MENU_HEIGHT - 4),
      left: Math.max(8, r.right - MENU_WIDTH),
    });
  };

  useEffect(() => {
    if (!pos) return undefined;
    const onDown = (e) => {
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      close();
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [pos, close]);

  const run = (fn) => () => {
    close();
    fn();
  };

  return (
    <>
      <Button ref={btnRef} variant="light" size="sm" className="btn-icon rounded-circle" title="Más Opciones" onClick={toggle}>
        <IconifyIcon icon="bx:dots-vertical-rounded" className="fs-16" />
      </Button>
      {pos &&
        createPortal(
          <div
            ref={menuRef}
            className="dropdown-menu fs-12 shadow-sm border-0"
            style={{ display: 'block', position: 'fixed', top: pos.top, left: pos.left, width: MENU_WIDTH, minWidth: MENU_WIDTH, zIndex: 2000, margin: 0 }}
          >
            <h6 className="dropdown-header">Actualizar Estado</h6>
            {ESTADOS.map((st) => (
              <button
                key={st.id}
                type="button"
                className={`dropdown-item ${order.estado === st.id ? 'active' : ''}`}
                onClick={run(() => onUpdateStatus(order.id, st.id))}
              >
                {st.label}
              </button>
            ))}
            <div className="dropdown-divider" />
            <h6 className="dropdown-header">Exportar Pedido</h6>
            <button type="button" className="dropdown-item d-flex align-items-center gap-2" onClick={run(() => onExport(order, 'pdf'))}>
              <IconifyIcon icon="bxs:file-pdf" className="text-danger" /> Exportar a PDF
            </button>
            <button type="button" className="dropdown-item d-flex align-items-center gap-2" onClick={run(() => onExport(order, 'excel'))}>
              <IconifyIcon icon="bxs:file" className="text-success" /> Exportar a Excel
            </button>
            <div className="dropdown-divider" />
            <button type="button" className="dropdown-item text-success d-flex align-items-center gap-1" onClick={run(() => onNotificarDespacho(order))}>
              <IconifyIcon icon="bxl:whatsapp" /> Notificar Despacho
            </button>
          </div>,
          document.body,
        )}
    </>
  );
};

export default PedidoActionsMenu;

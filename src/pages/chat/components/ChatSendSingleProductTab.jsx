import { useState, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const ChatSendSingleProductTab = ({
  productos = [],
  selectedSku,
  onSelectSku,
  customText,
  onCustomTextChange,
  disabled,
}) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return productos;
    const t = search.toLowerCase();
    return productos.filter(p =>
      p.nombre?.toLowerCase().includes(t) ||
      p.codigo_interno?.toLowerCase().includes(t) ||
      p.categoria_nombre?.toLowerCase().includes(t)
    );
  }, [productos, search]);

  return (
    <div>
      <div className="search-bar mb-2">
        <Form.Control
          type="search"
          size="sm"
          placeholder="Buscar producto por nombre o código..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="border rounded p-2 mb-2 overflow-auto" style={{ maxHeight: 220 }}>
        {filtered.length === 0 ? (
          <div className="text-center py-3 text-muted fs-12">No hay productos disponibles</div>
        ) : (
          filtered.map(p => {
            const isSelected = selectedSku === p.codigo_interno;
            return (
              <div
                key={p.codigo_interno}
                className={`position-relative d-flex align-items-center gap-2 p-2 rounded mb-1 cursor-pointer transition-all ${
                  isSelected ? 'bg-success-subtle border border-success' : 'hover-bg-light border-bottom'
                }`}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
              >
                <label htmlFor={`catalogo-producto-${p.codigo_interno}`} className="stretched-link"><span className="visually-hidden">{p.nombre}</span></label>
                <Form.Check
                  id={`catalogo-producto-${p.codigo_interno}`}
                  type="radio"
                  name="selProd"
                  checked={isSelected}
                  onChange={() => onSelectSku(p.codigo_interno)}
                  disabled={disabled}
                  className="me-1"
                />
                {p.imagen_principal ? (
                  <img src={p.imagen_principal} alt={p.nombre} width={36} height={36} className="rounded object-fit-cover border" />
                ) : (
                  <div className="avatar-xs rounded bg-body-tertiary border d-flex align-items-center justify-content-center text-muted">
                    <IconifyIcon icon="bx:package" />
                  </div>
                )}
                <div className="flex-grow-1 overflow-hidden">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-semibold text-body fs-12 text-truncate">{p.nombre}</span>
                    <span className="text-success fw-bold fs-11">${Number(p.precio).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted fs-10">
                    <code>{p.codigo_interno}</code>
                    <span>•</span>
                    <span>{p.categoria_nombre}</span>
                    <span>•</span>
                    <span>Existencias: {p.disponible}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Form.Group>
        <Form.Label className="fs-12 fw-semibold mb-1">Mensaje opcional para el cliente:</Form.Label>
        <Form.Control
          type="text"
          size="sm"
          placeholder="Ej: Aquí tienes la información detallada del producto solicitado..."
          value={customText}
          onChange={e => onCustomTextChange(e.target.value)}
          disabled={disabled}
        />
      </Form.Group>
    </div>
  );
};

export default ChatSendSingleProductTab;

import { Form, Badge } from 'react-bootstrap';

const ChatSendCategoriesTab = ({
  categorias = [],
  selectedCatIds = [],
  onToggleCatId,
  onSelectAll,
  customTitle,
  onCustomTitleChange,
  customText,
  onCustomTextChange,
  disabled,
}) => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fs-12 fw-semibold">Seleccionar una o varias categorías:</span>
        <button
          type="button"
          className="btn btn-link btn-sm p-0 fs-11 text-decoration-none"
          onClick={onSelectAll}
          disabled={disabled || categorias.length === 0}
        >
          {selectedCatIds.length === categorias.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
        </button>
      </div>

      <div className="border rounded p-2 mb-2 overflow-auto" style={{ maxHeight: 190 }}>
        {categorias.length === 0 ? (
          <div className="text-center py-3 text-muted fs-12">No hay categorías con productos aprobados</div>
        ) : (
          categorias.map(cat => {
            const isChecked = selectedCatIds.includes(cat.id);
            return (
              <div
                key={cat.id}
                className={`position-relative d-flex align-items-center justify-content-between p-2 rounded mb-1 cursor-pointer transition-all ${
                  isChecked ? 'bg-success-subtle border border-success' : 'hover-bg-light border-bottom'
                }`}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
              >
                <label htmlFor={`catalogo-categoria-${cat.id}`} className="stretched-link"><span className="visually-hidden">{cat.nombre}</span></label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Check
                    id={`catalogo-categoria-${cat.id}`}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleCatId(cat.id)}
                    disabled={disabled}
                    className="me-1"
                  />
                  <span className="fw-semibold text-body fs-12">{cat.nombre}</span>
                </div>
                <Badge bg="body-tertiary" className="text-body border fs-11">
                  {cat.total_productos} prods
                </Badge>
              </div>
            );
          })
        )}
      </div>

      <Form.Group className="mb-2">
        <Form.Label className="fs-11 fw-semibold mb-1">Título del catálogo (opcional):</Form.Label>
        <Form.Control
          type="text"
          size="sm"
          placeholder="Ej: Catálogo de Ferretería"
          value={customTitle}
          onChange={e => onCustomTitleChange(e.target.value)}
          disabled={disabled}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label className="fs-11 fw-semibold mb-1">Mensaje para el cliente (opcional):</Form.Label>
        <Form.Control
          type="text"
          size="sm"
          placeholder="Ej: Consulta nuestros productos disponibles por categoría:"
          value={customText}
          onChange={e => onCustomTextChange(e.target.value)}
          disabled={disabled}
        />
      </Form.Group>
    </div>
  );
};

export default ChatSendCategoriesTab;

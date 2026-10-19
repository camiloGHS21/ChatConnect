import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Form, Spinner, Table } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useAuthContext } from '@/context/useAuthContext';
import consecutivoService from '@/services/consecutivoService';

const crearBorrador = item => ({
  prefijo: item.prefijo || '',
  consecutivo_actual: Number(item.consecutivo_actual) || 0,
  longitud: Number(item.longitud) || 6,
});

const siguienteLocal = draft => {
  const actual = Math.max(0, Number(draft?.consecutivo_actual) || 0);
  const longitud = Math.min(20, Math.max(1, Number(draft?.longitud) || 1));
  return `${draft?.prefijo || ''}${String(actual + 1).padStart(longitud, '0')}`;
};

const ConsecutivosConfigTab = () => {
  const { user: session } = useAuthContext();
  const empresaId = Number(session?.user?.empresa_id || session?.empresa?.id || 1);
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    let active = true;
    consecutivoService.listar(empresaId)
      .then(data => {
        if (!active) return;
        const rows = Array.isArray(data) ? data : [];
        setItems(rows);
        setDrafts(Object.fromEntries(rows.map(item => [item.id, crearBorrador(item)])));
      })
      .catch(error => {
        if (!active) return;
        setFeedback({
          type: 'danger',
          message: error.response?.data?.message || 'No se pudieron cargar los consecutivos de PostgreSQL.',
        });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [empresaId]);

  const updateDraft = (id, field, value) => {
    setDrafts(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const guardar = async (item) => {
    const draft = drafts[item.id];
    const consecutivoActual = Number(draft.consecutivo_actual);
    const longitud = Number(draft.longitud);
    if (!Number.isSafeInteger(consecutivoActual) || consecutivoActual < 0) {
      setFeedback({ type: 'danger', message: 'El consecutivo actual debe ser un entero mayor o igual a cero.' });
      return;
    }
    if (!Number.isInteger(longitud) || longitud < 1 || longitud > 20) {
      setFeedback({ type: 'danger', message: 'La longitud debe ser un entero entre 1 y 20.' });
      return;
    }

    try {
      setSavingId(item.id);
      setFeedback({ type: '', message: '' });
      const saved = await consecutivoService.actualizar(item.id, {
        prefijo: draft.prefijo.trim() || null,
        consecutivo_actual: consecutivoActual,
        longitud,
      }, empresaId);
      setItems(prev => prev.map(row => row.id === item.id ? saved : row));
      setDrafts(prev => ({ ...prev, [item.id]: crearBorrador(saved) }));
      setFeedback({ type: 'success', message: `Consecutivo de ${saved.nombre.toLowerCase()} guardado correctamente.` });
    } catch (error) {
      setFeedback({
        type: 'danger',
        message: error.response?.data?.message || 'No se pudo guardar el consecutivo.',
      });
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  }

  return (
    <>
      {feedback.message && (
        <Alert variant={feedback.type} className="py-2 fs-13">{feedback.message}</Alert>
      )}

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-transparent border-bottom py-3">
          <h5 className="card-title mb-1 fw-bold text-dark d-flex align-items-center">
            <IconifyIcon icon="bx:hash" className="me-2 text-primary fs-20" />
            Consecutivos de la Plataforma
          </h5>
          <small className="text-muted">
            Define la numeración de productos y documentos. El prefijo es opcional y el próximo número se genera de forma atómica en PostgreSQL.
          </small>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr className="fs-12 text-muted">
                  <th className="ps-3">Módulo</th>
                  <th style={{ minWidth: 150 }}>Prefijo opcional</th>
                  <th style={{ minWidth: 150 }}>Consecutivo actual</th>
                  <th style={{ minWidth: 120 }}>Longitud</th>
                  <th style={{ minWidth: 170 }}>Próximo número</th>
                  <th className="text-end pe-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const draft = drafts[item.id] || crearBorrador(item);
                  const saving = savingId === item.id;
                  return (
                    <tr key={item.id}>
                      <td className="ps-3">
                        <div className="fw-semibold text-dark">{item.nombre}</div>
                        <small className="text-muted text-uppercase">{item.modulo}</small>
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          maxLength={50}
                          value={draft.prefijo}
                          placeholder="Sin prefijo"
                          aria-label={`Prefijo para ${item.nombre}`}
                          onChange={event => updateDraft(item.id, 'prefijo', event.target.value.toUpperCase())}
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          type="number"
                          min="0"
                          step="1"
                          value={draft.consecutivo_actual}
                          aria-label={`Consecutivo actual de ${item.nombre}`}
                          onChange={event => updateDraft(item.id, 'consecutivo_actual', event.target.value)}
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          type="number"
                          min="1"
                          max="20"
                          step="1"
                          value={draft.longitud}
                          aria-label={`Longitud para ${item.nombre}`}
                          onChange={event => updateDraft(item.id, 'longitud', event.target.value)}
                        />
                      </td>
                      <td>
                        <Badge bg="primary-subtle" className="text-primary font-monospace fs-12 px-2 py-2">
                          {siguienteLocal(draft)}
                        </Badge>
                      </td>
                      <td className="text-end pe-3">
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={savingId !== null}
                          className="d-inline-flex align-items-center gap-1"
                          onClick={() => guardar(item)}
                        >
                          {saving ? <Spinner size="sm" animation="border" /> : <IconifyIcon icon="bx:save" />}
                          Guardar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-5">
                      No hay consecutivos configurados para esta empresa.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
        <Card.Footer className="bg-light border-0 fs-12 text-muted py-3">
          <IconifyIcon icon="bx:info-circle" className="me-1" />
          Cambiar el consecutivo afecta únicamente los nuevos registros; los números ya asignados se conservan.
        </Card.Footer>
      </Card>
    </>
  );
};

export default ConsecutivosConfigTab;

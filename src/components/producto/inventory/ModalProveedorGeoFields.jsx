import { useEffect, useState } from 'react';
import { Col, Form } from 'react-bootstrap';
import productoService from '@/services/productoService';

/**
 * Selector jerárquico 1:N para Departamento y Ciudad con persistencia relacional en BD.
 */
const ModalProveedorGeoFields = ({ form, update }) => {
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loadingCiudades, setLoadingCiudades] = useState(false);

  useEffect(() => {
    let isMounted = true;
    productoService.getDepartamentos().then(data => {
      if (isMounted && Array.isArray(data)) setDepartamentos(data);
    }).catch(err => console.warn('Error cargando departamentos:', err));
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (form.id_departamento) {
      setLoadingCiudades(true);
      productoService.getCiudades(form.id_departamento).then(data => {
        if (isMounted && Array.isArray(data)) setCiudades(data);
      }).catch(err => console.warn('Error cargando ciudades:', err))
        .finally(() => { if (isMounted) setLoadingCiudades(false); });
    } else {
      setCiudades([]);
    }
    return () => { isMounted = false; };
  }, [form.id_departamento]);

  const handleDeptoChange = (e) => {
    const depId = e.target.value;
    const dep = departamentos.find(d => String(d.id) === String(depId));
    update('id_departamento', depId);
    update('departamento', dep ? dep.nombre : '');
    update('id_ciudad', '');
    update('ciudad', '');
  };

  const handleCiudadChange = (e) => {
    const ciuId = e.target.value;
    const ciu = ciudades.find(c => String(c.id) === String(ciuId));
    update('id_ciudad', ciuId);
    update('ciudad', ciu ? ciu.nombre : '');
  };

  return (
    <>
      <Col md={4}>
        <Form.Label className="fs-12 fw-semibold text-secondary mb-1">
          Departamento
        </Form.Label>
        <Form.Select value={form.id_departamento || ''} onChange={handleDeptoChange}>
          <option value="">Selecciona Departamento...</option>
          {departamentos.map(d => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </Form.Select>
      </Col>
      <Col md={4}>
        <Form.Label className="fs-12 fw-semibold text-secondary mb-1">
          Ciudad o Municipio
        </Form.Label>
        <Form.Select
          value={form.id_ciudad || ''}
          onChange={handleCiudadChange}
          disabled={!form.id_departamento || loadingCiudades}
        >
          <option value="">
            {loadingCiudades
              ? 'Cargando ciudades/municipios...'
              : form.id_departamento
                ? 'Selecciona Ciudad o Municipio...'
                : 'Primero elige departamento'}
          </option>
          {ciudades.map(c => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Form.Select>
      </Col>
      <Col md={4}>
        <Form.Label className="fs-12 fw-semibold text-secondary mb-1">Dirección</Form.Label>
        <Form.Control
          type="text"
          placeholder="Ej: Carrera 43A # 1Sur-100"
          value={form.direccion}
          onChange={e => update('direccion', e.target.value)}
        />
      </Col>
    </>
  );
};

export default ModalProveedorGeoFields;

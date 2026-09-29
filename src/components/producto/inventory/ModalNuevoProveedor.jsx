import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import productoService from '@/services/productoService';
import { calcularDvDian, INITIAL_SUPPLIER_FORM } from './supplierUtils';
import ModalNuevoProveedorFields from './ModalNuevoProveedorFields';

/**
 * Modal Crear Proveedor (Tercero).
 * Idéntico al diseño de la imagen (media_1790109184725.png).
 */
const ModalNuevoProveedor = ({ show, onHide, onSave, existingSuppliers = [] }) => {
  const [form, setForm] = useState(INITIAL_SUPPLIER_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleDocChange = (doc) => {
    const clean = doc.replace(/[^\d-]/g, '');
    const dv = form.tipo_documento === 'NIT' ? calcularDvDian(clean) : '';
    setForm(p => ({ ...p, numero_documento: clean, digito_verificacion: dv }));
  };

  const handleSave = async () => {
    setError('');
    const esNatural = form.tipo_persona === 'natural';
    const nombre = (form.nombre || '').trim();
    const apellido = (form.apellido || '').trim();
    const razonSocial = (form.razon_social || '').trim();

    if (esNatural) {
      if (!nombre) {
        setError('Por favor ingresa los nombres del tercero.');
        return;
      }
      if (!apellido) {
        setError('Por favor ingresa los apellidos del tercero.');
        return;
      }
    } else {
      if (!razonSocial) {
        setError('Por favor ingresa la razón social.');
        return;
      }
    }

    const doc = form.numero_documento.trim();
    if (!doc) {
      setError('Por favor ingresa el número de documento / NIT.');
      return;
    }
    const isDup = existingSuppliers.some(s => {
      const sDoc = String(s.numero_documento || '').replace(/\D/g, '');
      const curDoc = doc.replace(/\D/g, '');
      return sDoc && curDoc && sDoc === curDoc;
    });
    if (isDup) {
      setError('Ya existe un tercero registrado con este número de documento.');
      return;
    }

    const nameDisplay = esNatural ? `${nombre} ${apellido}` : razonSocial;
    const fullDoc = form.tipo_documento === 'NIT' && form.digito_verificacion ? `${doc}-${form.digito_verificacion}` : doc;
    try {
      setLoading(true);
      const created = await productoService.crearProveedor({
        ...form,
        nombre: esNatural ? nombre : razonSocial,
        apellido: esNatural ? apellido : null,
        razon_social: esNatural ? null : razonSocial,
        numero_documento: fullDoc,
        telefono: form.celular || form.telefono_fijo || '',
      });
      onSave({
        ...created,
        id: created.id,
        id_tercero: created.id,
        nombre: created.nombre || nameDisplay,
        razon_social: razonSocial || nameDisplay,
        numero_documento: created.numero_documento || fullDoc,
        telefono: form.celular || form.telefono_fijo || '',
        estado: 'activo',
        ...form,
      });
      setForm(INITIAL_SUPPLIER_FORM);
      onHide();
    } catch (err) {
      console.error('Error al guardar proveedor en DB:', err);
      setError(err.response?.data?.message || 'Error al guardar el proveedor en la base de datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="py-2 px-3 border-bottom">
        <Modal.Title className="fs-15 fw-semibold text-dark">Crear Proveedor (Tercero)</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3">
        {error && <Alert variant="danger" className="py-2 fs-12 mb-3">{error}</Alert>}
        <ModalNuevoProveedorFields
          form={form}
          update={update}
          handleDocChange={handleDocChange}
        />
      </Modal.Body>
      <Modal.Footer className="py-2 px-3 border-top d-flex justify-content-end gap-2">
        <Button variant="light" className="border text-secondary fs-13 px-3" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" className="fs-13 fw-medium px-3 d-flex align-items-center" onClick={handleSave} disabled={loading}>
          <IconifyIcon icon={loading ? "bx:loader-alt" : "bx:check"} className={`me-1 fs-15 ${loading ? 'bx-spin' : ''}`} />
          {loading ? 'Guardando...' : 'Guardar Proveedor (Tercero)'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalNuevoProveedor;

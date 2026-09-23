import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import InventarioConfigCard from '@/components/producto/inventory/InventarioConfigCard';
import CodigosBarrasCard from '@/components/producto/inventory/CodigosBarrasCard';
import ReferenciasCard from '@/components/producto/inventory/ReferenciasCard';
import ProveedoresCard from '@/components/producto/inventory/ProveedoresCard';
import ModalNuevoProveedor from '@/components/producto/inventory/ModalNuevoProveedor';
import AttributesComponentsForm from './AttributesComponentsForm';

/**
 * Paso 3: Inventario, Referencias, Códigos y Variantes.
 * Idéntico al template Reback donde las variantes se gestionan dentro de Inventario.
 */
const InventoryCodesForm = ({
  formData,
  updateField,
  catalogs = {},
  triggerDeleteConfirm,
}) => {
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [allCustomSuppliers, setAllCustomSuppliers] = useState([]);

  const suppliersList = [...(catalogs.proveedores || []), ...allCustomSuppliers];
  const inventoryTypes = catalogs.tiposInventario || [];
  const measures = catalogs.medidas || [];

  const handleSaveSupplier = (newSup) => {
    setAllCustomSuppliers(prev => [...prev, newSup]);
    const updated = [
      ...(formData.proveedores || []),
      {
        id: Date.now(),
        proveedor_id: newSup.id,
        nombre_proveedor: newSup.nombre,
        numero_documento: newSup.numero_documento,
        referencia_proveedor: '',
        principal: (formData.proveedores || []).length === 0,
        estado: 'activo',
      },
    ];
    updateField('proveedores', updated);
  };

  return (
    <div className="product-inventory-form">
      {/* Encabezado Control de Inventario */}
      <div className="mb-3">
        <h5 className="card-title mb-1">Control de Inventario</h5>
        <p className="text-muted fs-14 mb-0">Control de existencias, unidad de medida y presentación</p>
      </div>

      <InventarioConfigCard
        formData={formData}
        updateField={updateField}
        inventoryTypesCatalog={inventoryTypes}
        measuresCatalog={measures}
      />

      {/* Encabezado Referencias y Códigos */}
      <div className="mb-3 mt-4">
        <h5 className="card-title mb-1">Referencias y Códigos</h5>
        <p className="text-muted fs-14 mb-0">
          Gestión de códigos de barras (EAN/UPC), referencias comerciales y proveedores
        </p>
      </div>

      <Row>
        <Col lg={12} className="mb-4">
          <CodigosBarrasCard
            formData={formData}
            updateField={updateField}
            triggerDeleteConfirm={triggerDeleteConfirm}
          />
        </Col>

        <Col lg={6} className="mb-4">
          <ReferenciasCard
            formData={formData}
            updateField={updateField}
            triggerDeleteConfirm={triggerDeleteConfirm}
          />
        </Col>

        <Col lg={6} className="mb-4">
          <ProveedoresCard
            formData={formData}
            updateField={updateField}
            suppliersCatalog={suppliersList}
            onOpenCreateSupplier={() => setShowSupplierModal(true)}
            triggerDeleteConfirm={triggerDeleteConfirm}
          />
        </Col>
      </Row>

      {/* SECCIÓN VARIANTES DENTRO DE INVENTARIO (IDÉNTICO A REBACK) */}
      <div className="mt-4 pt-3 border-top">
        <AttributesComponentsForm
          formData={formData}
          updateField={updateField}
          catalogs={catalogs}
          triggerDeleteConfirm={triggerDeleteConfirm}
        />
      </div>

      <ModalNuevoProveedor
        show={showSupplierModal}
        onHide={() => setShowSupplierModal(false)}
        onSave={handleSaveSupplier}
        existingSuppliers={suppliersList}
      />
    </div>
  );
};

export default InventoryCodesForm;

import { useState, useMemo } from 'react';
import ListasPreciosForm from './ListasPreciosForm';
import ListasPreciosTable from './ListasPreciosTable';
import ModalEditarListaPrecio from './ModalEditarListaPrecio';
import {
  calcPriceListByBase,
  calcPriceListByUtilidad,
  calcPriceListByVenta,
} from './pricingCalculations';

/**
 * Sección completa de Listas de Precios.
 * Idéntico al template Reback y a la captura de pantalla del usuario.
 */
const ListasPreciosCard = ({
  formData,
  updateField,
  priceListsCatalog = [],
  costoBase = 85000,
  onOpenCreateList,
  triggerDeleteConfirm,
}) => {
  const allPriceLists = priceListsCatalog;
  const listasPrecios = useMemo(() => formData?.listas_precios || [], [formData?.listas_precios]);

  const [newPriceList, setNewPriceList] = useState({
    lista_precio_id: '',
    precio_base: 145000,
    utilidad_porcentaje: 70.59,
    impuesto_porcentaje: 19,
    precio_venta: 172550,
    estado: 'activo'
  });

  const availablePriceLists = allPriceLists.filter(
    lp => !listasPrecios.some(item => String(item.lista_precio_id) === String(lp.id))
  );
  const currentSelectionAvailable = availablePriceLists.some(
    lp => String(lp.id) === String(newPriceList.lista_precio_id)
  );
  const selectedPriceListId = currentSelectionAvailable
    ? String(newPriceList.lista_precio_id)
    : (availablePriceLists[0] ? String(availablePriceLists[0].id) : '');

  const taxPercent = (formData?.impuestos_venta || [])
    .filter(t => t.tipo_calculo === 'PORCENTAJE')
    .reduce((acc, t) => acc + (parseFloat(t.porcentaje) || 0), 0) || 19;

  const handlePriceBaseChange = (val) => {
    const res = calcPriceListByBase(val, costoBase, taxPercent);
    setNewPriceList(prev => ({ ...prev, ...res }));
  };

  const handleUtilidadChange = (val) => {
    const res = calcPriceListByUtilidad(val, costoBase, newPriceList.precio_base, taxPercent);
    setNewPriceList(prev => ({ ...prev, ...res }));
  };

  const handlePrecioVentaChange = (val) => {
    const res = calcPriceListByVenta(val, costoBase, taxPercent);
    setNewPriceList(prev => ({ ...prev, ...res }));
  };

  const handleAddPriceList = () => {
    const isAdded = listasPrecios.some(
      item => String(item.lista_precio_id) === selectedPriceListId
    );
    if (isAdded || !selectedPriceListId) return;

    const lpMeta = allPriceLists.find(lp => String(lp.id) === selectedPriceListId);
    if (!lpMeta) return;
    const pBase = parseFloat(newPriceList.precio_base) || parseFloat(formData?.precio_base) || 0;
    const cBase = parseFloat(costoBase) || 0;
    const utilPorc = parseFloat(newPriceList.utilidad_porcentaje) || (cBase > 0 ? ((pBase - cBase) / cBase) * 100 : 0);
    const utilVal = pBase - cBase;
    const pVenta = parseFloat(newPriceList.precio_venta) || (pBase * (1 + taxPercent / 100));

    const newItem = {
      id: Date.now(),
      lista_precio_id: selectedPriceListId,
      nombre_lista: lpMeta.nombre,
      precio_base: Math.round(pBase * 100) / 100,
      utilidad_porcentaje: Math.round(utilPorc * 100) / 100,
      utilidad_valor: Math.round(utilVal * 100) / 100,
      impuesto_porcentaje: taxPercent,
      precio_venta: Math.round(pVenta * 100) / 100,
      estado: newPriceList.estado || 'activo'
    };

    updateField('listas_precios', [...listasPrecios, newItem]);
  };

  const isListAlreadyAdded = Boolean(selectedPriceListId) && listasPrecios.some(
    item => String(item.lista_precio_id) === selectedPriceListId
  );

  const enrichedLists = allPriceLists.map(lp => ({
    ...lp,
    isAssigned: listasPrecios.some(item => String(item.lista_precio_id) === String(lp.id))
  }));

  const [editingList, setEditingList] = useState(null);

  return (
    <>
      <div className="mb-3 mt-4">
        <h5 className="card-title mb-1">Listas de Precios</h5>
        <p className="text-muted fs-14 mb-0">Precios diferenciados para mayoristas, distribuidores, proveedores y canales</p>
      </div>

      <ListasPreciosForm
        allPriceLists={enrichedLists}
        newPriceList={{ ...newPriceList, lista_precio_id: selectedPriceListId }}
        isListAlreadyAdded={isListAlreadyAdded}
        precioBase={formData?.precio_base}
        onListChange={val => setNewPriceList(prev => ({ ...prev, lista_precio_id: val }))}
        onPriceBaseChange={handlePriceBaseChange}
        onUtilidadChange={handleUtilidadChange}
        onPrecioVentaChange={handlePrecioVentaChange}
        onAddPriceList={handleAddPriceList}
        onOpenCreateList={onOpenCreateList}
      />

      <ListasPreciosTable
        listasPrecios={listasPrecios}
        onToggleState={id => updateField('listas_precios', listasPrecios.map(it => it.id === id ? { ...it, estado: it.estado === 'activo' ? 'inactivo' : 'activo' } : it))}
        onEdit={item => setEditingList(item)}
        onRemove={id => updateField('listas_precios', listasPrecios.filter(it => it.id !== id))}
        triggerDeleteConfirm={triggerDeleteConfirm}
      />

      <ModalEditarListaPrecio
        show={Boolean(editingList)}
        item={editingList}
        costoBase={costoBase}
        onHide={() => setEditingList(null)}
        onSave={updated => updateField('listas_precios', listasPrecios.map(it => it.id === updated.id ? updated : it))}
      />
    </>
  );
};

export default ListasPreciosCard;

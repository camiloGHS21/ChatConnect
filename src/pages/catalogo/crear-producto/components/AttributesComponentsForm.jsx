import { useState, useEffect } from 'react';
import AttributesSelectorCard from '@/components/producto/attributes/AttributesSelectorCard';
import AttributesAssignedList from '@/components/producto/attributes/AttributesAssignedList';
import VariantsTableCard from '@/components/producto/attributes/VariantsTableCard';
import ModalNuevoAtributo from '@/components/producto/attributes/ModalNuevoAtributo';
import ModalComponente from '@/components/producto/attributes/ModalComponente';
import { regenerateVariants } from '@/components/producto/attributes/variantGenerator';
import { buildInitialAttributes } from '@/components/producto/attributes/attributeHelpers';

const AttributesComponentsForm = ({
  formData,
  updateField,
  catalogs = {},
  triggerDeleteConfirm,
}) => {
  const [allAttributes, setAllAttributes] = useState(() =>
    buildInitialAttributes(catalogs.atributos || [], catalogs.atributosComponentes || [])
  );
  const [showAttrModal, setShowAttrModal] = useState(false);
  const [compModal, setCompModal] = useState({ show: false, attr: null, initialData: null });

  useEffect(() => {
    const rawAttrs = catalogs.atributos || [];
    const rawComps = catalogs.atributosComponentes || [];
    if (rawAttrs.length > 0) {
      setAllAttributes(buildInitialAttributes(rawAttrs, rawComps));
    }
  }, [catalogs.atributos, catalogs.atributosComponentes]);

  const handleAssignAttribute = (attrId) => {
    const meta = allAttributes.find(a => String(a.id_atributo) === String(attrId));
    if (!meta) return;
    const initialSelected = meta.componentes.slice(0, 1).map(c => c.id_atributo_componente);
    const updated = [
      ...(formData.atributos_asignados || []),
      {
        id_atributo: meta.id_atributo,
        nombre: meta.nombre,
        obligatorio: meta.obligatorio || false,
        componentes_seleccionados: initialSelected,
      },
    ];
    updateField('atributos_asignados', updated);
    updateField('variantes', regenerateVariants(updated, allAttributes, formData));
  };

  const handleRemoveAttribute = (attrId) => {
    const updated = (formData.atributos_asignados || []).filter(a => String(a.id_atributo) !== String(attrId));
    updateField('atributos_asignados', updated);
    updateField('variantes', regenerateVariants(updated, allAttributes, formData));
  };

  const handleToggleComponent = (attrId, compId) => {
    const updated = (formData.atributos_asignados || []).map(a => {
      if (String(a.id_atributo) === String(attrId)) {
        const cur = (a.componentes_seleccionados || []).map(String);
        const sId = String(compId);
        const next = cur.includes(sId) ? cur.filter(x => x !== sId) : [...cur, sId];
        return { ...a, componentes_seleccionados: next };
      }
      return a;
    });
    updateField('atributos_asignados', updated);
    updateField('variantes', regenerateVariants(updated, allAttributes, formData));
  };

  const handleSaveComponent = (attrId, compData, isEditing) => {
    const updatedPool = allAttributes.map(attr => {
      if (String(attr.id_atributo) === String(attrId)) {
        const comps = isEditing
          ? attr.componentes.map(c => String(c.id_atributo_componente) === String(compData.id_atributo_componente) ? compData : c)
          : [...attr.componentes, compData];
        return { ...attr, componentes: comps };
      }
      return attr;
    });
    setAllAttributes(updatedPool);

    const updatedAssigned = (formData.atributos_asignados || []).map(a => {
      if (!isEditing && String(a.id_atributo) === String(attrId)) {
        return { ...a, componentes_seleccionados: [...(a.componentes_seleccionados || []), compData.id_atributo_componente] };
      }
      return a;
    });
    updateField('atributos_asignados', updatedAssigned);
    updateField('variantes', regenerateVariants(updatedAssigned, updatedPool, formData));
  };

  const handleDeleteComponent = (attrId, compId) => {
    const updatedPool = allAttributes.map(attr => {
      if (String(attr.id_atributo) === String(attrId)) {
        return { ...attr, componentes: attr.componentes.filter(c => String(c.id_atributo_componente) !== String(compId)) };
      }
      return attr;
    });
    setAllAttributes(updatedPool);
    const updatedAssigned = (formData.atributos_asignados || []).map(a => {
      if (String(a.id_atributo) === String(attrId)) {
        return { ...a, componentes_seleccionados: (a.componentes_seleccionados || []).filter(x => String(x) !== String(compId)) };
      }
      return a;
    });
    updateField('atributos_asignados', updatedAssigned);
    updateField('variantes', regenerateVariants(updatedAssigned, updatedPool, formData));
  };

  const handleToggleObligatorio = (attrId, isObl) => {
    updateField('atributos_asignados', (formData.atributos_asignados || []).map(a =>
      String(a.id_atributo) === String(attrId) ? { ...a, obligatorio: isObl } : a
    ));
  };

  return (
    <>
      <AttributesSelectorCard
        allAttributes={allAttributes}
        assignedAttributes={formData.atributos_asignados || []}
        onAssignAttribute={handleAssignAttribute}
        onOpenNewAttrModal={() => setShowAttrModal(true)}
      />

      <AttributesAssignedList
        assignedAttributes={formData.atributos_asignados || []}
        allAttributes={allAttributes}
        onToggleComponent={handleToggleComponent}
        onToggleObligatorio={handleToggleObligatorio}
        onOpenAddComponent={(attr) => setCompModal({ show: true, attr, initialData: null })}
        onOpenEditComponent={(attrId, attrNombre, comp) => setCompModal({ show: true, attr: { id_atributo: attrId, nombre: attrNombre }, initialData: comp })}
        onDeleteComponent={handleDeleteComponent}
        onRemoveAttribute={handleRemoveAttribute}
        triggerDeleteConfirm={triggerDeleteConfirm}
      />

      <VariantsTableCard
        variantes={formData.variantes || []}
      />

      <ModalNuevoAtributo
        show={showAttrModal}
        onHide={() => setShowAttrModal(false)}
        onSave={(newAttr) => setAllAttributes(prev => [...prev, newAttr])}
        existingAttributes={allAttributes}
      />

      <ModalComponente
        show={compModal.show}
        attribute={compModal.attr}
        initialData={compModal.initialData}
        onHide={() => setCompModal({ show: false, attr: null, initialData: null })}
        onSave={handleSaveComponent}
      />
    </>
  );
};

export default AttributesComponentsForm;

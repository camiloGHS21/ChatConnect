export const buildInitialAttributes = (rawAttrs = [], rawComps = []) => {
  return rawAttrs.map(a => ({
    id_atributo: a.id || a.id_atributo,
    nombre: a.nombre,
    codigo: a.codigo,
    descripcion: a.descripcion,
    permite_multiples: a.permite_multiples,
    genera_variante: a.genera_variante,
    obligatorio: a.obligatorio,
    componentes: (a.componentes && a.componentes.length > 0)
      ? a.componentes.map(c => ({ ...c, id_atributo_componente: c.id || c.id_atributo_componente }))
      : rawComps
          .filter(c => String(c.atributo_id) === String(a.id || a.id_atributo))
          .map(c => ({
            id_atributo_componente: c.id || c.id_atributo_componente,
            nombre: c.nombre,
            codigo: c.codigo,
            valor: c.valor,
            orden: c.orden,
          })),
  }));
};

import { useState, useEffect } from 'react';
import productoService from '@/services/productoService';

/**
 * Hook para cargar y estructurar los catálogos maestros desde PostgreSQL.
 */
export const useProductCatalogs = (updateField) => {
  const [catalogs, setCatalogs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [catData, code] = await Promise.all([
          productoService.getCatalogos(1),
          productoService.getSiguienteCodigo(1),
        ]);
        if (!isMounted) return;

        const categoriesWithSubs = (catData.categorias || []).map(cat => ({
          ...cat,
          subcategorias: (catData.subcategorias || []).filter(sub => String(sub.categoria_id) === String(cat.id)),
        }));

        const attributesWithComps = (catData.atributos || []).map(attr => ({
          ...attr,
          id_atributo: attr.id,
          componentes: (catData.atributosComponentes || [])
            .filter(comp => String(comp.atributo_id) === String(attr.id))
            .map(comp => ({
              ...comp,
              id_atributo_componente: comp.id,
            })),
        }));

        setCatalogs({
          ...catData,
          categorias: categoriesWithSubs,
          atributos: attributesWithComps,
        });

        if (code && updateField) {
          updateField('codigo_interno', code);
        }
      } catch (err) {
        console.warn('Error al cargar catálogos desde backend:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  return { catalogs, setCatalogs, loading };
};

export default useProductCatalogs;

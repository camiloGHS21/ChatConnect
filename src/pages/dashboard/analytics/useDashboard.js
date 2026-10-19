import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/dashboardService';

/**
 * Hook de orquestación del panel de inicio. Consulta el resumen real
 * (/dashboard) y adapta la respuesta a los modelos que consumen los
 * componentes presentacionales.
 */

const ICONOS_KPI = [
  'bxl:whatsapp',
  'iconamoon:comment-dots-duotone',
  'iconamoon:shopping-bag-duotone',
  'iconamoon:box-duotone',
];

const VARIANTES = ['primary', 'info', 'success', 'warning', 'danger'];

const numero = (valor) => Number(valor || 0).toLocaleString('es-CO');

/** Formatea un monto en COP de forma compacta (ej. $4,8M). */
const formatoCop = (valor) => {
  const n = Number(valor || 0);
  if (n >= 1_000_000) return `$${(n / 1_000_000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}M`;
  if (n >= 1_000) return `$${(n / 1_000).toLocaleString('es-CO', { maximumFractionDigits: 0 })}K`;
  return `$${n.toLocaleString('es-CO')}`;
};

export const useDashboard = (empresaId = 1) => {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getResumen(empresaId);
      setResumen(data);
    } catch (err) {
      console.error('Error al cargar el panel de inicio:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const kpis = resumen?.kpis ?? {};
  const automatizacion = resumen?.automatizacion ?? { ia: 0, humano: 0, ia_porcentaje: 0 };
  const series = resumen?.series ?? { etiquetas: [], mensajes: [], pedidos: [] };

  const tarjetas = [
    { icon: ICONOS_KPI[0], name: 'Clientes WhatsApp', amount: numero(kpis.clientes_whatsapp), variant: 'success' },
    { icon: ICONOS_KPI[1], name: 'Conversaciones', amount: numero(kpis.conversaciones), variant: 'primary' },
    { icon: ICONOS_KPI[2], name: 'Pedidos Hoy', amount: `${numero(kpis.pedidos_hoy)} (${formatoCop(kpis.monto_hoy)})`, variant: 'warning' },
    { icon: ICONOS_KPI[3], name: 'Alertas de existencias', amount: `${numero(kpis.stock_criticos)} críticos`, variant: 'danger' },
  ];

  const zonasEntrega = (resumen?.zonas_entrega ?? []).map((z, i) => ({
    icon: 'tabler:map-pin',
    name: z.name,
    value: z.porcentaje,
    amount: z.amount,
    variant: VARIANTES[i % VARIANTES.length],
  }));

  const canalesAtencion = (resumen?.canales_atencion ?? []).map((c) => ({
    name: c.name,
    percentage: c.porcentaje,
    amount: c.amount,
  }));

  const topProductos = (resumen?.top_productos ?? []).map((p) => ({
    ...p,
    precio: formatoCop(p.precio),
  }));

  return {
    loading,
    error,
    recargar: cargar,
    tarjetas,
    kpis,
    automatizacion,
    series,
    ultimosPedidos: resumen?.ultimos_pedidos ?? [],
    zonasEntrega,
    canalesAtencion,
    topProductos,
  };
};

export default useDashboard;

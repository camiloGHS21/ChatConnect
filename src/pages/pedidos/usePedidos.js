import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { pedidoService } from '@/services/pedidoService';

/**
 * Hook personalizado para la gestión y orquestación del módulo de pedidos.
 * Conectado en tiempo real a PostgreSQL a través de la API NestJS /pedido.
 */
export const usePedidos = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalOrders: 0,
    totalVentas: 0,
    totalEnCurso: 0,
    totalEntregados: 0,
  });

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [listaPedidos, metricas] = await Promise.all([
        pedidoService.getPedidos(1),
        pedidoService.getKpis(1),
      ]);
      setOrders(listaPedidos || []);
      if (metricas) setKpis(metricas);
    } catch (err) {
      console.error('Error al cargar pedidos desde el backend:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.estado === statusFilter;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesStatus;

    const matchesSearch =
      (o.numero_pedido && o.numero_pedido.toLowerCase().includes(term)) ||
      (o.cliente_nombre && o.cliente_nombre.toLowerCase().includes(term)) ||
      (o.whatsapp && o.whatsapp.includes(term)) ||
      (o.whatsapp_raw && o.whatsapp_raw.includes(term));

    return matchesStatus && matchesSearch;
  });

  const totalVentas = kpis.totalVentas || orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const totalEntregados = kpis.totalEntregados;
  const totalEnCurso = kpis.totalEnCurso;

  const handleOpenDetail = async (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
    try {
      const detalleCompleto = await pedidoService.getPedido(order.id, 1);
      if (detalleCompleto) {
        setSelectedOrder(detalleCompleto);
      }
    } catch (err) {
      console.warn('Usando datos en caché para detalle de pedido:', err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const actualizado = await pedidoService.actualizarEstado(orderId, newStatus, `Cambio a ${newStatus}`, 1);
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, ...actualizado, estado: newStatus } : ord))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, ...actualizado, estado: newStatus }));
      }
      pedidoService.getKpis(1).then((m) => {
        if (m) setKpis(m);
      }).catch(() => {});
    } catch (err) {
      console.error('Error al actualizar estado del pedido:', err);
    }
  };

  const handleNotificarDespachoChat = (order) => {
    if (order.estado !== 'entregado') {
      handleUpdateStatus(order.id, 'despachado');
    }
    const clienteId = order.cliente_id || '';
    const numPedido = encodeURIComponent(order.numero_pedido || '');
    navigate(`/chat?clienteId=${clienteId}&pedido=${numPedido}&action=despachado`);
  };

  const handleNavigateChat = (clienteId) => {
    navigate(`/chat?clienteId=${clienteId}`);
  };

  return {
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    selectedOrder,
    showDetailModal,
    setShowDetailModal,
    orders,
    filteredOrders,
    loading,
    totalOrders: kpis.totalOrders || orders.length,
    totalVentas,
    totalEntregados,
    totalEnCurso,
    cargarDatos,
    handleOpenDetail,
    handleUpdateStatus,
    handleNotificarDespachoChat,
    handleNavigateChat,
  };
};

export default usePedidos;

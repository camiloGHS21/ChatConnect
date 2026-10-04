import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHATCONNECT_PEDIDOS } from '@/assets/data/chatconnect-data';

export const usePedidos = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [orders, setOrders] = useState(CHATCONNECT_PEDIDOS);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.estado === statusFilter;
    const matchesSearch =
      o.numero_pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.whatsapp.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const totalVentas = orders.reduce((acc, o) => acc + o.total, 0);
  const totalEntregados = orders.filter((o) => o.estado === 'entregado').length;
  const totalDespachados = orders.filter((o) => o.estado === 'despachado').length;
  const totalEnPrep = orders.filter((o) => o.estado === 'en_preparacion').length;
  const totalEnCurso = totalEnPrep + totalDespachados;

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, estado: newStatus } : ord))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, estado: newStatus }));
    }
  };

  const handleNotificarDespachoChat = (order) => {
    if (order.estado !== 'entregado') {
      handleUpdateStatus(order.id, 'despachado');
    }
    navigate(`/chat?clienteId=${order.cliente_id}&pedido=${order.numero_pedido}&action=despachado`);
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
    totalVentas,
    totalEntregados,
    totalEnCurso,
    handleOpenDetail,
    handleUpdateStatus,
    handleNotificarDespachoChat,
    handleNavigateChat,
  };
};

export default usePedidos;

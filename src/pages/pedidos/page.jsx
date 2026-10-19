import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import PedidosKpiCards from './components/PedidosKpiCards';
import PedidosTable from './components/PedidosTable';
import PedidoDetailModal from './components/PedidoDetailModal';
import usePedidos from './usePedidos';

const PedidosPage = () => {
  const {
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    selectedOrder,
    showDetailModal,
    setShowDetailModal,
    filteredOrders,
    loading,
    totalOrders,
    totalVentas,
    totalEntregados,
    totalEnCurso,
    handleOpenDetail,
    handleUpdateStatus,
    handleNotificarDespachoChat,
    handleNavigateChat,
    handleExport,
  } = usePedidos();

  return (
    <>
      <PageMetaData title="Pedidos WhatsApp - ChatConnect" />
      <PageBreadcrumb title="Gestión de Pedidos" subName="Órdenes WhatsApp Meta Cloud API" />

      <PedidosKpiCards
        totalOrders={totalOrders}
        totalEnCurso={totalEnCurso}
        totalEntregados={totalEntregados}
        totalVentas={totalVentas}
      />

      <PedidosTable
        orders={filteredOrders}
        loading={loading}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenDetail={handleOpenDetail}
        onUpdateStatus={handleUpdateStatus}
        onNotificarDespacho={handleNotificarDespachoChat}
        onNavigateChat={handleNavigateChat}
        onExport={handleExport}
      />

      <PedidoDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        order={selectedOrder}
        onUpdateStatus={handleUpdateStatus}
        onNotificarDespacho={handleNotificarDespachoChat}
        onExport={handleExport}
      />
    </>
  );
};

export default PedidosPage;

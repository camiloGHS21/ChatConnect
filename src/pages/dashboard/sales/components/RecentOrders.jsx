import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardTitle, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getAllOrders } from '@/helpers/data';
import { formatDate, statusLabel, paymentMethodLabel } from '../../spanishPresentation';
const RecentOrders = () => {
  const [orders, setOrders] = useState();
  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllOrders();
      setOrders(data);
    };
    fetchData();
  }, []);
  return <Card>
      <CardBody>
        <div className="d-flex align-items-center justify-content-between">
          <CardTitle>Pedidos recientes</CardTitle>
          <Button variant="primary" size="sm">
            <span className="icons-center">
              <IconifyIcon icon="bx:plus" className="me-1" />
              Crear pedido
            </span>
          </Button>
        </div>
      </CardBody>
      <div className="table-responsive table-centered">
        <table className="table mb-0">
          <thead className="bg-light bg-opacity-50">
            <tr>
              <th className="border-0 py-2">ID del pedido</th>
              <th className="border-0 py-2">Fecha</th>
              <th className="border-0 py-2">Producto</th>
              <th className="border-0 py-2">Nombre del cliente</th>
              <th className="border-0 py-2">Correo electrónico</th>
              <th className="border-0 py-2">Teléfono</th>
              <th className="border-0 py-2">Dirección</th>
              <th className="border-0 py-2">Forma de pago</th>
              <th className="border-0 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders?.slice(0, 5).map((order) => <tr key={order.id}>
                <td>
                  <Link to={`/ecommerce/orders/${order.id}`}>{order.id}</Link>
                </td>
                <td>{formatDate(order.createdAt)}</td>
                {order.product && <td>
                    <img src={order.product?.images[0]} alt="Imagen del producto" className="img-fluid avatar-sm" />
                  </td>}
                <td>
                  <Link to="">{order.customer?.name}</Link>
                </td>
                <td>{order.customer?.email}</td>
                <td>{order.customer?.phone}</td>
                <td>{order.customer?.address}</td>
                <td>{paymentMethodLabel(order.paymentMethod)}</td>
                <td>
                  <div className="icons-center">
                    <IconifyIcon icon="bxs:circle" className={clsx('me-1', order.status === 'Cancelled' ? 'text-danger' : order.status === 'Processing' ? 'text-primary' : 'text-success')} />
                    {statusLabel(order.status)}
                  </div>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
      <div className="align-items-center justify-content-between row g-0 text-center text-sm-start p-3 border-top">
        <div className="col-sm">
          <div className="text-muted">
            Mostrando &nbsp;
            <span className="fw-semibold">5</span>&nbsp; de &nbsp;
            <span className="fw-semibold">90.521</span>&nbsp; pedidos
          </div>
        </div>
        <Col sm="auto" className="mt-3 mt-sm-0">
          <ul className="pagination pagination-rounded m-0">
            <li className="page-item">
              <Link to="" className="page-link" aria-label="Página anterior">
                <IconifyIcon icon="bx:left-arrow-alt" />
              </Link>
            </li>
            <li className="page-item active">
              <Link to="" className="page-link">
                1
              </Link>
            </li>
            <li className="page-item">
              <Link to="" className="page-link">
                2
              </Link>
            </li>
            <li className="page-item">
              <Link to="" className="page-link">
                3
              </Link>
            </li>
            <li className="page-item">
              <Link to="" className="page-link" aria-label="Página siguiente">
                <IconifyIcon icon="bx:right-arrow-alt" />
              </Link>
            </li>
          </ul>
        </Col>
      </div>
    </Card>;
};
export default RecentOrders;
import { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap';
import { currency } from '@/context/constants';
import { getAllTransactions } from '@/helpers/data';
import { formatDate, formatNumber, statusLabel } from '../../spanishPresentation';
const Transactions = () => {
  const [transactionsData, setTransactionsData] = useState();
  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllTransactions();
      setTransactionsData(data);
    };
    fetchData();
  }, []);
  return <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <CardTitle>Transacciones recientes</CardTitle>
        <Button variant="light" size="sm">
          Ver todas
        </Button>
      </CardHeader>
      <CardBody>
        <div className="table-responsive">
          <table className="table table-hover mb-0 table-centered">
            <thead>
              <tr>
                <th className="py-1">ID</th>
                <th className="py-1">Fecha</th>
                <th className="py-1">Importe</th>
                <th className="py-1">Estado</th>
                <th className="py-1">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {transactionsData?.slice(0, 5).map((transaction) => <tr key={transaction.id}>
                  <td>#{transaction.id}</td>
                  <td>{formatDate(transaction.date)}</td>
                  <td>
                    {currency}
                    {formatNumber(transaction.amount)}
                  </td>
                  <td>
                    <span className={`badge bg-${transaction.status === 'Dr.' ? 'danger' : 'success'}`}>{statusLabel(transaction.status)}</span>
                  </td>
                  <td>{transaction.description}</td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>;
};
export default Transactions;
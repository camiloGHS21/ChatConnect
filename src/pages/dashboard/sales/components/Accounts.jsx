import { accountData } from '../data';
import { formatDate, statusLabel } from '../../spanishPresentation';
import { Button, Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap';
const Accounts = () => {
  return <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <CardTitle>Cuentas nuevas</CardTitle>
        <Button variant="light" size="sm">
          Ver todas
        </Button>
      </CardHeader>
      <CardBody className="pb-1">
        <div className="table-responsive">
          <table className="table table-hover mb-0 table-centered">
            <thead>
              <tr>
                <th className="py-1">ID</th>
                <th className="py-1">Fecha</th>
                <th className="py-1">Usuario</th>
                <th className="py-1">Cuenta</th>
                <th className="py-1">Nombre de usuario</th>
              </tr>
            </thead>
            <tbody>
              {accountData.map((account) => {
              return <tr key={account.id}>
                    <td>{account.id}</td>
                    <td>{formatDate(account.date)}</td>
                    <td>
                      <img src={account.user.avatar} alt="Foto de perfil" className="img-fluid avatar-xs rounded-circle" />
                      <span className="align-middle ms-1">{account.user.name}</span>
                    </td>
                    <td>
                      <span className={`badge badge-soft-${account.status === 'Blocked' ? 'danger' : account.status === 'Pending' ? 'warning' : 'success'}`}>
                        {statusLabel(account.status)}
                      </span>
                    </td>
                    <td>{account.username}</td>
                  </tr>;
            })}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>;
};
export default Accounts;
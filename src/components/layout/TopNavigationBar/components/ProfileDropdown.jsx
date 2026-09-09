import { Link } from 'react-router-dom';
import { Dropdown, DropdownDivider, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import avatar1 from '@/assets/images/users/avatar-1.jpg';
import { useAuthContext } from '@/context/useAuthContext';

const ProfileDropdown = () => {
  const { user, removeSession } = useAuthContext();
  const userName = user?.user?.nombre || user?.nombre || 'Usuario';

  return (
    <Dropdown className="topbar-item" align={'end'}>
      <DropdownToggle as="button" type="button" className="topbar-button content-none" id="page-header-user-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <span className="d-flex align-items-center">
          <img className="rounded-circle" width={32} height={32} src={avatar1} alt="avatar-3" />
        </span>
      </DropdownToggle>
      <DropdownMenu>
        <DropdownHeader as="h6">¡Hola, {userName}!</DropdownHeader>
        <DropdownItem as={Link} to="/dashboard">
          <IconifyIcon icon="bx:user-circle" className="text-muted fs-18 align-middle me-1" />
          <span className="align-middle">Perfil</span>
        </DropdownItem>
        <DropdownItem as={Link} to="/chat">
          <IconifyIcon icon="bx:message-dots" className="text-muted fs-18 align-middle me-1" />
          <span className="align-middle">Chat</span>
        </DropdownItem>
        <DropdownDivider className="dropdown-divider my-1" />
        <DropdownItem
          as="button"
          type="button"
          className="text-danger w-100 text-start"
          onClick={(e) => {
            e.preventDefault();
            removeSession();
          }}
        >
          <IconifyIcon icon="bx:log-out" className="fs-18 align-middle me-1" />
          <span className="align-middle">Cerrar Sesión</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;
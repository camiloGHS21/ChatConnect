import { useEffect, useRef } from 'react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useLayoutContext } from '@/context/useLayoutContext';
import { useLocation } from 'react-router-dom';
const LeftSideBarToggle = () => {
  const {
    menu: {
      size
    },
    changeMenu: {
      size: changeMenuSize
    },
    toggleBackdrop
  } = useLayoutContext();
  const {
    pathname
  } = useLocation();
  const previousPathname = useRef(pathname);
  const handleMenuSize = () => {
    if (size === 'hidden') {
      toggleBackdrop();
      return;
    }
    if (size === 'condensed') {
      changeMenuSize('default');
    } else {
      changeMenuSize('condensed');
    }
  };
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    if (size === 'hidden') toggleBackdrop();
  }, [pathname, size, toggleBackdrop]);
  return <div className="topbar-item">
      <button onClick={handleMenuSize} type="button" className="button-toggle-menu" aria-label="Alternar menú lateral">
        <IconifyIcon icon="iconamoon:menu-burger-horizontal" className="fs-22" />
      </button>
    </div>;
};
export default LeftSideBarToggle;
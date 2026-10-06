import { useEffect, useRef } from 'react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useLayoutContext } from '@/context/useLayoutContext';
import useViewPort from '@/hooks/useViewPort';
const HoverMenuToggle = () => {
  const {
    menu: {
      size
    },
    changeMenu: {
      size: changeMenuSize
    }
  } = useLayoutContext();
  const {
    width
  } = useViewPort();
  const previousWidth = useRef(null);
  useEffect(() => {
    if (previousWidth.current === width) return;
    previousWidth.current = width;
    if (width <= 1140) {
      if (size !== 'hidden') changeMenuSize('hidden');
    }
  }, [width, size, changeMenuSize]);
  const handleHoverMenu = () => {
    if (size === 'sm-hover-active') changeMenuSize('sm-hover');else changeMenuSize('sm-hover-active');
  };
  return <button onClick={handleHoverMenu} type="button" className="button-sm-hover" aria-label={size === 'sm-hover-active' ? 'Contraer barra lateral' : 'Mostrar barra lateral completa'}>
      <span className="button-sm-hover-icon">
        <IconifyIcon icon="iconamoon:arrow-left-4-square-duotone" />
      </span>
    </button>;
};
export default HoverMenuToggle;
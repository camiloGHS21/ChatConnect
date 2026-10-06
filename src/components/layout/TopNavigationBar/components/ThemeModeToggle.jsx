import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useLayoutContext } from '@/context/useLayoutContext';
const ThemeModeToggle = () => {
  const {
    theme,
    changeTheme
  } = useLayoutContext();
  const isDark = theme === 'dark';
  return <div className="topbar-item">
      <button type="button" onClick={() => changeTheme(isDark ? 'light' : 'dark')} className="topbar-button" aria-label={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}>
        <IconifyIcon icon={`iconamoon:mode-${isDark ? 'light' : 'dark'}-duotone`} className="fs-24 align-middle" />
      </button>
    </div>;
};
export default ThemeModeToggle;
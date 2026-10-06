import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import useQueryParams from '@/hooks/useQueryParams';
import { toggleDocumentAttribute } from '@/utils/layout';
const ThemeContext = createContext(undefined);
const useLayoutContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useLayoutContext can only be used within LayoutProvider');
  }
  return context;
};
const getPreferredTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const LayoutProvider = ({
  children
}) => {
  const queryParams = useQueryParams();
  const override = !!(queryParams.layout_theme || queryParams.topbar_theme || queryParams.menu_theme || queryParams.menu_size);
  const { layout_theme, topbar_theme, menu_theme, menu_size } = queryParams;
  const preferredTheme = getPreferredTheme();
  const INIT_STATE = useMemo(() => ({
    theme: layout_theme ? layout_theme : preferredTheme,
    topbarTheme: topbar_theme ? topbar_theme : 'light',
    menu: {
      theme: menu_theme ? menu_theme : 'light',
      size: menu_size ? menu_size : 'condensed'
    }
  }), [layout_theme, topbar_theme, menu_theme, menu_size, preferredTheme]);
  const [settings, setSettings] = useLocalStorage('__CHATCONNECT_CONFIG__', INIT_STATE, override);
  const [offcanvasStates, setOffcanvasStates] = useState({
    showThemeCustomizer: false,
    showActivityStream: false,
    showBackdrop: false
  });

  // toggle backdrop
  const toggleBackdrop = useCallback(() => {
    const htmlTag = document.getElementsByTagName('html')[0];
    if (offcanvasStates.showBackdrop) htmlTag.classList.remove('sidebar-enable');else htmlTag.classList.add('sidebar-enable');
    setOffcanvasStates({
      ...offcanvasStates,
      showBackdrop: !offcanvasStates.showBackdrop
    });
  }, [offcanvasStates]);
  const contextValue = useMemo(() => {
    // update settings
    const updateSettings = _newSettings => setSettings({
      ...settings,
      ..._newSettings
    });

    // update theme mode
    const changeTheme = newTheme => {
      updateSettings({
        theme: newTheme
      });
    };

    // change topbar theme
    const changeTopbarTheme = newTheme => {
      updateSettings({
        topbarTheme: newTheme
      });
    };

    // change menu theme
    const changeMenuTheme = newTheme => {
      updateSettings({
        menu: {
          ...settings.menu,
          theme: newTheme
        }
      });
    };

    // change menu theme
    const changeMenuSize = newSize => {
      updateSettings({
        menu: {
          ...settings.menu,
          size: newSize
        }
      });
    };

    // toggle theme customizer offcanvas
    const toggleThemeCustomizer = () => {
      setOffcanvasStates({
        ...offcanvasStates,
        showThemeCustomizer: !offcanvasStates.showThemeCustomizer
      });
    };

    // toggle activity stream offcanvas
    const toggleActivityStream = () => {
      setOffcanvasStates({
        ...offcanvasStates,
        showActivityStream: !offcanvasStates.showActivityStream
      });
    };
    const themeCustomizer = {
      open: offcanvasStates.showThemeCustomizer,
      toggle: toggleThemeCustomizer
    };
    const activityStream = {
      open: offcanvasStates.showActivityStream,
      toggle: toggleActivityStream
    };

    const resetSettings = () => updateSettings(INIT_STATE);
    return {
      ...settings,
      themeMode: settings.theme,
      changeTheme,
      changeTopbarTheme,
      changeMenu: {
        theme: changeMenuTheme,
        size: changeMenuSize
      },
      themeCustomizer,
      activityStream,
      toggleBackdrop,
      resetSettings
    };
  }, [settings, setSettings, offcanvasStates, INIT_STATE, toggleBackdrop]);
  useEffect(() => {
    toggleDocumentAttribute('data-bs-theme', settings.theme);
    toggleDocumentAttribute('data-topbar-color', settings.topbarTheme);
    toggleDocumentAttribute('data-menu-color', settings.menu.theme);
    toggleDocumentAttribute('data-menu-size', settings.menu.size);
    return () => {
      toggleDocumentAttribute('data-bs-theme', settings.theme, true);
      toggleDocumentAttribute('data-topbar-color', settings.topbarTheme, true);
      toggleDocumentAttribute('data-menu-color', settings.menu.theme, true);
      toggleDocumentAttribute('data-menu-size', settings.menu.size, true);
    };
  }, [settings]);
  return <ThemeContext.Provider value={contextValue}>
      {children}
      {offcanvasStates.showBackdrop && <button type="button" className="offcanvas-backdrop fade show" style={{ border: 0, padding: 0 }} aria-label="Cerrar menú" onClick={toggleBackdrop} />}
    </ThemeContext.Provider>;
};
export { LayoutProvider, useLayoutContext };
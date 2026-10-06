import Choices from 'choices.js';
import { useEffect, useEffectEvent, useRef } from 'react';
const ChoicesFormInput = ({
  children,
  multiple,
  className,
  onChange,
  allowInput,
  options,
  ...props
}) => {
  const choicesRef = useRef(null);
  // Choices toma su configuración al montarse; un objeto inline no debe reiniciar la selección.
  const initialOptionsRef = useRef(options);
  const handleChange = useEffectEvent(e => {
    if (e.target instanceof HTMLSelectElement) onChange?.(e.target.value);
  });
  useEffect(() => {
    if (choicesRef.current) {
      const options = initialOptionsRef.current;
      const choices = new Choices(choicesRef.current, {
        placeholderValue: 'Seleccionar...',
        searchPlaceholderValue: 'Buscar...',
        loadingText: 'Cargando...',
        noResultsText: 'No se encontraron resultados',
        noChoicesText: 'No hay opciones disponibles',
        itemSelectText: 'Presiona para seleccionar',
        uniqueItemText: 'Solo se pueden añadir valores únicos',
        customAddItemText: 'Solo se pueden añadir valores que cumplan las condiciones indicadas',
        addItemText: () => 'Presiona Intro para añadir este valor',
        maxItemText: count => `Solo se pueden añadir ${count} valores`,
        ...options,
        // Choices 10 no ofrece una opción para traducir el botón de eliminación.
        callbackOnCreateTemplates: function (...args) {
          const templates = options?.callbackOnCreateTemplates?.apply(this, args) ?? {};
          const itemTemplate = templates.item ?? Choices.defaults.templates.item;
          return {
            ...templates,
            item: function (config, data) {
              const item = itemTemplate.call(this, config, data);
              const button = item.querySelector('[data-button]');
              if (button) {
                button.textContent = 'Eliminar elemento';
                button.setAttribute('aria-label', `Eliminar elemento: ${data.label ?? data.value}`);
              }
              return item;
            }
          };
        },
        placeholder: true,
        allowHTML: true,
        shouldSort: false
      });
      const element = choices.passedElement.element;
      element.addEventListener('change', handleChange);
      return () => {
        element.removeEventListener('change', handleChange);
        choices.destroy();
      };
    }
  }, []);
  return allowInput ? <input ref={choicesRef} multiple={multiple} className={className} {...props} /> : <select ref={choicesRef} multiple={multiple} className={className} {...props}>
      {children}
    </select>;
};
export default ChoicesFormInput;
export const selectSpanishMessages = {
  guidance: ({ context, isSearchable, isMulti, tabSelectsValue, isInitialFocus, 'aria-label': label }) => {
    if (context === 'menu') {
      return `Usa las flechas arriba y abajo para recorrer las opciones, Intro para seleccionar y Escape para cerrar.${tabSelectsValue ? ' Usa Tab para seleccionar y cerrar el menú.' : ''}`;
    }
    if (context === 'input' && isInitialFocus) {
      return `${label || 'Selector'} enfocado.${isSearchable ? ' Escribe para filtrar la lista.' : ''} Usa la flecha abajo para abrir el menú.${isMulti ? ' Usa la flecha izquierda para recorrer los valores seleccionados.' : ''}`;
    }
    if (context === 'value') {
      return 'Usa las flechas izquierda y derecha para recorrer los valores y Retroceso para eliminar el valor enfocado.';
    }
    return '';
  },
  onChange: ({ action, label = '', labels = [], isDisabled }) => {
    switch (action) {
      case 'deselect-option':
      case 'pop-value':
      case 'remove-value':
        return `Opción ${label} deseleccionada.`;
      case 'clear':
        return 'Se eliminaron todas las opciones seleccionadas.';
      case 'initial-input-focus':
        return `Opciones seleccionadas: ${labels.join(', ')}.`;
      case 'select-option':
        return isDisabled ? `La opción ${label} está deshabilitada. Selecciona otra opción.` : `Opción ${label} seleccionada.`;
      default:
        return '';
    }
  },
  onFocus: ({ context, focused, options, label = '', selectValue, isDisabled, isSelected, isAppleDevice }) => {
    const values = context === 'value' ? selectValue : options;
    const position = values?.length ? `${values.indexOf(focused) + 1} de ${values.length}` : '';
    if (context === 'value') return `Valor ${label} enfocado, ${position}.`;
    if (context === 'menu' && isAppleDevice) {
      return `${label}${isSelected ? ', seleccionado' : ''}${isDisabled ? ', deshabilitado' : ''}, ${position}.`;
    }
    return '';
  },
  onFilter: ({ inputValue, resultsMessage }) => `${resultsMessage}${inputValue ? ` para la búsqueda ${inputValue}` : ''}.`,
};

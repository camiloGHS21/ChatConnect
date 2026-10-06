import Flatpickr from 'react-flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import 'flatpickr/dist/themes/material_blue.css';
const spanishLocale = {
  ...Spanish,
  weekAbbreviation: 'Sem.',
  scrollTitle: 'Desplázate para incrementar',
  toggleTitle: 'Haz clic para alternar',
  yearAriaLabel: 'Año',
  monthAriaLabel: 'Mes',
  hourAriaLabel: 'Hora',
  minuteAriaLabel: 'Minuto',
};
const CustomFlatpickr = ({
  className,
  value,
  options,
  placeholder = 'Seleccionar fecha'
}) => {
  return <>
      <Flatpickr className={className} data-enable-time value={value} options={{ locale: spanishLocale, ...options }} placeholder={placeholder} />
    </>;
};
export default CustomFlatpickr;
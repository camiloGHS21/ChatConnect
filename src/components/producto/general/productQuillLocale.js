const controls = {
  bold: 'Negrita',
  italic: 'Cursiva',
  underline: 'Subrayado',
  strike: 'Tachado',
  blockquote: 'Cita',
  'code-block': 'Bloque de código',
  link: 'Insertar enlace',
  image: 'Insertar imagen',
  video: 'Insertar vídeo',
  formula: 'Insertar fórmula',
  clean: 'Quitar formato',
  header: 'Estilo de párrafo',
  font: 'Tipo de letra',
  size: 'Tamaño de letra',
  color: 'Color del texto',
  background: 'Color de fondo',
  align: 'Alineación',
  direction: 'Dirección del texto',
  script: 'Posición del texto',
  indent: 'Sangría',
  list: 'Lista',
};

const nameControl = (element, label) => {
  if (!element) return;
  element.setAttribute('aria-label', label);
  element.setAttribute('title', label);
};

const optionLabel = (format, value) => {
  switch (format) {
    case 'header': return value ? `Encabezado ${value}` : 'Texto normal';
    case 'font': return { serif: 'Con remates', monospace: 'Monoespaciada' }[value] || 'Sin remates';
    case 'size': return { small: 'Pequeño', large: 'Grande', huge: 'Muy grande' }[value] || 'Normal';
    case 'align': return { center: 'Centrar', right: 'Alinear a la derecha', justify: 'Justificar' }[value] || 'Alinear a la izquierda';
    case 'list': return { ordered: 'Lista numerada', bullet: 'Lista con viñetas', check: 'Lista de verificación' }[value] || 'Lista';
    case 'indent': return value === '+1' ? 'Aumentar sangría' : 'Reducir sangría';
    case 'script': return value === 'sub' ? 'Subíndice' : 'Superíndice';
    case 'direction': return 'Texto de derecha a izquierda';
    case 'color':
    case 'background': return `${controls[format]}: ${value || 'Predeterminado'}`;
    default: return controls[format];
  }
};

export const localizeProductQuill = (toolbar, tooltip) => {
  if (toolbar) {
    nameControl(toolbar, 'Herramientas de formato de la descripción');
    toolbar.querySelectorAll('button').forEach((button) => {
      const format = Object.keys(controls).find((key) => button.classList.contains(`ql-${key}`));
      if (format) nameControl(button, optionLabel(format, button.value));
    });
    toolbar.querySelectorAll('.ql-picker').forEach((picker) => {
      const format = Object.keys(controls).find((key) => picker.classList.contains(`ql-${key}`));
      if (!format) return;
      nameControl(picker.querySelector('.ql-picker-label'),
        `${controls[format]}: ${optionLabel(format, picker.querySelector('.ql-picker-label')?.dataset.value)}`);
      picker.querySelectorAll('.ql-picker-item').forEach((item) => {
        nameControl(item, optionLabel(format, item.dataset.value));
      });
      nameControl(picker.nextElementSibling?.matches('select') ? picker.nextElementSibling : null, controls[format]);
    });
  }
  if (tooltip) {
    const editing = tooltip.classList.contains('ql-editing');
    const mode = tooltip.dataset.mode || 'link';
    const input = tooltip.querySelector('input');
    if (input) {
      input.setAttribute('data-link', 'https://ejemplo.com');
      input.setAttribute('data-video', 'URL del vídeo');
      nameControl(input, { link: 'Dirección del enlace', video: 'URL del vídeo', formula: 'Fórmula' }[mode] || 'Dirección del enlace');
      input.setAttribute('placeholder', { link: 'https://ejemplo.com', video: 'URL del vídeo', formula: 'e=mc^2' }[mode] || 'https://ejemplo.com');
    }
    const action = tooltip.querySelector('.ql-action');
    const remove = tooltip.querySelector('.ql-remove');
    nameControl(action, editing ? 'Guardar' : 'Editar enlace');
    nameControl(remove, 'Eliminar enlace');
    nameControl(tooltip.querySelector('.ql-preview'), 'Abrir enlace en una pestaña nueva');
    [action, remove].filter(Boolean).forEach((element) => {
      element.setAttribute('role', 'button');
      element.setAttribute('tabindex', '0');
    });
  }
};

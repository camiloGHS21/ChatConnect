import { FormLabel } from 'react-bootstrap';
import Feedback from 'react-bootstrap/esm/Feedback';
import { Controller } from 'react-hook-form';
import ReactSelect, { components } from 'react-select';
import { selectSpanishMessages } from './selectSpanishMessages';
const SpanishMultiValueRemove = props => <components.MultiValueRemove {...props} innerProps={{
  ...props.innerProps,
  'aria-label': `Eliminar ${props.selectProps.getOptionLabel(props.data) || 'opción'}`
}} />;
const spanishComponents = { MultiValueRemove: SpanishMultiValueRemove };
// Conserva la equivalencia de IDs numéricos y de texto sin coerción implícita.
const matchesOptionValue = (optionValue, fieldValue) => {
  if (optionValue === fieldValue) return true;
  if (optionValue === null || optionValue === undefined) {
    return fieldValue === null || fieldValue === undefined;
  }
  if (fieldValue === null || fieldValue === undefined) return false;
  const optionType = typeof optionValue;
  const fieldType = typeof fieldValue;
  if (optionType === fieldType) return false;
  const scalarTypes = ['string', 'number', 'boolean'];
  return scalarTypes.includes(optionType) && scalarTypes.includes(fieldType)
    && Number(optionValue) === Number(fieldValue);
};
const SelectFormInput = ({
  control,
  id,
  name,
  label,
  containerClassName,
  labelClassName,
  noValidate,
  options,
  ...other
}) => {
  return <Controller control={control} name={name} render={({
    field,
    fieldState
  }) => <div className={containerClassName}>
          {label && (typeof label === 'string' ? <FormLabel htmlFor={id ?? name} className={labelClassName}>
                {label}
              </FormLabel> : <>{label}</>)}
          {/* @ts-ignore */}
          <ReactSelect
            placeholder="Seleccionar..."
            noOptionsMessage={() => 'No hay opciones disponibles'}
            loadingMessage={() => 'Cargando...'}
            screenReaderStatus={({ count }) => `${count} ${count === 1 ? 'resultado disponible' : 'resultados disponibles'}`}
            aria-label={typeof label === 'string' ? label : 'Seleccionar opción'}
            {...other}
            ariaLiveMessages={{ ...selectSpanishMessages, ...other.ariaLiveMessages }}
            components={{ ...spanishComponents, ...other.components }}
            {...field}
            options={options}
            onChange={e => field.onChange(e.value)}
            value={Array.isArray(options) && options?.find(op => 'value' in op && matchesOptionValue(op.value, field.value))}
            classNamePrefix="react-select"
            id={id ?? name}
          />
          {!noValidate && fieldState.error?.message && <Feedback type="invalid">{fieldState.error?.message}</Feedback>}
        </div>} />;
};
export default SelectFormInput;
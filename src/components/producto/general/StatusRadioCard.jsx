
import { Form } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Radio card interactiva con estilo Reback
 */
const StatusRadioCard = ({
  id,
  name,
  checked,
  onClick,
  icon,
  activeTheme = 'success',
  title,
  subtitle,
}) => {
  const activeClass = checked
    ? `border-${activeTheme} bg-${activeTheme}-subtle shadow-xs`
    : 'border-light-subtle bg-body text-muted';

  const textClass = checked ? `text-${activeTheme}` : 'text-body';
  const iconClass = checked ? `text-${activeTheme}` : 'text-muted';

  return (
    <label
      htmlFor={id}
      className={`p-2 px-3 border rounded-2 d-flex align-items-center gap-2 flex-fill status-radio-card ${activeClass}`}
    >
      <Form.Check.Input
        type="radio"
        id={id}
        name={name}
        checked={checked}
        aria-label={`${title}: ${subtitle}`}
        onChange={onClick}
        className="m-0"
      />
      <IconifyIcon icon={icon} className={`fs-20 ${iconClass}`} />
      <span>
        <span className={`d-block fs-13 fw-semibold ${textClass}`}>{title}</span>
        <span className="d-block fs-11 text-muted">{subtitle}</span>
      </span>
    </label>
  );
};

export default StatusRadioCard;

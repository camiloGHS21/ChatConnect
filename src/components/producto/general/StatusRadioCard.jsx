import React from 'react';
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
    : 'border-light-subtle bg-white text-muted';

  const textClass = checked ? `text-${activeTheme}` : 'text-dark';
  const iconClass = checked ? `text-${activeTheme}` : 'text-muted';

  return (
    <div
      className={`p-2 px-3 border rounded-2 d-flex align-items-center gap-2 flex-fill status-radio-card ${activeClass}`}
      onClick={onClick}
    >
      <Form.Check
        type="radio"
        id={id}
        name={name}
        checked={checked}
        onChange={() => {}}
        className="m-0"
      />
      <IconifyIcon icon={icon} className={`fs-20 ${iconClass}`} />
      <div>
        <div className={`fs-13 fw-semibold ${textClass}`}>{title}</div>
        <div className="fs-11 text-muted">{subtitle}</div>
      </div>
    </div>
  );
};

export default StatusRadioCard;

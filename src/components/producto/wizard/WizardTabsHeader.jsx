import { Tab, Tabs } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Encabezado de pestañas para el asistente de creación de productos.
 * Mantiene la navegación por pasos con iconos y títulos descriptivos.
 */
const WizardTabsHeader = ({ activeStep, setActiveStep, formSteps }) => {
  return (
    <Tabs
      variant="underline"
      activeKey={activeStep}
      className="nav nav-tabs card-tabs"
      onSelect={e => setActiveStep(Number(e))}
    >
      {formSteps.map(step => (
        <Tab
          key={step.index}
          eventKey={step.index}
          className="nav-item"
          tabClassName={activeStep === step.index ? 'pb-3 text-primary' : 'pb-3 text-body'}
          title={
            <span className="fw-semibold">
              <IconifyIcon icon={step.icon} className="me-1 fs-16" />
              <span className="d-none d-md-inline">{step.name}</span>
            </span>
          }
        >
          <div className="pt-3">{step.tab}</div>
        </Tab>
      ))}
    </Tabs>
  );
};

export default WizardTabsHeader;

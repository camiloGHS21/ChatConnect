import clsx from 'clsx';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

/**
 * Barra de navegación inferior del asistente paso a paso.
 * Permite retroceder, avanzar o finalizar la creación del producto.
 */
const WizardNavigation = ({
  activeStep,
  setActiveStep,
  totalSteps,
  stepName,
  onPrev,
  onNext,
  onSave,
  isSaving,
  saveButtonText,
}) => {
  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    } else if (setActiveStep) {
      setActiveStep(prev => Math.max(1, prev - 1));
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (setActiveStep) {
      setActiveStep(prev => Math.min(totalSteps, prev + 1));
    }
  };

  return (
    <div className="d-flex flex-wrap gap-2 wizard justify-content-between align-items-center mt-4 pt-3 border-top">
      <div className="previous">
        <button
          type="button"
          onClick={handlePrev}
          disabled={activeStep === 1 || isSaving}
          className={clsx('btn btn-primary d-inline-flex align-items-center', {
            disabled: activeStep === 1 || isSaving
          })}
        >
          <IconifyIcon icon="bx:left-arrow-alt" className="me-1 fs-18" />
          Anterior
        </button>
      </div>

      <div className="text-muted fs-13 d-none d-sm-block">
        Paso <strong>{activeStep}</strong> de <strong>{totalSteps}</strong>:{' '}
        <span className="text-body-emphasis fw-semibold">{stepName}</span>
      </div>

      <div className="next">
        {activeStep < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={isSaving}
            className="btn btn-primary d-inline-flex align-items-center"
          >
            Siguiente Paso
            <IconifyIcon icon="bx:right-arrow-alt" className="ms-1 fs-18" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="btn btn-success d-inline-flex align-items-center gap-2 fw-bold"
          >
            <IconifyIcon icon={isSaving ? 'bx:loader-alt' : 'bx:check-double'} className={clsx('fs-18', { 'bx-spin': isSaving })} />
            {isSaving ? 'Guardando...' : (saveButtonText || 'Guardar y Crear Producto')}
          </button>
        )}
      </div>
    </div>
  );
};

export default WizardNavigation;

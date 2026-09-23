import React from 'react';
import { Row, Card, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import GeneralCodeNameInputs from './GeneralCodeNameInputs';
import GeneralTaxonomyInputs from './GeneralTaxonomyInputs';

/**
 * Card 1: Información Principal y Catálogo
 * Idéntico al diseño del template Reback con auto-generación y selectores taxonómicos.
 */
const GeneralInfoCard = ({
  formData,
  updateField,
  categories = [],
  brands = [],
  onGenerateCode,
  onOpenCreateCategory,
  onOpenCreateSubcategory,
  onOpenCreateBrand,
}) => {
  return (
    <Card className="border shadow-none mb-3 bg-light-subtle rounded-3">
      <Card.Header className="bg-transparent border-bottom py-2 d-flex align-items-center justify-content-between">
        <h6 className="mb-0 fw-bold text-dark d-flex align-items-center fs-14">
          <IconifyIcon icon="bx:info-circle" className="me-2 text-primary fs-18" />
          Información Principal y Catálogo
        </h6>
        <Badge bg="primary-subtle" className="text-primary border border-primary border-opacity-25 fs-11">
          Datos Básicos
        </Badge>
      </Card.Header>
      <Card.Body className="p-3">
        <Row className="g-3">
          <GeneralCodeNameInputs
            formData={formData}
            updateField={updateField}
            onGenerateCode={onGenerateCode}
          />
          <GeneralTaxonomyInputs
            formData={formData}
            updateField={updateField}
            categories={categories}
            brands={brands}
            onOpenCreateCategory={onOpenCreateCategory}
            onOpenCreateSubcategory={onOpenCreateSubcategory}
            onOpenCreateBrand={onOpenCreateBrand}
          />
        </Row>
      </Card.Body>
    </Card>
  );
};

export default GeneralInfoCard;

import { useSearchParams } from 'react-router-dom';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import CreateProductForms from './components/CreateProductForms';
import PageMetaData from '@/components/PageTitle';

const CreateProduct = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const title = productId ? 'Editar Producto' : 'Crear Producto';

  return (
    <>
      <PageBreadcrumb title={title} subName="Catálogo" />
      <PageMetaData title={`${title} - ChatConnect`} />

      <Row>
        <Col>
          <Card>
            <CardBody>
              <CreateProductForms productId={productId} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CreateProduct;
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LogoBox from '@/components/LogoBox';
import PageMetaData from '@/components/PageTitle';
import ThirdPartyAuth from '@/components/ThirdPartyAuth';
import LoginForm from './LoginForm';
import signInImg from '@/assets/images/sign-in.svg';

const SignIn = () => {
  return (
    <>
      <PageMetaData title="Iniciar sesión" />

      <Card className="auth-card">
        <CardBody className="p-0">
          <Row className="align-items-center g-0">
            <Col lg={6} className="d-none d-lg-inline-block border-end">
              <div
                className="auth-page-sidebar p-4 p-xl-5"
                style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
              >
                <img
                  src={signInImg}
                  width={520}
                  height={520}
                  alt="CRM omnicanal ChatConnect"
                  className="img-fluid"
                  style={{ maxHeight: 460, objectFit: 'contain' }}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="p-4">
                <div className="mx-auto mb-4 text-center auth-logo">
                  <LogoBox
                    textLogo={{
                      height: 26,
                      width: 108,
                    }}
                    squareLogo={{
                      className: 'me-2',
                      height: 32,
                      width: 32,
                    }}
                  />
                </div>
                <h2 className="fw-bold text-center fs-18">Iniciar Sesión</h2>
                <p className="text-muted text-center mt-1 mb-4">
                  Ingresa tu correo electrónico y contraseña para acceder al panel de administración.
                </p>
                <Row className="justify-content-center">
                  <Col xs={12} md={8}>
                    <LoginForm />

                    <ThirdPartyAuth />
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
      <p className="text-white mb-0 text-center mt-3">
        ¿No tienes una cuenta?
        <Link to="/auth/sign-up" className="text-white fw-bold ms-1">
          Registrarse
        </Link>
      </p>
    </>
  );
};

export default SignIn;
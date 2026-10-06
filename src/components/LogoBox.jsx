import { Link } from 'react-router-dom';
import logoDark from '@/assets/images/logo-dark.svg';
import logoLight from '@/assets/images/logo-light.svg';
import logoSm from '@/assets/images/logo-sm.svg';

const LogoBox = ({
  containerClassName,
  squareLogo,
  textLogo
}) => {
  return (
    <div className={containerClassName ?? ''}>
      <Link to="/" className="logo-dark">
        <span className="d-inline-flex align-items-center justify-content-center">
          <img
            src={logoSm}
            className={squareLogo?.className}
            height={squareLogo?.height ?? 30}
            width={squareLogo?.width ?? 30}
            alt="Logotipo de ChatConnect"
          />
          <img
            src={logoDark}
            className={textLogo?.className}
            height={textLogo?.height ?? 24}
            width={textLogo?.width ?? 105}
            alt="ChatConnect"
          />
        </span>
      </Link>
      <Link to="/" className="logo-light">
        <span className="d-inline-flex align-items-center justify-content-center">
          <img
            src={logoSm}
            className={squareLogo?.className}
            height={squareLogo?.height ?? 30}
            width={squareLogo?.width ?? 30}
            alt="Logotipo de ChatConnect"
          />
          <img
            src={logoLight}
            className={textLogo?.className}
            height={textLogo?.height ?? 24}
            width={textLogo?.width ?? 105}
            alt="ChatConnect"
          />
        </span>
      </Link>
    </div>
  );
};

export default LogoBox;
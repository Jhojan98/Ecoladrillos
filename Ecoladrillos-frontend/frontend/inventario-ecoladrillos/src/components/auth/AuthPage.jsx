// import { Children } from "react";

// images
import bg from "@images/background.png";
// icons
import eye from "@icons/eye.svg";
import eyeSlash from "@icons/eye-slash.svg";
// styles
import "./authPage.scss";

export function AuthPage(props) {
  const { AuthElement } = props;

  // Props que pasamos a los componentes de auth
  const authProps = {
    eyeIcon: eye,
    eyeSlashIcon: eyeSlash,
  };

  return (
    <>
      <div className="w-100 absolute min-height-page">
        <img className="bg-img w-100 absolute" src={bg} alt="imagen de fondo" />
      </div>

      <div className="auth-page flex justify-center align-center relative">
        <AuthElement {...authProps} />
      </div>
    </>
  );
}

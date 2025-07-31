import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
// contexts
import { useAuth } from "@contexts/AuthContext";
// hooks
import { useNotifier } from "@hooks/useNotifier";
// queries
import { useLoginMutation } from "@db/queries/Users";
// icons

export function Login(props) {
  const { eyeIcon, eyeSlashIcon } = props;

  const navigate = useNavigate();
  const notify = useNotifier();

  const { isAuthenticated, checkAuthStatus } = useAuth();

  // si ya esta logueado, redirigir a home
  if (isAuthenticated) {
    navigate("/home");
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const loginMutate = useLoginMutation();

  // verificar el usuario
  const onSubmit = async (data) => {
    const result = await loginMutate.post(data);

    // Manejo de errores del backend
    if (result.errorJsonMsg === "db data access failure") {
      setError("email", {
        type: "manual",
        message: "Correo no registrado",
      });
      return;
    } else if (result.errorJsonMsg === "UnAuthorization") {
      setError("password", {
        type: "manual",
        message: "Contraseña incorrecta",
      });
      return;
    } else if (result.errorJsonMsg || result.errorMutationMsg) {
      notify.info(
        "Si no puedes ingresar, intenta con tu correo de microsoft institucional"
      );
    }
    if (result?.url) {
      navigate("/home");
      checkAuthStatus();
    }
  };

  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  // Validación de los campos del formulario
  const validationRules = {
    email: {
      required: "Ingresa tu correo",
      pattern: {
        value: /\S+@\S+\.\S+/,
        message: "Ingresa un correo válido",
      },
    },
    password: {
      required: "Ingresa tu contraseña",
      minLength: {
        value: 8,
        message: "Mínimo 8 caracteres",
      },
    },
  };

  const handleLoggin = () => {
    window.location.href = "http://localhost:8080/v1/auth/microsoftonline";
  };

  return (
    <form
      className="auth-form flex justify-center align-center flex-column box-shadow"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <h2 className="title-auth">Inicia sesion</h2>
      <label className="form__field">
        <span>Correo</span>
        <input
          className="inp"
          type="email"
          autoComplete="email"
          placeholder="user@domain.com"
          {...register("email", validationRules.email)}
        />
        {errors.email && (
          <p className="error-inp-message">{errors.email.message}</p>
        )}
      </label>

      {/* Input de contraseña con icono */}
      <label className="form__field password-input-container relative">
        <span>Contraseña</span>
        <input
          className="inp"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="•••••••••"
          {...register("password", validationRules.password)}
        />
        <button
          type="button"
          className="password-eye-btn absolute btn-clean"
          onClick={() => setShowPassword(!showPassword)}
        >
          <img
            src={showPassword ? eyeSlashIcon : eyeIcon}
            alt={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          />
        </button>
        {errors.password && (
          <p className="error-inp-message">{errors.password.message}</p>
        )}
      </label>

      {/* <a className="link forgot-pass-txt" href="#">
        Recuperar contraseña
      </a> */}
      <button type="submit" className="btn-primary btn-login circular-radius">
        Ingresar
      </button>
    </form>
  );
}

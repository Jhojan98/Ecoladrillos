import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
// contexts
import { useAuth } from "@contexts/AuthContext";
// hooks
import { useNotifier } from "@hooks/useNotifier";
// queries
import { useSimulateLogin } from "@db/queries/Users";
// icons

export function Login(props) {
  const { eyeIcon, eyeSlashIcon } = props;

  const navigate = useNavigate();
  const notify = useNotifier();

  const { isAuthenticated, checkAuthStatus } = useAuth();

  // si ya esta logueado, redirigir a home
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const { fetchData: getUsers } = useSimulateLogin();
  // verificar el usuario
  const onSubmit = async (data) => {
    const users = await getUsers();
    if (users.length === 0) {
      notify.error("No se encontraron usuarios");
      return;
    }

    users.forEach((user) => {
      if (user.email === data.email && user.contraseña === data.password) {
        localStorage.setItem("user-id", user.id_usuario);
        localStorage.setItem("user-name", user.nombre);
        localStorage.setItem("user-email", user.email);
        localStorage.setItem("user-role", user.cargo ? "operario" : "admin");
        notify.success("Bienvenido, " + user.nombre);
        navigate("/home");
        checkAuthStatus();
        return;
      }
    });

    const existEmail = users.some((user) => user.email === data.email);
    if (!existEmail) {
      setError("email", {
        type: "manual",
        message: "Correo no registrado",
      });
    } else if (localStorage.getItem("user-role") === null) {
      setError("password", {
        type: "manual",
        message: "Contraseña incorrecta",
      });
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
        value: 4,
        message: "Mínimo 4 caracteres",
      },
    },
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
        <div className="flex align-center">
          <input
            className="inp"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Contraseña"
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
        </div>
        {errors.password && (
          <p className="error-inp-message">{errors.password.message}</p>
        )}
      </label>

      <button type="submit" className="btn-primary btn-login circular-radius">
        Ingresar
      </button>
    </form>
  );
}

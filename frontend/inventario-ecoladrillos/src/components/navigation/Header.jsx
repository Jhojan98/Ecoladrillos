import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// contexts
import { useAuth } from "@contexts/AuthContext";
// hooks
import { useClickOutside } from "@hooks/useClickOutside";
import { useHeaderBars } from "@contexts/HeaderBarsContext";
// icons
import maleUserImage from "@icons/maleuser.png";
import barsIcon from "@icons/bars.svg";
import userIcon from "@icons/user.svg";
import logoutIcon from "@icons/logout.svg";
import HomeIcon from "@icons/home.svg?react";
// styles
import "./header.scss";

export function Header(props) {
  const { userName, userAvatar, isAuthenticated } = props;

  const location = useLocation(); // obtiene la ubicación actual

  // ------ BARRAS DE NAVEGACION ------
  const { registerRef, handleBarsClicked } = useHeaderBars();

  const barsRef = useRef(null); // referencia para las barras de navegación

  // registrar la referencia de las barras de navegación
  useEffect(() => {
    if (barsRef.current) {
      registerRef(barsRef);
    }
  }, [barsRef.current]);

  const [showBars, setShowBars] = useState(false); // saber si se muestran las barras

  // mostrar u ocultar las barras de navegación dependiendo de la ubicación
  useEffect(() => {
    const locations = [
      "/login",
      "/signin",
      "/verification",
      "/user_profile",
      "/create_data",
    ];
    if (locations.includes(location.pathname) || location.pathname === "/") {
      setShowBars(false);
    } else {
      setShowBars(true);
    }
  }, [location]);

  // ------ OPCIONES DEL USUARIO ------
  const [showUserOptions, setShowUserOptions] = useState(false); // saber si se muestran las opciones del usuario

  const headerUser = useRef(null); // referencia para el usuario del header
  const userOptionsRef = useRef(null); // referencia para el div de opciones del usuario

  useClickOutside([headerUser, userOptionsRef], () => {
    setShowUserOptions(false);
  });

  return (
    <header className="header flex justify-between">
      <div className="pagename-div flex">
        {showBars && (
          // Se va a mosrar en html pero no importa
          <button
            className="btn-bars btn-primary"
            ref={barsRef}
            onClick={() => handleBarsClicked()}
          >
            <img className="header-bars" src={barsIcon} alt="bars icon" />
          </button>
        )}

        <Link
          className="link flex align-center"
          to={isAuthenticated ? "/home" : "/"}
        >
          InvetoryEco
        </Link>
      </div>

      <nav className="header-nav flex align-center">
        <Link className="link--home link flex align-center" to="/dashboard">
          {/* <HomeIcon className="home-icon" alt="home icon" /> */}
          <span>Dashboard</span>
        </Link>
        <Link className="link" to="/inventory">
          Inventario
        </Link>

        {/* usuario header */}
        {!isAuthenticated ? (
          <Link className="header-user link flex align-center" to="/login">
            <span>Iniciar Sesion</span>
            <img className="user-img" src={maleUserImage} alt="maleuser" />
          </Link>
        ) : (
          <>
            <button
              className="header-user flex align-center"
              ref={headerUser}
              onClick={() => setShowUserOptions(!showUserOptions)}
            >
              <span className="link text-ellipsis">{userName}</span>
              <img
                className="user-img"
                src={userAvatar || maleUserImage}
                alt="maleuser"
              />
            </button>
            {showUserOptions && (
              <UserOptions
                userOptionsRef={userOptionsRef}
                setShowUserOptions={setShowUserOptions}
                userName={userName}
              />
            )}
          </>
        )}
      </nav>
    </header>
  );
}

function UserOptions(props) {
  const { userOptionsRef, userName } = props; // referencia para el div de opciones del usuario
  const { logout } = useAuth();
  const navigate = useNavigate();

  // función para cerrar sesión usando el sistema de cookies
  const handleLogout = async () => {
    await logout();
    navigate("/home");
  };

  return (
    <div
      className="user-options absolute flex flex-column"
      ref={userOptionsRef}
    >
      <span className="user-options__username text-ellipsis">{userName}</span>
      <hr />
      <Link
        className="user-options__item flex align-center"
        to="/user_profile"
        // title="Proximamente..."
        // onClick={() => notify.info("Proximamente...")}
      >
        <img className="user-options__icon" src={userIcon} alt="user icon" />
        Perfil
      </Link>
      <button
        className="user-options__item btn-clean flex align-center"
        onClick={handleLogout}
      >
        <img
          className="user-options__icon"
          src={logoutIcon}
          alt="logout icon"
        />
        Cerrar Sesión
      </button>
    </div>
  );
}

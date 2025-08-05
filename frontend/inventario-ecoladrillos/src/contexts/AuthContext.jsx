import { createContext, useState, useEffect, useContext } from "react";
// hooks
import { useNotifier } from "@hooks/useNotifier";
// queries
import { getUser, logoutUser } from "@db/queries/Users";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const defaultUser = {
    id: null,
    userName: "Iniciar Sesion",
    userEmail: "",
    userRole: "guest",
  }; // datos por defecto del usuario

  const [userData, setUserData] = useState(defaultUser); // estado para guardar los datos del usuario
  const [isAuthenticated, setIsAuthenticated] = useState(false); // estado para saber si el token es valido
  const [authIsLoading, setAuthIsLoading] = useState(true); // Flag para mostrar el loading
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Flag para evitar reauth durante logout

  const notify = useNotifier();

  // Intentar obtener el usuario al cargar la página (verificar si hay cookie válida)
  useEffect(() => {
    // No verificar auth si estamos en proceso de logout
    if (isLoggingOut) return;
    checkAuthStatus();
  }, [isLoggingOut]);

  // Verificar el estado de autenticació
  const checkAuthStatus = () => {
    setAuthIsLoading(true);
    const data = getUser();

    if (data.id) {
      setUserData({
        id: data.id,
        userName: data.name,
        userEmail: data.email,
        userRole: data.role,
      });
      setIsAuthenticated(true);
    } else {
      logout(true);
    }
    setAuthIsLoading(false);
  };

  const logout = (silent = false) => {
    setIsLoggingOut(true);
    
    logoutUser();
    setUserData(defaultUser);
    setIsAuthenticated(false);
    if (!silent) {
      notify.success("Sesión cerrada.");
    }
    setIsLoggingOut(false);
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        authIsLoading,
        checkAuthStatus,
        isAuthenticated,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

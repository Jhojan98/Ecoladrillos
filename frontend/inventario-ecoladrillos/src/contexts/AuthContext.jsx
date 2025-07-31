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
    userAvatar: "",
    universities: [],
    actualUniversity: import.meta.env.VITE_UNIVERSITY_ID,
  }; // datos por defecto del usuario
  
  const [userData, setUserData] = useState(defaultUser); // estado para guardar los datos del usuario
  const [isAuthenticated, setIsAuthenticated] = useState(false); // estado para saber si el token es valido
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Flag para evitar reauth durante logout

  const notify = useNotifier();

  // Intentar obtener el usuario al cargar la página (verificar si hay cookie válida)
  useEffect(() => {
    // No verificar auth si estamos en proceso de logout
    if (isLoggingOut) return;
    checkAuthStatus();
  }, [isLoggingOut]);

  // Verificar el estado de autenticació
  const checkAuthStatus = async () => {
    try {
      const data = await getUser();

      if (data) {
        setUserData({
          id: data.id,
          userName: data.username,
          userAvatar: data.avatar.url,
          userEmail: data.institutional_email,
          universities: data.universities || [],
          actualUniversity: data.universities?.[0],
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      setUserData(defaultUser);
      setIsAuthenticated(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();

      setUserData(defaultUser);
      setIsAuthenticated(false);
      notify.success("Sesión cerrada.");
    } catch (error) {
      notify.error(error.message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
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

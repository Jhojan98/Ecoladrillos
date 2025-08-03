import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@contexts/AuthContext";

export const useFetch = (
  baseUrl = "",
  errorMessage = "Hubo un error",
  verifyAuth = true,
  options = {}
) => {
  // Estados que se muestran al usuario
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isAuthenticated, authIsLoading } = useAuth();

  // useRef para mantener el valor actual de authIsLoading
  const authIsLoadingRef = useRef(authIsLoading);
  const isAuthenticatedRef = useRef(isAuthenticated);

  // Actualizar las referencias cuando cambien los valores
  useEffect(() => {
    authIsLoadingRef.current = authIsLoading;
    isAuthenticatedRef.current = isAuthenticated;
  }, [authIsLoading, isAuthenticated]);

  // No hace fetch hasta que se llame a fetchData directamente
  const fetchData = useCallback(
    async (newUrl = "") => {
      if (verifyAuth) {
        // Espera a que la autenticación se complete antes de hacer la petición
        await new Promise((resolve) => {
          const checkAuthStatus = () => {
            if (!authIsLoadingRef.current) resolve();
            // Esperar 50ms y volver a verificar
            else setTimeout(checkAuthStatus, 50);
          };
          checkAuthStatus();
        });

        if (!isAuthenticatedRef.current) {
          throw new Error("Usuario no autenticado");
        }
      }

      setLoading(true);
      setError(null);

      const finalUrl = `/api/v1${newUrl || baseUrl}`;
      try {
        const response = await fetch(finalUrl, {
          method: "GET",
          // credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          ...options,
        });

        let result = {};
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        }

        if (!response.ok) {
          throw new Error(
            result.error ||
              result.errors ||
              result.message ||
              `HTTP error ${response.status}`
          );
        }
        return result;
      } catch (err) {
        setError(errorMessage); // usuario
        console.error(`${errorMessage}: ${err.message}`); // desarrollador
        return { fetchErrorMsg: errorMessage, errorJsonMsg: err.message }; // para el codigo
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, verifyAuth, isAuthenticated, authIsLoading]
  );

  return { fetchData, loading, error };
};

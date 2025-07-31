import { useState, useCallback } from "react";
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

  const { isAuthenticated } = useAuth();

  // No hace fetch hasta que se llame a fetchData directamente
  const fetchData = useCallback(
    async (newUrl = "") => {
      if (verifyAuth && !isAuthenticated) {
        throw new Error("Usuario no autenticado");
      }

      setLoading(true);
      setError(null);

      const finalUrl = `/api${newUrl || baseUrl}`;
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
        setError("Ha ocurrido un error"); // usuario
        console.error(`${errorMessage}: ${err.message}`); // desarrollador
        return { fetchError: errorMessage, errorJsonMsg: err.message }; // para el codigo
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, verifyAuth, isAuthenticated]
  );

  return { fetchData, loading, error };
};

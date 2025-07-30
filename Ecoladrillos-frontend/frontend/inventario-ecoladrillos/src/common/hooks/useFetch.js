import { useState, useCallback } from "react";
import { useAuth } from "@contexts/AuthContext";

const apiBase = import.meta.env.VITE_API_URL;

// -- en caso de agregar options, se usa useMemo
// const options = useMemo(() => ({
//   headers: { 'X-Custom': 'abc' }
// }), []);
export const useFetch = (
  baseUrl = "",
  errorMessage,
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
      if (verifyAuth && !isAuthenticated) return;

      setLoading(true);
      setError(null);

      const finalUrl = `/api${newUrl || baseUrl}`;
      // const finalUrl = `${apiBase}${newUrl || baseUrl}`;
      try {
        const response = await fetch(finalUrl, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          ...options,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `HTTP error ${response.status}`);
        }
        return result;
      } catch (err) {
        const fullError = `${errorMessage}: ${
          err.message || "Error en el fetch"
        }`;
        console.error(fullError); // desarrollador

        setError("Ha ocurrido un error"); // usuario
        return { fetchError: true }; // oara el codigo
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, verifyAuth, isAuthenticated]
  );

  return { fetchData, loading, error };
};

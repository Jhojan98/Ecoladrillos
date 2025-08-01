import { useState } from "react";
import { useAuth } from "@contexts/AuthContext";

const apiBase = import.meta.env.VITE_API_URL;

// const buildUrl = (url, params = {}) => {
//   const query = new URLSearchParams(params).toString();
//   return query ? `${url}?${query}` : url;
// };

export const useMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();

  const mutate = async (
    method,
    endpoint,
    body = null,
    errorMessage = "Hubo un error",
    verifyAuth = true,
    options = {}
  ) => {
    if (verifyAuth && !isAuthenticated) {
      throw new Error("Usuario no autenticado");
    }

    setLoading(true);
    setError(null);

    try {
      const isFormData = body instanceof FormData;

      // const response = await fetch(`${apiBase}${endpoint}`, {
      const response = await fetch(`/api/v1${endpoint}`, {
        method,
        credentials: "include", // Importante: incluir cookies en la petición
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...options.headers,
        },
        body: body ? (isFormData ? body : JSON.stringify(body)) : null,
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
      return {
        errorMutationMsg: errorMessage, // para el codigo
        errorJsonMsg: err.message, // especifico del backend
      };
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};

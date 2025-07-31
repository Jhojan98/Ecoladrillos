import { useState } from "react";
import { useAuth } from "@contexts/AuthContext";

const apiBase = import.meta.env.VITE_API_URL;

const buildUrl = (url, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return query ? `${url}?${query}` : url;
};

export const useMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();

  const mutate = async (
    method,
    endpoint,
    body = null,
    errorMessage,
    options = {}
  ) => {
    if (!isAuthenticated && endpoint != "/login") return;

    setLoading(true);
    setError(null);

    try {
      const isFormData = body instanceof FormData;

      // const response = await fetch(`${apiBase}${endpoint}`, {
      const response = await fetch(`/api${endpoint}`, {
        method,
        credentials: "include", // Importante: incluir cookies en la petición
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...options.headers,
        },
        body: body ? (isFormData ? body : JSON.stringify(body)) : null,
      });

      let result = {};
      try {
        if (response?.url && endpoint === "/login") return response; // Si es un redirect, devolver la responde con la URL
        result = await response.json();
      } catch (jsonError) {
        // JSON vacio
        throw new Error(
          `(Sin JSON) No se pudo parsear la respuesta: ${jsonError.message}`
        );
      }

      if (!response.ok) {
        throw new Error(result.error || result.errors);
      }
      return result;
    } catch (err) {
      setError("Ha ocurrido un error"); // usuario
      console.error(`${errorMessage}: ${err.message}`); // desarrollador
      return {
        errorMutationMsg: errorMessage || "Hubo un error", // para el codigo
        errorJsonMsg: err.message, // especifico del backend
      };
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};

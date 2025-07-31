import { useMutation } from "@hooks/useMutation";
import { useFetch } from "@hooks/useFetch";

// -- get profile --
// fetchs exclusivos para el AuthProvider
// obtener datos del usuario
export const getUser = async () => {
  const response = await fetch("/api/me", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Error al obtener el usuario");
  }
  return await response.json();
};

// cerrar sesión
export const logoutUser = async () => {
  const response = await fetch("/api/logoutM", {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Error al cerrar sesión");
  }
  return await response.json();
};

// update user data
export const updateUser = async (userData) => {
  const put = useMutation();
  
  return put.mutate(
    "PATCH",
    "/complete-profile",
    userData,
    "Error al actualizar el usuario"
  );
};

// -- NORMAL LOGIN --
export const useLoginMutation = () => {
  const post = useMutation();

  return {
    post: (user) =>
      post.mutate("POST", "/login", user, "Error al iniciar sesión"),
    postLoading: post.loading,
    postError: post.error,
  };
};

// -- SIGN UP --
export const useSignupMutation = () => {
  const post = useMutation();

  return {
    post: (user) =>
      post.mutate("POST", "/signup", user, "Error al crear el usuario"),
    postLoading: post.loading,
    postError: post.error,
  };
};

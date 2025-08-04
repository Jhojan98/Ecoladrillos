import { useMutation } from "@hooks/useMutation";
import { useFetch } from "@hooks/useFetch";

// -- GET profile --
export const getUser = async () => {
  // const response = await fetch("/api/me", {
  //   method: "GET",
  //   credentials: "include",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // });
  // if (!response.ok) {
  //   throw new Error("Error al obtener el usuario");
  // }
  // return await response.json();
  return {
    id: 1,
    nombre: "Juan Pérez",
    email: "juan.perez@gmail.com",
  };
};

// -- LOGIN --
export const useLoginMutation = () => {
  const post = useMutation();

  return {
    post: (user) =>
      post.mutate("POST", "/login", user, "Error al iniciar sesión"),
    postLoading: post.loading,
    postError: post.error,
  };
};

// -- LOGOUT --
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

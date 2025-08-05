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
  // return {
  //   id: 1,
  //   nombre: "Juan Pérez",
  //   email: "juan.perez@gmail.com",
  // };
};

// -- LOGIN --
export const useSimulateLogin = () => {
  const { fetchData: getAdministradores } = useFetch(
    "/administradores",
    "Error al obtener los administradores",
    false
  );
  const { fetchData: getOperarios } = useFetch(
    "/operarios",
    "Error al obtener los operarios",
    false
  );

  const getUsers = async () => [
    ...((await getAdministradores())?.results || []),
    ...((await getOperarios())?.results || []),
  ];

  return {
    fetchData: getUsers,
    loading: false,
    error: null,
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

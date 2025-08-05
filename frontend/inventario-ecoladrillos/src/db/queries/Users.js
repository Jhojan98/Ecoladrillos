import { useFetch } from "@hooks/useFetch";

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

// -- GET profile --
export const getUser = () => {
  return {
    id: localStorage.getItem("user-id"),
    name: localStorage.getItem("user-name"),
    email: localStorage.getItem("user-email"),
    role: localStorage.getItem("user-role"),
  };
};

// -- LOGOUT --
export const logoutUser = () => {
  localStorage.removeItem("user-id");
  localStorage.removeItem("user-name");
  localStorage.removeItem("user-email");
  localStorage.removeItem("user-role");
};

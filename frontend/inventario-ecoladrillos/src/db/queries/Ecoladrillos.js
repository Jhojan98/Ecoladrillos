import { useFetch } from "@hooks/useFetch";
import { useMutation } from "@hooks/useMutation";

// --- MAIN ---
// GET ecoladrillos
export const useGetEcoladrillos = () => {
  return useFetch("/ecoladrillos", "Error al obtener los ecoladrillos");
};

// POST/PUT/DEL ecoladrillo
export const useEcobricksMutation = () => {
  const post = useMutation();
  const put = useMutation();
  const del = useMutation();

  return {
    post: (data) =>
      post.mutate(
        "POST",
        "/ecoladrillos/",
        data,
        "Error al registrar el ecoladrillo"
      ),
    put: (id, data) =>
      put.mutate(
        "PUT",
        `/ecoladrillos/${id}/`,
        data,
        "Error al actualizar el ecoladrillo"
      ),
    del: (id) =>
      del.mutate(
        "DELETE",
        `/ecoladrillos/${id}/`,
        null,
        "Error al eliminar el ecoladrillo"
      ),
    loading: post.loading || put.loading || del.loading,
    error: post.error || put.error || del.error,
  };
};

// --- REGISTROS ---
// GET registro
export const useGetRegistersEcobricks = () => {
  return useFetch(
    "/registros-ecoladrillo",
    "Error al obtener los registros de ecoladrillos"
  );
};

// POST registro
export const useRegisterEcobricksMutation = () => {
  const post = useMutation();

  return {
    post: (data) =>
      post.mutate(
        "POST",
        "/registros-ecoladrillo/",
        data,
        "Error al registrar el ecoladrillo"
      ),
    loading: post.loading,
    error: post.error,
  };
};

// --- RETIROS ---
// GET retiros
export const useGetRetirosEcobricks = () => {
  return useFetch(
    "/retiros-ecoladrillo",
    "Error al obtener los retiros de ecoladrillos"
  );
};

// POST retiro
export const useRetiroEcoladrillosMutation = () => {
  const post = useMutation();

  return {
    post: (data) =>
      post.mutate(
        "POST",
        "/retiros-ecoladrillo/",
        data,
        "Error al registrar el retiro de ecoladrillos"
      ),
    loading: post.loading,
    error: post.error,
  };
}
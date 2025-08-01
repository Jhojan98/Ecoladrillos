import { useFetch } from "@hooks/useFetch";
import { useMutation } from "@hooks/useMutation";

// GET registro
export const useGetRegistersEcobricks = () => {
  return useFetch(
    "/registros-ecoladrillo",
    "Error al obtener los registros de ecoladrillos"
  );
};

// post registro
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

// retiro

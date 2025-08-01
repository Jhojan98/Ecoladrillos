import { useFetch } from "@hooks/useFetch";
import { useMutation } from "@hooks/useMutation";

// GET registro
export const useGetRegistersMaterials = () => {
  return useFetch(
    "/registros-material",
    "Error al obtener los registros de materiales"
  );
};

// post registro
export const useRegisterMaterialMutation = () => {
  const post = useMutation();

  return {
    post: (data) =>
      post.mutate(
        "POST",
        "/registros-material/",
        data,
        "Error al registrar el material"
      ),
    loading: post.loading,
    error: post.error,
  };
};
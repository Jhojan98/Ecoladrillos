import { useFetch } from "@hooks/useFetch";
import { useMutation } from "@hooks/useMutation";

// -- MAIN --
// GET materiales
export const useGetMaterials = () => {
  return useFetch("/materiales/reporte_stock", "Error al obtener los materiales");
};

// POST/PUT/DEL ecoladrillo
export const useMaterialsMutation = () => {
  const post = useMutation();
  const put = useMutation();
  const del = useMutation();
  
  return {
    post: (data) =>
      post.mutate(
        "POST",
        "/materiales/",
        data,
        "Error al registrar el material"
      ),
    put: (id, data) =>
      put.mutate(
        "PUT",
        `/materiales/${id}/`,
        data,
        "Error al actualizar el material"
      ),
    del: (id) =>
      del.mutate(
        "DELETE",
        `/materiales/${id}/`,
        null,
        "Error al eliminar el material"
      ),
    loading: post.loading || put.loading || del.loading,
    error: post.error || put.error || del.error,
  };
};

// --- REGISTROS ---
// GET registro
export const useGetRegistersMaterials = () => {
  return useFetch(
    "/registros-material",
    "Error al obtener los registros de materiales"
  );
};

// POST registro
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
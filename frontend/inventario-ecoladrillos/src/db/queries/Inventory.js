import { useFetch } from "@hooks/useFetch";

// get ecoladrillos
export const useGetEcoladrillos = () => {
  return useFetch("/ecoladrillos", "Error al obtener los ecoladrillos");
};

//get materiales
export const useGetMaterials = () => {
  return useFetch("/materiales", "Error al obtener los materiales");
};
import { useFetch } from "@hooks/useFetch";

// get ecoladrillos
export const useEcoladrillos = () => {
  return useFetch("/ecoladrillos", "Error al obtener los ecoladrillos");
};

//get materiales
export const useMaterials = () => {
  return useFetch("/materiales", "Error al obtener los materiales");
};
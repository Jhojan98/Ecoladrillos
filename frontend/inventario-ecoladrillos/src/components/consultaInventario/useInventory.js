import { useEffect, useState } from "react";
// hooks
import { useNotifier } from "@hooks/useNotifier";
import { useConfirm } from "@hooks/useConfirm";
// queries
import { useGetEcoladrillos, useGetMaterials } from "@db/queries/Inventory";
import { useEcobricksMutation } from "@db/queries/Ecoladrillos";
import { useMaterialsMutation } from "@db/queries/Material";

export function useInventory() {
  const notify = useNotifier();
  const confirm = useConfirm();

  // --- OBTERENER ECOALDRILLOS y MATERIALES ---
  const [ecoladrillos, setEcoladrillos] = useState([]);
  const [materiales, setMateriales] = useState([]);

  const { fetchData: getEcoladrillos } = useGetEcoladrillos();
  const { fetchData: getMateriales } = useGetMaterials();

  useEffect(() => {
    const fetchData = async () => {
      const ecoladrillos = await getEcoladrillos();
      const materiales = await getMateriales();

      if (ecoladrillos.fetchErrorMsg) {
        notify.error(ecoladrillos.fetchErrorMsg);
        return;
      }
      if (materiales.fetchErrorMsg) {
        notify.error(materiales.fetchErrorMsg);
        return;
      }

      setEcoladrillos(ecoladrillos.results || []);
      setMateriales(materiales.results || []);
    };

    fetchData();
  }, []);

  // Función para refrescar los ecoladrillos después de una operación
  const refreshEcoladrillos = async () => {
    const updatedEcoladrillos = await getEcoladrillos();
    if (!updatedEcoladrillos.fetchErrorMsg) {
      setEcoladrillos(updatedEcoladrillos.results || []);
    }
  };

  // Función para refrescar los materiales después de una operación
  const refreshMateriales = async () => {
    const updatedMateriales = await getMateriales();
    if (!updatedMateriales.fetchErrorMsg) {
      setMateriales(updatedMateriales.results || []);
    }
  };

  // Totales
  const totalEcoladrillos = ecoladrillos.reduce(
    (acc, e) => acc + e.cantidad,
    0
  );
  const totalMateriales = materiales.reduce(
    (acc, m) => acc + m.cantidad_disponible,
    0
  );

  const [openModal, setOpenModal] = useState(false);

  // ------ FORM STATE ------
  const initialFormState = {
    id: null,
    nombre: "",
    descripcion: "",
    size: "",
    material_principal: "",
    cantidad_material_requerida: "",
    cantidad: "",
    // Campos para materiales
    tipo: "",
    cantidad_disponible: "",
    unidad_medida: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [formType, setFormType] = useState(""); // "ecoladrillo" o "material"

  // Función para abrir modal para crear nuevo ecoladrillo
  const openCreateModal = (formType) => {
    setFormType(formType);
    setFormData(initialFormState);
    setIsEditing(false);
    setOpenModal(true);
  };

  // Función para abrir modal para editar ecoladrillo
  const openEditEcoModal = (ecoladrillo) => {
    setFormData({
      id: ecoladrillo.id_ecoladrillo,
      nombre: ecoladrillo.nombre,
      descripcion: ecoladrillo.descripcion,
      size: ecoladrillo.size,
      material_principal: ecoladrillo.material_principal,
      cantidad_material_requerida: ecoladrillo.cantidad_material_requerida,
      cantidad: ecoladrillo.cantidad,
    });
    setFormType("ecoladrillo");
    setIsEditing(true);
    setOpenModal(true);
  };

  // Función para abrir modal para editar material
  const openEditMaterialModal = (material) => {
    setFormData({
      id: material.id_insumo,
      nombre: material.nombre,
      tipo: material.tipo,
      cantidad_disponible: material.cantidad_disponible,
      unidad_medida: material.unidad_medida,
    });
    setFormType("material");
    setIsEditing(true);
    setOpenModal(true);
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Convertir a entero para campos numéricos
    if (
      name === "cantidad" ||
      name === "cantidad_material_requerida" ||
      name === "cantidad_disponible"
    ) {
      processedValue = value === "" ? "" : parseInt(value, 10) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // ------ ENVIO DE DATOS ------
  const ecobricksMutation = useEcobricksMutation();
  const materialsMutation = useMaterialsMutation();

  // Función para guardar (crear o editar)
  const handleSave = async () => {
    if (formType === "ecoladrillo") {
      await handleSaveEcoladrillo();
    } else if (formType === "material") {
      await handleSaveMaterial();
    }
  };

  // Función para guardar ecoladrillo
  const handleSaveEcoladrillo = async () => {
    const dataToSend = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      size: formData.size,
      material_principal: parseInt(formData.material_principal, 10),
      cantidad_material_requerida:
        parseInt(formData.cantidad_material_requerida, 10) || 0,
      cantidad: parseInt(formData.cantidad, 10) || 0,
    };

    let result = {};
    if (isEditing) {
      result = await ecobricksMutation.put(formData.id, dataToSend);
    } else {
      result = await ecobricksMutation.post(dataToSend);
    }

    if (result.errorMutationMsg) {
      notify.error(result.errorMutationMsg);
      return;
    }

    if (isEditing) {
      notify.success("Ecoladrillo actualizado correctamente");
    } else {
      notify.success("Ecoladrillo creado correctamente");
    }
    setOpenModal(false);
    await refreshEcoladrillos();
  };

  // Función para guardar material
  const handleSaveMaterial = async () => {
    const dataToSend = {
      nombre: formData.nombre,
      tipo: formData.tipo,
      cantidad_disponible: parseInt(formData.cantidad_disponible, 10) || 0,
      unidad_medida: formData.unidad_medida,
    };

    let result = {};
    if (isEditing) {
      result = await materialsMutation.put(formData.id, dataToSend);
    } else {
      result = await materialsMutation.post(dataToSend);
    }

    if (result.errorMutationMsg) {
      notify.error(result.errorMutationMsg);
      return;
    }

    if (isEditing) {
      notify.success("Material actualizado correctamente");
    } else {
      notify.success("Material creado correctamente");
    }
    setOpenModal(false);
    await refreshMateriales();
  };

  // Función para eliminar
  const handleDelete = async () => {
    if (formType === "ecoladrillo") {
      await handleDeleteEcoladrillo();
    } else if (formType === "material") {
      await handleDeleteMaterial();
    }
  };

  // Función para eliminar ecoladrillo
  const handleDeleteEcoladrillo = async () => {
    confirm.deleteConfirm({
      message: `el ecoladrillo "${formData.nombre}"`,
      onAccept: async () => {
        const result = await ecobricksMutation.del(formData.id);

        if (result.errorMutationMsg) {
          notify.error(result.errorMutationMsg);
          return;
        }

        notify.success("Ecoladrillo eliminado correctamente");
        setOpenModal(false);
        await refreshEcoladrillos();
      },
    });
  };

  // Función para eliminar material
  const handleDeleteMaterial = async () => {
    confirm.deleteConfirm({
      message: `el material "${formData.nombre}"`,
      onAccept: async () => {
        const result = await materialsMutation.del(formData.id);

        if (result.errorMutationMsg) {
          notify.error(result.errorMutationMsg);
          return;
        }

        notify.success("Material eliminado correctamente");
        setOpenModal(false);
        await refreshMateriales();
      },
    });
  };

  return {
    ecoladrillos,
    materiales,
    totalEcoladrillos,
    totalMateriales,
    // form
    openModal,
    openCreateModal,
    setOpenModal,
    openEditEcoModal,
    openEditMaterialModal,

    formProps: {
      formType,
      materiales,
      loading:
        formType === "ecoladrillo"
          ? ecobricksMutation.loading
          : materialsMutation.loading,
      formData,
      isEditing,
      setOpenModal,
      handleInputChange,
      handleSave,
      handleDelete,
    },
  };
}

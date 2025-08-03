import { useEffect, useState } from "react";
// hooks
import { useNotifier } from "@hooks/useNotifier";
import { useConfirm } from "@hooks/useConfirm";
// queries
import { useGetEcoladrillos, useGetMaterials } from "@db/queries/Inventory";
import { useEcobricksMutation } from "@db/queries/Ecoladrillos";
import { useMaterialsMutation } from "@db/queries/Material";
// styles
import "./consultaInventario.scss";

export default function ConsultaInventario() {
  const notify = useNotifier();
  const confirm = useConfirm();

  // --- OBTERENER ECOALDRILLOS y MATERIALES ---
  const [ecoladrillos, setEcoladrillos] = useState([]);
  const [materiales, setMateriales] = useState([]);

  const { fetchData: getEcoladrillos } = useGetEcoladrillos();
  const { fetchData: getMateriales } = useGetMaterials();

  // --- MUTATIONS ---
  const ecobricksMutation = useEcobricksMutation();
  const materialsMutation = useMaterialsMutation();

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

  // Categoria de filtro
  const [categoria, setCategoria] = useState("Todos");

  // Totales
  const totalEcoladrillos = ecoladrillos.reduce(
    (acc, e) => acc + e.cantidad,
    0
  );
  const totalMateriales = materiales.reduce(
    (acc, m) => acc + m.cantidad_disponible,
    0
  );

  const [modal, setModal] = useState(null);

  // --- MODAL STATE ---
  const [formData, setFormData] = useState({
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
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formType, setFormType] = useState(""); // "ecoladrillo" o "material"

  // Función para abrir modal para crear nuevo ecoladrillo
  const openCreateModal = () => {
    setFormData({
      id: null,
      nombre: "",
      descripcion: "",
      size: "",
      material_principal: "",
      cantidad_material_requerida: "",
      cantidad: "",
      tipo: "",
      cantidad_disponible: "",
      unidad_medida: "",
    });
    setIsEditing(false);
    setFormType("ecoladrillo");
    setModal("ecoladrillo-form");
  };

  // Función para abrir modal para crear nuevo material
  const openCreateMaterialModal = () => {
    setFormData({
      id: null,
      nombre: "",
      descripcion: "",
      size: "",
      material_principal: "",
      cantidad_material_requerida: "",
      cantidad: "",
      tipo: "",
      cantidad_disponible: "",
      unidad_medida: "",
    });
    setIsEditing(false);
    setFormType("material");
    setModal("material-form");
  };

  // Función para abrir modal para editar ecoladrillo
  const openEditModal = (ecoladrillo) => {
    setFormData({
      id: ecoladrillo.id_ecoladrillo,
      nombre: ecoladrillo.nombre || "",
      descripcion: ecoladrillo.descripcion || "",
      size: ecoladrillo.size || "",
      material_principal: ecoladrillo.material_principal || "",
      cantidad_material_requerida:
        ecoladrillo.cantidad_material_requerida || "",
      cantidad: ecoladrillo.cantidad || "",
      tipo: "",
      cantidad_disponible: "",
      unidad_medida: "",
    });
    setIsEditing(true);
    setFormType("ecoladrillo");
    setModal("ecoladrillo-form");
  };

  // Función para abrir modal para editar material
  const openEditMaterialModal = (material) => {
    setFormData({
      id: material.id_insumo,
      nombre: material.nombre || "",
      descripcion: "",
      size: "",
      material_principal: "",
      cantidad_material_requerida: "",
      cantidad: "",
      tipo: material.tipo || "",
      cantidad_disponible: material.cantidad_disponible || "",
      unidad_medida: material.unidad_medida || "",
    });
    setIsEditing(true);
    setFormType("material");
    setModal("material-form");
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
    setModal(null);
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
    setModal(null);
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
      message: `el ecoladrillo ${formData.nombre}`,
      onAccept: async () => {
        const result = await ecobricksMutation.del(formData.id);
        setModal(null);

        if (result.errorMutationMsg) {
          notify.error(result.errorMutationMsg);
          return;
        }

        notify.success("Ecoladrillo eliminado correctamente");
        await refreshEcoladrillos();
      },
    });
  };

  // Función para eliminar material
  const handleDeleteMaterial = async () => {
    confirm.deleteConfirm({
      message: `el material ${formData.nombre}`,
      onAccept: async () => {
        const result = await materialsMutation.del(formData.id);
        setModal(null);

        if (result.errorMutationMsg) {
          notify.error(result.errorMutationMsg);
          return;
        }

        notify.success("Material eliminado correctamente");
        await refreshMateriales();
      },
    });
  };

  return (
    <div className="consulta-inventario w-100">
      {/* Header */}
      <header className="inventory-header">
        <h1>Inventario General</h1>
      </header>

      {/* Ecoladrillos */}
      <h2 className="subheader">Ecoladrillos ({totalEcoladrillos})</h2>
      <div className="inventory-cards">
        {(categoria === "Ecoladrillos" || categoria === "Todos") &&
          ecoladrillos.map((ecoladrillo) => (
            <Card
              key={ecoladrillo.id_ecoladrillo}
              cartType="Ecoladrillo"
              id={ecoladrillo.id_ecoladrillo}
              name={ecoladrillo.nombre}
              description={ecoladrillo.descripcion}
              quantity={ecoladrillo.cantidad}
              sizeEco={ecoladrillo.size || "N/A"}
              mainMaterialEco={ecoladrillo.material_principal_nombre || "N/A"}
              requiredMaterialEco={ecoladrillo.cantidad_material_requerida || 0}
              onClick={() => openEditModal(ecoladrillo)}
            />
          ))}
        <div
          className="card flex --add-card --add-card-eco"
          onClick={openCreateModal}
        >
          <button className="btn-clean">+</button>
        </div>
      </div>

      {/* Materiales */}
      <h2 className="subheader">Materiales ({totalMateriales})</h2>
      <div className="inventory-cards">
        {(categoria === "Materiales" || categoria === "Todos") &&
          materiales.map((material) => (
            <Card
              key={material.id_insumo}
              cartType="Material"
              id={material.id_insumo}
              name={material.nombre}
              quantity={material.cantidad_disponible}
              materialType={material.tipo}
              measureUnit={material.unidad_medida}
              onClick={() => openEditMaterialModal(material)}
            />
          ))}
        <div className="card flex --add-card" onClick={openCreateMaterialModal}>
          <button className="btn-clean">+</button>
        </div>
      </div>

      {/* Formulario */}
      {modal && (
        <Form
          formType={formType}
          materiales={materiales}
          loading={
            formType === "ecoladrillo"
              ? ecobricksMutation.loading
              : materialsMutation.loading
          }
          formData={formData}
          isEditing={isEditing}
          setModal={setModal}
          handleInputChange={handleInputChange}
          handleSave={handleSave}
          handleDelete={handleDelete}
        />
      )}
    </div>
  );
}

function Card(props) {
  const {
    cartType,
    id,
    name,
    description,
    quantity,
    sizeEco,
    mainMaterialEco,
    requiredMaterialEco,
    materialType,
    measureUnit,
    onClick,
  } = props;
  return (
    <div
      className={`card flex gap-10 flex-column --${cartType}-card`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="card-header">
        <span className="id-card">{id}</span>
        <h3>{name || "Ecoladrillo"}</h3>
      </div>

      <div className="units-card-container">
        <div className="units-number-container">
          <span className="units-number">
            {quantity} {measureUnit || "u"}
          </span>
        </div>
        <p className="units-text">
          {cartType === "Material" ? "disponibles" : "producidas"}
        </p>
      </div>

      <div className="card-details">
        {description && <p className="description-card">{description}</p>}

        {sizeEco && (
          <p>
            <b>Tamaño:</b> {sizeEco}
          </p>
        )}
        {mainMaterialEco && (
          <p>
            <b>Produccion:</b> {requiredMaterialEco} - {mainMaterialEco}
          </p>
        )}
        {materialType && (
          <p>
            <b>Tipo:</b> {materialType}
          </p>
        )}
      </div>
    </div>
  );
}

function Form(props) {
  const {
    formType,
    materiales,
    loading,
    formData,
    isEditing,
    setModal,
    handleInputChange,
    handleSave,
    handleDelete,
  } = props;

  const isEcoladrillo = formType === "ecoladrillo";
  const isMaterial = formType === "material";

  const title = isEcoladrillo
    ? isEditing
      ? "Editar Ecoladrillo"
      : "Crear Nuevo Ecoladrillo"
    : isEditing
    ? "Editar Material"
    : "Crear Nuevo Material";

  return (
    <div className="modal-bg" onClick={() => setModal(null)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={() => setModal(null)}>
          ×
        </button>
        <h2>{title}</h2>

        <div className="modal-content">
          <form className="ecoladrillo-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </div>

            {isEcoladrillo && (
              <>
                <div className="form-group">
                  <label htmlFor="descripcion">Descripción:</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="size">Tamaño:</label>
                  <select
                    name="size"
                    id="size"
                    value={formData.size}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecciona un tamaño</option>
                    <option value="small">Pequeño</option>
                    <option value="medium">Mediano</option>
                    <option value="large">Grande</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="material_principal">
                    Material Principal:
                  </label>
                  <select
                    id="material_principal"
                    name="material_principal"
                    value={formData.material_principal}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona un material</option>
                    {materiales.map((material) => (
                      <option
                        key={material.id_insumo}
                        value={material.id_insumo}
                      >
                        {material.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="cantidad_material_requerida">
                    Cantidad Material Requerida:
                  </label>
                  <input
                    type="number"
                    id="cantidad_material_requerida"
                    name="cantidad_material_requerida"
                    value={formData.cantidad_material_requerida}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cantidad">Cantidad (Stock inicial):</label>
                  <input
                    type="number"
                    id="cantidad"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    required
                  />
                </div>
              </>
            )}

            {isMaterial && (
              <>
                <div className="form-group">
                  <label htmlFor="tipo">Tipo:</label>
                  <input
                    type="text"
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cantidad_disponible">
                    Cantidad Disponible:
                  </label>
                  <input
                    type="number"
                    id="cantidad_disponible"
                    name="cantidad_disponible"
                    value={formData.cantidad_disponible}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="unidad_medida">Unidad de Medida:</label>
                  <select
                    id="unidad_medida"
                    name="unidad_medida"
                    value={formData.unidad_medida}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona una unidad</option>
                    <option value="u">Unidades (u)</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="g">Gramos (g)</option>
                    <option value="m">Metros (m)</option>
                    <option value="cm">Centímetros (cm)</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "Eliminando..." : "Eliminar"}
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModal(null)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function InventoryForm(props) {
  const {
    formType,
    materialesData,
    loading,
    formData,
    isEditing,
    setOpenModal,
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
    <div className="modal-bg">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={() => setOpenModal(null)}>
          <i className="pi pi-times"></i>
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
                    {materialesData?.materiales?.map((material) => (
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
                    disabled={isEditing}
                    required
                  />
                </div>
              </>
            )}

            {isMaterial && (
              <>
                <div className="form-group">
                  <label htmlFor="tipo">Tipo:</label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona un tipo</option>
                    <option value="plastico">Plástico</option>
                    <option value="residuos_organicos">
                      Residuos Orgánicos
                    </option>
                    <option value="papel">Papel</option>
                    <option value="carton">Cartón</option>
                    <option value="paja">Paja</option>
                    <option value="madera">Madera</option>
                    <option value="otro">Otro</option>
                  </select>
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
                    disabled={isEditing}
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
                onClick={() => setOpenModal(null)}
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

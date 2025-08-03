export function Card(props) {
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

import { useEffect, useState } from "react";
// hooks
import { useNotifier } from "@hooks/useNotifier";
// queries
import { useGetEcoladrillos, useGetMaterials } from "@db/queries/Inventory";
// styles
import "./consultaInventario.scss";

export default function ConsultaInventario() {
  const notify = useNotifier();

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

  return (
    <div className="consulta-inventario w-100">
      {/* Header */}
      <header className="inventory-header">
        <h1>📦 Inventario General</h1>
        <div className="select-wrapper">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Ecoladrillos">Ecoladrillos</option>
            <option value="Materiales">Materiales</option>
          </select>
        </div>
      </header>

      {/* Barra inferior */}
      <div className="total-inventory">
        <span>
          Total Ecoladrillos: {totalEcoladrillos} | Total Materiales:{" "}
          {totalMateriales}
        </span>
      </div>

      {/* Grid de inventario */}
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
            />
          ))}
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
            />
          ))}
      </div>

      {/* Modal detalle */}
      {/* {modal && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setModal(null)}>
              ×
            </button>
            <h2>Detalles de {modal.nombre || "Ecoladrillo"}</h2>
            <div className="detalle">
              <p>
                <strong>ID:</strong> {modal.id}
              </p>
              {modal.fecha_registro && (
                <p>
                  <strong>Fecha Registro:</strong> {modal.fecha_registro}
                </p>
              )}
              {modal.tipo && (
                <p>
                  <strong>Tipo:</strong> {modal.tipo}
                </p>
              )}
              <p>
                <strong>Cantidad:</strong>{" "}
                {modal.cantidad ?? modal.cantidad_disponible}{" "}
                {modal.unidad_medida || "unidades"}
              </p>
            </div>
          </div>
        </div>
      )} */}
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
  } = props;
  return (
    <div className="card flex gap-10 flex-column">
      <span className={`card-type --${cartType}-card`}>{cartType}</span>

      <div className="card-header">
        <span className="id-card">{id}</span>
        <h3>{name || "Ecoladrillo"}</h3>
      </div>

      {description && <p className="description-card">{description}</p>}

      <div className="card-details">
        <p className="secondary-text-card">
          {quantity} {measureUnit || "unidades"}
        </p>

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

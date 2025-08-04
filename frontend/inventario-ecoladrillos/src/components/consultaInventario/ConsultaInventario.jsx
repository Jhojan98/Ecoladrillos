// components
import { Card } from "./InventoryCard";
import { InventoryForm } from "./InventoryForm";
// hooks
import { useInventory } from "./useInventory";
// styles
import "./consultaInventario.scss";

export default function ConsultaInventario() {
  const {
    ecoladrillosData,
    materialesData,
    openCreateModal,
    openEditEcoModal,
    openEditMaterialModal,
    openModal,
    formProps,
  } = useInventory();

  return (
    <div className="consulta-inventario w-100">
      {/* Header */}
      <header className="inventory-header">
        <h1>Inventario General</h1>
      </header>

      {/* Ecoladrillos */}
      <h2 className="subheader">
        Ecoladrillos ({ecoladrillosData?.stock_total || 0})
      </h2>
      <div className="inventory-cards">
        {ecoladrillosData?.ecoladrillos?.map((ecoladrillo) => (
          <Card
            key={ecoladrillo.id_ecoladrillo}
            cartType="Ecoladrillo"
            id={ecoladrillo.id_ecoladrillo}
            name={ecoladrillo.nombre}
            description={ecoladrillo.descripcion}
            quantity={ecoladrillo.cantidad}
            sizeEco={ecoladrillo.size}
            mainMaterialEco={ecoladrillo.material_principal_nombre}
            requiredMaterialEco={ecoladrillo.cantidad_material_requerida || 0}
            onClick={() => openEditEcoModal(ecoladrillo)}
          />
        ))}
        <div
          className="card flex --add-card --add-card-eco"
          onClick={() => openCreateModal("ecoladrillo")}
        >
          <button className="btn-clean">+</button>
        </div>
      </div>

      {/* Materiales */}
      <h2 className="subheader">
        Materiales ({materialesData?.stock_total || 0})
      </h2>
      <div className="inventory-cards">
        {materialesData?.materiales?.map((material) => (
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
        <div
          className="card flex --add-card"
          onClick={() => openCreateModal("material")}
        >
          <button className="btn-clean">+</button>
        </div>
      </div>

      {/* Formulario */}
      {openModal && <InventoryForm {...formProps} />}
    </div>
  );
}

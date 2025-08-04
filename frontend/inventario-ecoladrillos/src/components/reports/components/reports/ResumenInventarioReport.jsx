import React from "react";

export default function ResumenInventarioReport({ reportData }) {
  return (
    <>
      <div className="summary-item">
        <h3>Ecoladrillos con Stock</h3>
        <span className="summary-value">
          {reportData.datos.resumen?.total_ecoladrillos_con_stock || 0}
        </span>
      </div>

      <div className="summary-item">
        <h3>Ecoladrillos sin Stock</h3>
        <span className="summary-value">
          {reportData.datos.resumen?.total_ecoladrillos_sin_stock || 0}
        </span>
      </div>

      <div className="summary-item">
        <h3>Materiales con Stock</h3>
        <span className="summary-value">
          {reportData.datos.resumen?.total_materiales_con_stock || 0}
        </span>
      </div>

      <div className="summary-item">
        <h3>Materiales sin Stock</h3>
        <span className="summary-value">
          {reportData.datos.resumen?.total_materiales_sin_stock || 0}
        </span>
      </div>

      {reportData.datos.ecoladrillos_con_stock &&
        reportData.datos.ecoladrillos_con_stock.length > 0 && (
          <div className="summary-item">
            <h3>Ecoladrillos Disponibles</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Tamaño</th>
                  <th>Material Principal</th>
                  <th>Stock</th>
                  <th>Material Requerido</th>
                </tr>
              </thead>
              <tbody>
                {reportData.datos.ecoladrillos_con_stock.map((eco) => (
                  <tr key={eco.id}>
                    <td>{eco.nombre}</td>
                    <td>{eco.descripcion}</td>
                    <td>{eco.size}</td>
                    <td>{eco.material_principal}</td>
                    <td>{eco.cantidad_stock}</td>
                    <td>{eco.cantidad_material_requerida}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {reportData.datos.materiales_con_stock &&
        reportData.datos.materiales_con_stock.length > 0 && (
          <div className="summary-item">
            <h3>Materiales Disponibles</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Cantidad Disponible</th>
                  <th>Unidad de Medida</th>
                </tr>
              </thead>
              <tbody>
                {reportData.datos.materiales_con_stock.map((material) => (
                  <tr key={material.id}>
                    <td>{material.nombre}</td>
                    <td>{material.tipo}</td>
                    <td>{material.cantidad_disponible}</td>
                    <td>{material.unidad_medida}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </>
  );
}

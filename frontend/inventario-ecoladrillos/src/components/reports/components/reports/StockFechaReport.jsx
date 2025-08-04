import React from "react";
import { formatDate } from "../../utils/reportUtils";

export default function StockFechaReport({ reportData }) {
  return (
    <>
      <div className="summary-item">
        <h3>Total de Ecoladrillos</h3>
        <span className="summary-value">
          {reportData.datos.total_ecoladrillos || 0}
        </span>
      </div>

      <div className="summary-item">
        <h3>Ecoladrillos con Stock</h3>
        <span className="summary-value">
          {reportData.datos.ecoladrillos_con_stock || 0}
        </span>
      </div>

      <div className="summary-item">
        <h3>Total de Materiales</h3>
        <span className="summary-value">
          {reportData.datos.total_materiales || 0}
        </span>
      </div>

      <div className="summary-item">
        <h3>Materiales con Stock</h3>
        <span className="summary-value">
          {reportData.datos.materiales_con_stock || 0}
        </span>
      </div>

      {reportData.datos.ecoladrillos &&
        reportData.datos.ecoladrillos.length > 0 && (
          <div className="summary-item">
            <h3>
              Estado de Ecoladrillos en{" "}
              {formatDate(reportData.datos.fecha_consulta)}
            </h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Tamaño</th>
                  <th>Material Principal</th>
                  <th>Stock</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reportData.datos.ecoladrillos.map((eco) => (
                  <tr key={eco.id}>
                    <td>{eco.nombre}</td>
                    <td>{eco.descripcion}</td>
                    <td>{eco.size}</td>
                    <td>{eco.material_principal}</td>
                    <td>{eco.cantidad_stock}</td>
                    <td>
                      <span
                        style={{
                          color: eco.tiene_stock ? "green" : "red",
                          fontWeight: "bold",
                        }}
                      >
                        {eco.tiene_stock ? "Con Stock" : "Sin Stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {reportData.datos.materiales &&
        reportData.datos.materiales.length > 0 && (
          <div className="summary-item">
            <h3>
              Estado de Materiales en{" "}
              {formatDate(reportData.datos.fecha_consulta)}
            </h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Cantidad Disponible</th>
                  <th>Unidad de Medida</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reportData.datos.materiales.map((material) => (
                  <tr key={material.id}>
                    <td>{material.nombre}</td>
                    <td>{material.tipo}</td>
                    <td>{material.cantidad_disponible}</td>
                    <td>{material.unidad_medida}</td>
                    <td>
                      <span
                        style={{
                          color: material.tiene_stock ? "green" : "red",
                          fontWeight: "bold",
                        }}
                      >
                        {material.tiene_stock ? "Con Stock" : "Sin Stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </>
  );
}

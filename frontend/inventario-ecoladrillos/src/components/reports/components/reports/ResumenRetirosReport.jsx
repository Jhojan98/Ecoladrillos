import React from "react";
import { formatDate } from "../../utils/reportUtils";

export default function ResumenRetirosReport({ reportData, formatDateTime }) {
  return (
    <>
      <div className="summary-item">
        <h3>Total de Retiros</h3>
        <span className="summary-value">
          {reportData.datos.estadisticas?.total_retiros || 0}
        </span>
      </div>

      <div className="summary-item">
        <h3>Cantidad Total Retirada</h3>
        <span className="summary-value">
          {reportData.datos.estadisticas?.total_cantidad_retirada || 0}
        </span>
      </div>

      <div className="summary-item">
        <h3>Tipos de Ecoladrillos Diferentes</h3>
        <span className="summary-value">
          {reportData.datos.estadisticas?.tipos_ecoladrillos_diferentes || 0}
        </span>
      </div>

      {reportData.datos.retiros && reportData.datos.retiros.length > 0 && (
        <div className="summary-item">
          <h3>Detalle de Retiros</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Ecoladrillo</th>
                <th>Tamaño</th>
                <th>Cantidad</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {reportData.datos.retiros.map((retiro, index) => (
                <tr key={index}>
                  <td>{formatDate(retiro.fecha)}</td>
                  <td>{retiro.ecoladrillo_nombre}</td>
                  <td>{retiro.ecoladrillo_size}</td>
                  <td>{retiro.cantidad}</td>
                  <td>{retiro.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportData.datos.resumen_por_ecoladrillo &&
        reportData.datos.resumen_por_ecoladrillo.length > 0 && (
          <div className="summary-item">
            <h3>Resumen por Ecoladrillo</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tamaño</th>
                  <th>Total Retirado</th>
                  <th>Número de Retiros</th>
                </tr>
              </thead>
              <tbody>
                {reportData.datos.resumen_por_ecoladrillo.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nombre}</td>
                    <td>{item.size}</td>
                    <td>{item.total_retirado}</td>
                    <td>{item.numero_retiros}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </>
  );
}

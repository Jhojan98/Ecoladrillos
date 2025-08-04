import React from "react";
import { formatDate, formatDateTime } from "../utils/reportUtils";
import ResumenRetirosReport from "./reports/ResumenRetirosReport";
import ResumenInventarioReport from "./reports/ResumenInventarioReport";
import StockFechaReport from "./reports/StockFechaReport";

export default function ViewReport(props) {
  const { userData, reportData, setShowReport, printReport } = props;

  const handlePrintReport = () => {
    printReport(reportData);
  };

  return (
    <div className="report-viewer">
      <div className="report-actions">
        <button className="btn-secondary" onClick={() => setShowReport(false)}>
          Generar Nuevo Reporte
        </button>
        <button className="btn-primary" onClick={handlePrintReport}>
          Imprimir en Nueva Ventana
        </button>
      </div>

      <div id="report-content" className="report-pdf-simulation">
        {/* Header del Reporte */}
        <div className="report-header">
          <h1>REPORTE - {reportData?.tipo_reporte?.toUpperCase()}</h1>
          <div className="report-id">ID: {reportData?.reporte_id}</div>
        </div>

        {/* Información General */}
        <div className="report-info">
          <div className="info-row">
            <span className="info-label">Fecha de Generación:</span>
            <span className="info-value">
              {formatDateTime(reportData?.fecha_generacion)}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Operario:</span>
            <span className="info-value">{reportData?.operario?.nombre}</span>
          </div>

          {/* Información específica según el tipo de reporte */}
          {reportData?.periodo && (
            <div className="info-row">
              <span className="info-label">Período de Consulta:</span>
              <span className="info-value">
                {formatDate(reportData?.periodo?.fecha_inicio)} -{" "}
                {formatDate(reportData?.periodo?.fecha_fin)}
              </span>
            </div>
          )}

          {reportData?.fecha_consulta && (
            <div className="info-row">
              <span className="info-label">Fecha de Consulta:</span>
              <span className="info-value">
                {formatDate(reportData?.fecha_consulta)}
              </span>
            </div>
          )}
        </div>

        {/* Datos del Reporte */}
        <div className="report-data">
          <h2>Resumen de Datos</h2>

          {reportData?.datos && (
            <>
              {/* Reporte de Resumen de Retiros */}
              {reportData.tipo_reporte === "Resumen de Retiros" && (
                <ResumenRetirosReport
                  reportData={reportData}
                  formatDateTime={formatDateTime}
                />
              )}

              {/* Reporte de Resumen de Inventario */}
              {reportData.tipo_reporte === "Resumen de Inventario" && (
                <ResumenInventarioReport reportData={reportData} />
              )}

              {/* Reporte de Stock en Fecha */}
              {reportData.tipo_reporte === "Stock en Fecha" && (
                <StockFechaReport reportData={reportData} />
              )}
            </>
          )}
        </div>

        {/* Footer del Reporte */}
        <div className="report-footer">
          <p>
            Reporte generado automáticamente por el Sistema de Inventario de
            Ecoladrillos
          </p>
          <p>Fecha de impresión: {new Date().toLocaleString("es-ES")}</p>
        </div>
      </div>
    </div>
  );
}

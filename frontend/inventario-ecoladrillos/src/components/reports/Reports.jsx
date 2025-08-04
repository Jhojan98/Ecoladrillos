import { useState } from "react";
// contexts
import { useAuth } from "@contexts/AuthContext";
// hooks
import { useNotifier } from "@hooks/useNotifier";
// queries
import { useReportMutation } from "@db/queries/Reports";
// styles
import "./reports.scss";

export default function Reports() {
  const { userData } = useAuth();
  const notify = useNotifier();
  const reportMutation = useReportMutation();

  const [formData, setFormData] = useState({
    tipo_reporte: "resumen_retiros",
    fecha_inicio: "",
    fecha_fin: "",
  });

  const [reportData, setReportData] = useState(null);
  const [showReport, setShowReport] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fecha_inicio || !formData.fecha_fin) {
      notify.error("Por favor, complete todas las fechas requeridas");
      return;
    }

    // Validar que fecha_inicio sea anterior a fecha_fin
    if (new Date(formData.fecha_inicio) > new Date(formData.fecha_fin)) {
      notify.error("La fecha de inicio debe ser anterior a la fecha de fin");
      return;
    }

    const reportPayload = {
      tipo_reporte: formData.tipo_reporte,
      operario: userData.id,
      fecha_consulta: new Date().toISOString().split("T")[0],
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
      datos_reporte: null,
    };

    const result = await reportMutation.post(
      formData.tipo_reporte === "resumen_retiros"
        ? "generar_resumen_retiros"
        : "generar_resumen_inventario",
      reportPayload
    );

    if (result && !result.errorMutationMsg) {
      setReportData(result);
      setShowReport(true);
      notify.success("Reporte generado exitosamente");
    } else {
      notify.error(result?.errorMutationMsg);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const printReport = () => {
    const printContent = document.getElementById("report-content");

    if (!printContent) {
      notify.error("No se pudo obtener el contenido del reporte");
      return;
    }

    try {
      const winPrint = window.open(
        "",
        "_blank",
        "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=1,status=0"
      );

      if (!winPrint) {
        notify.error(
          "No se pudo abrir la ventana de impresión. Verifique que no esté bloqueada por el navegador."
        );
        return;
      }

      winPrint.document.write(`
        <html>
          <head>
            <title>Reporte - ${reportData?.tipo_reporte}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              .report-header { text-align: center; margin-bottom: 30px; }
              .report-info { margin-bottom: 20px; }
              .report-data { margin-top: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .summary-item { margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 5px; }
              .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
              .info-label { font-weight: bold; }
              .summary-value { 
                display: inline-block; 
                background: #23478d; 
                color: white; 
                padding: 5px 10px; 
                border-radius: 3px; 
                font-weight: bold; 
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);

      winPrint.document.close();

      // Esperar a que el contenido se cargue antes de imprimir
      winPrint.onload = () => {
        winPrint.focus();
        setTimeout(() => {
          winPrint.print();
          winPrint.close();
        }, 500);
      };
    } catch (error) {
      notify.error("Error al generar la impresión");
    }
  };

  return (
    <div className="reports-container w-100">
      {/* Header */}
      <header className="reports-header">
        <h1>Generación de Reportes</h1>
      </header>

      {!showReport ? (
        <FormReport
          formData={formData}
          reportMutation={reportMutation}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      ) : (
        <ViewReport
          reportData={reportData}
          userData={userData}
          setShowReport={setShowReport}
          printReport={printReport}
          formatDateTime={formatDateTime}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

export function FormReport(props) {
  const { formData, reportMutation, handleInputChange, handleSubmit } = props;

  return (
    <div className="report-form-container">
      <form className="report-form" onSubmit={handleSubmit}>
        <h2>Consultar Nuevo Reporte</h2>

        <div className="form-group">
          <label htmlFor="tipo_reporte">Tipo de Reporte:</label>
          <select
            id="tipo_reporte"
            name="tipo_reporte"
            value={formData.tipo_reporte}
            onChange={handleInputChange}
            required
          >
            <option value="resumen_retiros">Resumen de Retiros</option>
            <option value="resumen_inventario">Resumen de Inventario</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha_inicio">Fecha de Inicio:</label>
            <input
              type="date"
              id="fecha_inicio"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha_fin">Fecha de Fin:</label>
            <input
              type="date"
              id="fecha_fin"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={reportMutation.loading}
          >
            {reportMutation.loading ? "Generando..." : "Generar Reporte"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ViewReport(props) {
  const {
    userData,
    reportData,
    setShowReport,
    printReport,
    formatDateTime,
    formatDate,
  } = props;

  return (
    <div className="report-viewer">
      <div className="report-actions">
        <button className="btn-secondary" onClick={() => setShowReport(false)}>
          Generar Nuevo Reporte
        </button>
        <button className="btn-primary" onClick={printReport}>
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
            <span className="info-value">{userData.userName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Período de Consulta:</span>
            <span className="info-value">
              {formatDate(reportData?.periodo?.fecha_inicio)} -{" "}
              {formatDate(reportData?.periodo?.fecha_fin)}
            </span>
          </div>
        </div>

        {/* Datos del Reporte */}
        <div className="report-data">
          <h2>Resumen de Datos</h2>

          {reportData?.datos && (
            <>
              <div className="summary-item">
                <h3>Total de Retiros</h3>
                <span className="summary-value">
                  {reportData.datos.total_retiros}
                </span>
              </div>

              <div className="summary-item">
                <h3>Cantidad Total Retirada</h3>
                <span className="summary-value">
                  {reportData.datos.cantidad_total_retirada}
                </span>
              </div>

              {reportData.datos.retiros_por_tipo && (
                <div className="summary-item">
                  <h3>Retiros por Tipo</h3>
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Tipo de Ecoladrillo</th>
                        <th>Cantidad Retirada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(reportData.datos.retiros_por_tipo).map(
                        ([tipo, cantidad]) => (
                          <tr key={tipo}>
                            <td>{tipo.toUpperCase()}</td>
                            <td>{cantidad}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
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

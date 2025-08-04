import { useState } from "react";
// contexts
import { useAuth } from "@contexts/AuthContext";
// hooks
import { useNotifier } from "@hooks/useNotifier";
// queries
import { useReportMutation } from "@db/queries/Reports";
// components
import FormReport from "./components/FormReport";
import ViewReport from "./components/ViewReport";
// config
import { getReportConfigs } from "./config/reportConfigs";
// utils
import { printReport } from "./utils/reportUtils";
// styles
import "./reports.scss";

export default function Reports() {
  const { userData } = useAuth();
  const notify = useNotifier();
  const reportMutation = useReportMutation();

  const [formData, setFormData] = useState({
    tipo_reporte: "generar_resumen_retiros",
    fecha_inicio: "",
    fecha_fin: "",
    fecha: "",
  });

  const [reportData, setReportData] = useState(null);
  const [showReport, setShowReport] = useState(false);

  // Configuración para cada tipo de reporte
  const reportConfigs = getReportConfigs(userData, formData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const config = reportConfigs[formData.tipo_reporte];

    // Validar campos requeridos según el tipo de reporte
    const missingFields = config.requiredFields.filter(
      (field) => !formData[field]
    );
    if (missingFields.length > 0) {
      notify.error(
        `Por favor, complete todos los campos requeridos: ${missingFields.join(
          ", "
        )}`
      );
      return;
    }

    // Validar fechas para el reporte de retiros
    if (formData.tipo_reporte === "generar_resumen_retiros") {
      if (new Date(formData.fecha_inicio) > new Date(formData.fecha_fin)) {
        notify.error("La fecha de inicio debe ser anterior a la fecha de fin");
        return;
      }
    }

    // Obtener el payload según el tipo de reporte
    const reportPayload = config.getPayload();

    const result = await reportMutation.post(
      formData.tipo_reporte,
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

  const handlePrintReport = () => {
    printReport(reportData, notify);
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
          reportConfigs={reportConfigs}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      ) : (
        <ViewReport
          reportData={reportData}
          userData={userData}
          setShowReport={setShowReport}
          printReport={handlePrintReport}
        />
      )}
    </div>
  );
}

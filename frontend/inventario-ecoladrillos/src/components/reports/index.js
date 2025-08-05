// Exportaciones principales
export { default as Reports } from "./Reports";
export { default as FormReport } from "./components/FormReport";
export { default as ViewReport } from "./components/ViewReport";

// Exportaciones de reportes específicos
export { default as ResumenRetirosReport } from "./components/reports/ResumenRetirosReport";
export { default as ResumenInventarioReport } from "./components/reports/ResumenInventarioReport";
export { default as StockFechaReport } from "./components/reports/StockFechaReport";

// Exportaciones de configuración y utilidades
export { getReportConfigs } from "./config/reportConfigs";
export { formatDate, formatDateTime, printReport } from "./utils/reportUtils";

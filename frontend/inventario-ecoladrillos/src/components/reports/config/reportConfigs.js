// Configuración para cada tipo de reporte
export const getReportConfigs = (userData, formData) => ({
  generar_resumen_retiros: {
    title: "Resumen de Retiros",
    requiredFields: ["fecha_inicio", "fecha_fin"],
    getPayload: () => ({
      operario_id: userData.id,
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
    }),
  },
  generar_resumen_inventario: {
    title: "Resumen de Inventario",
    requiredFields: [],
    getPayload: () => ({
      operario_id: userData.id,
    }),
  },
  generar_stock_fecha: {
    title: "Stock en Fecha",
    requiredFields: ["fecha"],
    getPayload: () => ({
      fecha: formData.fecha,
      operario_id: userData.id,
    }),
  },
});

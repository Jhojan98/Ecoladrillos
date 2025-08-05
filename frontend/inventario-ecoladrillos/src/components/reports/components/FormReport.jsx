import React from "react";

export default function FormReport(props) {
  const {
    formData,
    reportMutation,
    reportConfigs,
    handleInputChange,
    handleSubmit,
  } = props;

  const currentConfig = reportConfigs[formData.tipo_reporte];

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
            <option value="generar_resumen_retiros">Resumen de Retiros</option>
            <option value="generar_resumen_inventario">
              Resumen de Inventario
            </option>
            <option value="generar_stock_fecha">Stock en Fecha</option>
          </select>
        </div>

        {/* Campos condicionales según el tipo de reporte */}
        {formData.tipo_reporte === "generar_resumen_retiros" && (
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
        )}

        {formData.tipo_reporte === "generar_stock_fecha" && (
          <div className="form-group">
            <label htmlFor="fecha">Fecha de Consulta:</label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formData.fecha}
              onChange={handleInputChange}
              required
            />
          </div>
        )}

        {formData.tipo_reporte === "generar_resumen_inventario" && (
          <div className="form-group">
            <p style={{ color: "#666", fontStyle: "italic" }}>
              Este reporte muestra el estado actual del inventario y no requiere
              fechas específicas.
            </p>
          </div>
        )}

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

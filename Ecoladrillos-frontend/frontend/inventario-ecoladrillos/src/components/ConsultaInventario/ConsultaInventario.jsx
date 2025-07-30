import React, { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import "./consultaInventario.scss";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Simulación de roles y datos
const userRole = "operario"; // Cambia a "admin" para probar vista admin
const inventario = {
  ecoladrillos: 1200,
  materiales: {
    Plastico: 80,
    Vidrio: 15,
    Organico: 5,
    Metal: 40,
    Carton: 60,
    Papel: 25,
    Tetrapak: 8,
  },
};
const movimientosMock = [
  { id: 1, fecha: "2025-07-29", tipo: "Entrada", cantidad: 200, material: "Plastico", responsable: "Juan", motivo: "Producción" },
  { id: 2, fecha: "2025-07-28", tipo: "Salida", cantidad: 100, material: "Ecoladrillo", responsable: "Ana", motivo: "Venta" },
  { id: 3, fecha: "2025-07-27", tipo: "Entrada", cantidad: 50, material: "Vidrio", responsable: "Luis", motivo: "Recepción" },
  { id: 4, fecha: "2025-07-26", tipo: "Entrada", cantidad: 30, material: "Carton", responsable: "Pedro", motivo: "Recepción" },
  { id: 5, fecha: "2025-07-25", tipo: "Salida", cantidad: 60, material: "Plastico", responsable: "Ana", motivo: "Donación" },
  { id: 6, fecha: "2025-07-24", tipo: "Entrada", cantidad: 20, material: "Papel", responsable: "Juan", motivo: "Producción" },
  { id: 7, fecha: "2025-07-23", tipo: "Salida", cantidad: 10, material: "Tetrapak", responsable: "Luis", motivo: "Venta" },
  { id: 8, fecha: "2025-07-22", tipo: "Entrada", cantidad: 15, material: "Metal", responsable: "Pedro", motivo: "Recepción" },
  { id: 9, fecha: "2025-07-21", tipo: "Salida", cantidad: 25, material: "Vidrio", responsable: "Ana", motivo: "Donación" },
  { id: 10, fecha: "2025-07-20", tipo: "Entrada", cantidad: 10, material: "Organico", responsable: "Juan", motivo: "Producción" },
];

const pieData = {
  labels: Object.keys(inventario.materiales),
  datasets: [
    {
      data: Object.values(inventario.materiales),
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8BC34A"],
    },
  ],
};

const barData = {
  labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
  datasets: [
    {
      label: "Producción",
      backgroundColor: "#4CAF50",
      data: [800, 900, 950, 1000, 1100],
    },
    {
      label: "Ventas",
      backgroundColor: "#2196F3",
      data: [600, 700, 850, 900, 950],
    },
  ],
};

export default function ConsultaInventario() {
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroMaterial, setFiltroMaterial] = useState("");
  const [filtroMotivo, setFiltroMotivo] = useState("");

  // Filtrado de movimientos
  const movimientos = movimientosMock.filter(mov => {
    return (
      (!filtroFecha || mov.fecha === filtroFecha) &&
      (!filtroMaterial || mov.material === filtroMaterial) &&
      (!filtroMotivo || mov.motivo === filtroMotivo)
    );
  });

  // Exportar CSV
  const exportCSV = () => {
    const rows = [
      ["ID", "Fecha", "Tipo", "Cantidad", "Material", "Responsable", "Motivo"],
      ...movimientos.map(m => [m.id, m.fecha, m.tipo, m.cantidad, m.material, m.responsable, m.motivo]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "movimientos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Alertas de stock crítico
  const stockCritico = Object.entries(inventario.materiales).filter(([mat, cant]) => cant < 10);

  return (
    <div className="consulta-inventario-container">
      <aside className="menu-lateral">
        <ul>
          <li><a href="#inventario">Inventario Actual</a></li>
          <li><a href="#historial">Historial de Movimientos</a></li>
        </ul>
      </aside>
      <main>
        <section id="inventario">
          <h2>Inventario Actual</h2>
          <table className="inventario-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Alerta</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ecoladrillos</td>
                <td>{inventario.ecoladrillos}</td>
                <td></td>
              </tr>
              {Object.entries(inventario.materiales).map(([mat, cant]) => (
                <tr key={mat}>
                  <td>{mat}</td>
                  <td>{cant} kg</td>
                  <td>{cant < 10 ? <span title="Stock crítico">🔴 Stock crítico</span> : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="graficos">
            <Bar data={barData} />
            <Pie data={pieData} />
          </div>
          {stockCritico.length > 0 && (
            <div className="alerta-stock">
              <strong>¡Alerta!</strong> Materiales con stock crítico: {stockCritico.map(([mat]) => mat).join(", ")}
            </div>
          )}
        </section>
        <section id="historial">
          <h2>Historial de Movimientos</h2>
          <div className="filtros">
            <input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />
            <select value={filtroMaterial} onChange={e => setFiltroMaterial(e.target.value)}>
              <option value="">Material</option>
              {Object.keys(inventario.materiales).map(mat => (
                <option key={mat} value={mat}>{mat}</option>
              ))}
              <option value="Ecoladrillo">Ecoladrillo</option>
            </select>
            <select value={filtroMotivo} onChange={e => setFiltroMotivo(e.target.value)}>
              <option value="">Motivo</option>
              <option value="Producción">Producción</option>
              <option value="Venta">Venta</option>
              <option value="Recepción">Recepción</option>
            </select>
            <button onClick={exportCSV}>Exportar CSV</button>
          </div>
          <table className="movimientos-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Material</th>
                <th>Responsable</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map(mov => (
                <tr key={mov.id}>
                  <td>{mov.id}</td>
                  <td>{mov.fecha}</td>
                  <td>{mov.tipo}</td>
                  <td>{mov.cantidad}</td>
                  <td>{mov.material}</td>
                  <td>{mov.responsable}</td>
                  <td>{mov.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

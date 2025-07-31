import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Card, Table } from "./DashboardUI";
import "./dashboard.scss";

// Registrar los componentes necesarios de Chart.js
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);
// Datos mock para las métricas
const mockData = {
  residuos: {
    tipos: [
      { tipo: "Plástico", kg: 1200 },
      { tipo: "Vidrio", kg: 800 },
      { tipo: "Orgánico", kg: 500 },
      { tipo: "Metal", kg: 300 },
    ],
    tasaAprovechables: 75,
    tiempoClasificacion: 2.5,
    lotesProblemas: 3,
  },
  produccion: {
    porDia: 150,
    porSemana: 900,
    porMes: 3800,
    kgPorUnidad: 0.8,
    tasaConversion: 65,
    tiempoProduccion: 1.2,
    defectos: 5,
  },
  inventario: {
    stockEcoladrillos: 1200,
    stockMateriales: 2500,
    capacidadUtilizada: 80,
    tiempoAlmacenamiento: 12,
    alertas: ["Stock mínimo ecoladrillos", "Stock máximo plástico"],
  },
  ventas: {
    b2b: 700,
    b2c: 500,
    ingresos: 12000,
    tasaCumplimiento: 92,
    clientesRecurrentes: 40,
    porcentajeRecurrentes: 25,
  },
  impacto: {
    kgReciclados: 2800,
    huellaCarbono: 900,
    porcentajeReutilizados: 78,
    metasCumplidas: ["Reducción 30% CO₂"],
  },
  eficiencia: {
    tiempoCiclo: 3.5,
    usoMaquinaria: 85,
    incidencias: 2,
  },
  software: {
    usuariosActivos: { operarios: 12, admin: 3 },
    registrosDiarios: 45,
    tiempoRespuesta: 1.2,
    disponibilidad: 99.8,
  },
};

// Ejemplo de visualización: Producción mensual vs. residuos reciclados
const barData = {
  labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
  datasets: [
    {
      label: "Producción Ecoladrillos",
      backgroundColor: "#4CAF50",
      data: [800, 900, 950, 1000, 1100],
    },
    {
      label: "Residuos Reciclados",
      backgroundColor: "#2196F3",
      data: [1200, 1300, 1250, 1400, 1500],
    },
  ],
};

// Mapa de calor (simulado con Doughnut)
const heatData = {
  labels: ["Plástico", "Vidrio", "Orgánico", "Metal"],
  datasets: [
    {
      data: [1200, 800, 500, 300],
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8BC34A"],
    },
  ],
};

const chartOptions = {
  responsive: true,
  // maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
};

const doughnutOptions = {
  responsive: true,
  // maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right",
    },
  },
};

export default function Dashboard() {
  return (
    <div className="dashboard-container w-100 flex flex-column">
      <h2>Dashboard Ecoladrillos</h2>
      <div className="dashboard-cards flex">
        <Card
          title="Huella de carbono ahorrada"
          value={mockData.impacto.huellaCarbono + " kg CO₂"}
        />
        <Card
          title="Pedidos pendientes"
          value={
            mockData.ventas.b2b +
            mockData.ventas.b2c -
            mockData.produccion.porMes
          }
        />
        <Card
          title="Stock crítico"
          value={
            mockData.inventario.stockEcoladrillos < 500 ? "¡Alerta!" : "OK"
          }
        />
      </div>
      <div className="dashboard-charts w-100 flex justify-center">
        <div className="dashboard-bar flex justify-center">
          <Bar className="bar" data={barData} />
        </div>
        <div className="dashboard-doughnut flex justify-center">
          <Doughnut
            className="doughnut"
            data={heatData}
          />
        </div>
      </div>
      <div className="dashboard-table">
        <Table
          data={[
            {
              tipo: "Entrada",
              material: "Plástico",
              cantidad: 200,
              fecha: "2025-07-29",
            },
            {
              tipo: "Salida",
              material: "Ecoladrillo",
              cantidad: 100,
              fecha: "2025-07-28",
            },
            {
              tipo: "Entrada",
              material: "Vidrio",
              cantidad: 150,
              fecha: "2025-07-27",
            },
          ]}
        />
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Bar, Doughnut, Line, PolarArea } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  Filler,
} from "chart.js";
import { Card, Table, StatCard, MetricGrid, AlertCard } from "./DashboardUI";
import {
  useGetEcoladrillos,
  useGetRegistersEcobricks,
  useGetRetirosEcobricks,
} from "@db/queries/Ecoladrillos";
import {
  useGetMaterials,
  useGetRegistersMaterials,
} from "@db/queries/Material";
import "./dashboard.scss";

// Registrar los componentes necesarios de Chart.js
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right",
    },
  },
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    ecoladrillos: null,
    materiales: null,
    registrosEco: null,
    retirosEco: null,
    registrosMat: null,
  });

  // Hooks para obtener datos
  const { fetchData: fetchEcoladrillos } = useGetEcoladrillos();
  const { fetchData: fetchMateriales } = useGetMaterials();
  const { fetchData: fetchRegistrosEco } = useGetRegistersEcobricks();
  const { fetchData: fetchRetirosEco } = useGetRetirosEcobricks();
  const { fetchData: fetchRegistrosMat } = useGetRegistersMaterials();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [
          ecoladrillos,
          materiales,
          registrosEco,
          retirosEco,
          registrosMat,
        ] = await Promise.all([
          fetchEcoladrillos(),
          fetchMateriales(),
          fetchRegistrosEco(),
          fetchRetirosEco(),
          fetchRegistrosMat(),
        ]);

        setDashboardData({
          ecoladrillos,
          materiales,
          registrosEco,
          retirosEco,
          registrosMat,
        });
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      }
    };

    loadDashboardData();
  }, []);

  // Función alternativa más flexible para obtener datos de hoy
  const getTodayDataFlexible = (data, dateField) => {
    if (!data?.results) return [];

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    return data.results.filter((item) => {
      const itemDate = item[dateField];
      if (!itemDate) return false;
      
      // Comparación directa de strings para evitar problemas de zona horaria
      return itemDate === todayStr;
    });
  };

  // Función para agrupar datos por día del mes actual
  const groupByMonthDay = (data, dateField) => {
    if (!data?.results) return { labels: [], data: [] };
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Crear un objeto para contar registros por día
    const daysCounts = {};
    
    data.results.forEach((item) => {
      // Crear fecha local para evitar problemas de zona horaria
      const dateStr = item[dateField];
      if (!dateStr) return;
      
      // Parsear fecha de forma local (YYYY-MM-DD)
      const [year, month, day] = dateStr.split('-').map(Number);
      const itemDate = new Date(year, month - 1, day); // month es 0-indexed
    
      // Solo considerar datos del mes actual
      if (itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth) {
        const dayNum = itemDate.getDate();
        daysCounts[dayNum] = (daysCounts[dayNum] || 0) + 1;
      }
    });
    
    // Convertir a arrays ordenados
    const sortedDays = Object.keys(daysCounts).sort((a, b) => Number(a) - Number(b));
    const labels = sortedDays.map(day => `${day}`);
    const counts = sortedDays.map(day => daysCounts[day]);
    
    return { labels, data: counts };
  };

  // Calcular métricas principales
  const calculateMetrics = () => {
    if (!dashboardData.ecoladrillos || !dashboardData.materiales) {
      return {
        totalStock: 0,
        stockEcoladrillos: 0,
        stockMateriales: 0,
        tiposEcoladrillos: 0,
        tiposMateriales: 0,
        alertas: [],
      };
    }

    const stockEcoladrillos = dashboardData.ecoladrillos.stock_total || 0;
    const stockMateriales = dashboardData.materiales.stock_total || 0;
    const tiposEcoladrillos =
      dashboardData.ecoladrillos.total_tipos_ecoladrillos || 0;
    const tiposMateriales =
      dashboardData.materiales.total_tipos_materiales || 0;

    const alertas = [];
    if (dashboardData.ecoladrillos.tipos_con_stock_bajo > 0) {
      alertas.push(
        `${dashboardData.ecoladrillos.tipos_con_stock_bajo} tipos de ecoladrillos con stock bajo`
      );
    }
    if (dashboardData.ecoladrillos.tipos_sin_stock > 0) {
      alertas.push(
        `${dashboardData.ecoladrillos.tipos_sin_stock} tipos de ecoladrillos sin stock`
      );
    }
    if (dashboardData.materiales.tipos_con_stock_bajo > 0) {
      alertas.push(
        `${dashboardData.materiales.tipos_con_stock_bajo} tipos de materiales con stock bajo`
      );
    }
    if (dashboardData.materiales.tipos_sin_stock > 0) {
      alertas.push(
        `${dashboardData.materiales.tipos_sin_stock} tipos de materiales sin stock`
      );
    }

    return {
      totalStock: stockEcoladrillos + stockMateriales,
      stockEcoladrillos,
      stockMateriales,
      tiposEcoladrillos,
      tiposMateriales,
      alertas,
    };
  };

  // Preparar datos para gráficas
  const prepareChartData = () => {
    // Gráfica de stock por tipo de ecoladrillo
    const ecobricksStockData = {
      labels:
        dashboardData.ecoladrillos?.ecoladrillos?.map((eco) => eco.nombre) ||
        [],
      datasets: [
        {
          label: "Stock Actual",
          data:
            dashboardData.ecoladrillos?.ecoladrillos?.map(
              (eco) => eco.cantidad
            ) || [],
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#8BC34A",
            "#FF9F40",
          ],
          borderColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8BC34A", "#FF9F40"],
          borderWidth: 2,
        },
      ],
    };

    // Gráfica de distribución por tamaños de ecoladrillos
    const ecobricksSizeData = {
      labels:
        dashboardData.ecoladrillos?.ecoladrillos?.map(
          (eco) => eco.size_display
        ) || [],
      datasets: [
        {
          data:
            dashboardData.ecoladrillos?.ecoladrillos?.map(
              (eco) => eco.cantidad
            ) || [],
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#8BC34A",
            "#FF9F40",
          ],
        },
      ],
    };

    // Gráfica de materiales por tipo
    const materialsTypeData = {
      labels:
        dashboardData.materiales?.materiales?.map((mat) => mat.tipo) || [],
      datasets: [
        {
          data:
            dashboardData.materiales?.materiales?.map(
              (mat) => mat.cantidad_disponible
            ) || [],
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#8BC34A",
            "#FF9F40",
            "#9966FF",
          ],
        },
      ],
    };

    // Gráfica de actividad mensual REAL (registros + retiros)
    const registrosMonthly = groupByMonthDay(dashboardData.registrosEco, "fecha");
    const retirosMonthly = groupByMonthDay(dashboardData.retirosEco, "fecha");
    const materialesMonthly = groupByMonthDay(dashboardData.registrosMat, "fecha");
    
    // Combinar todas las fechas únicas
    const allDays = new Set([
      ...registrosMonthly.labels,
      ...retirosMonthly.labels,
      ...materialesMonthly.labels
    ]);
    
    const sortedDays = Array.from(allDays).sort((a, b) => Number(a) - Number(b));
    
    // Crear datos alineados para cada dataset
    const createAlignedData = (monthlyData) => {
      return sortedDays.map(day => {
        const index = monthlyData.labels.indexOf(day);
        return index !== -1 ? monthlyData.data[index] : 0;
      });
    };

    const monthlyActivityData = {
      labels: sortedDays.map(day => `${day} ${new Date().toLocaleDateString('es-ES', { month: 'short' })}`),
      datasets: [
        {
          label: "Registros Ecoladrillos",
          data: createAlignedData(registrosMonthly),
          borderColor: "#36A2EB",
          backgroundColor: "rgba(54, 162, 235, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Retiros Ecoladrillos",
          data: createAlignedData(retirosMonthly),
          borderColor: "#FF6384",
          backgroundColor: "rgba(255, 99, 132, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Registros Materiales",
          data: createAlignedData(materialesMonthly),
          borderColor: "#FFCE56",
          backgroundColor: "rgba(255, 206, 86, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };

    // Gráfica polar de distribución de materiales
    const materialDistributionData = {
      labels:
        dashboardData.materiales?.materiales?.map((mat) => mat.nombre) || [],
      datasets: [
        {
          data:
            dashboardData.materiales?.materiales?.map(
              (mat) => mat.cantidad_disponible
            ) || [],
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 205, 86, 0.6)",
            "rgba(139, 195, 74, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 205, 86, 1)",
            "rgba(139, 195, 74, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };

    return {
      ecobricksStockData,
      ecobricksSizeData,
      materialsTypeData,
      monthlyActivityData,
      materialDistributionData,
    };
  };

  const metrics = calculateMetrics();
  const chartData = prepareChartData();

  // Preparar datos para la tabla de actividad reciente
  const recentActivity = () => {
    const activities = [];

    // Agregar registros recientes de ecoladrillos
    if (dashboardData.registrosEco?.results) {
      dashboardData.registrosEco.results.slice(0, 10).forEach((registro) => {
        activities.push({
          tipo: "Entrada",
          item: registro.ecoladrillo_nombre,
          cantidad: registro.cantidad,
          fecha: registro.fecha,
          categoria: "Ecoladrillo",
        });
      });
    }

    // Agregar retiros recientes
    if (dashboardData.retirosEco?.results) {
      dashboardData.retirosEco.results.slice(0, 10).forEach((retiro) => {
        activities.push({
          tipo: "Salida",
          item: retiro.ecoladrillo_nombre,
          cantidad: retiro.cantidad,
          fecha: retiro.fecha,
          categoria: "Ecoladrillo",
          motivo: retiro.motivo,
        });
      });
    }

    // Agregar registros de materiales
    if (dashboardData.registrosMat?.results) {
      dashboardData.registrosMat.results.slice(0, 10).forEach((registro) => {
        activities.push({
          tipo: "Entrada",
          item: registro.material_nombre,
          cantidad: registro.cantidad,
          fecha: registro.fecha,
          categoria: "Material",
          origen: registro.origen,
        });
      });
    }

    // Ordenar por fecha más reciente
    return activities.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  };

  const tableColumns = [
    { header: "Tipo", accessor: "tipo" },
    { header: "Item", accessor: "item" },
    { header: "Cantidad", accessor: "cantidad" },
    { header: "Categoría", accessor: "categoria" },
    { header: "Fecha", accessor: "fecha" },
    {
      header: "Detalle",
      render: (row) => row.motivo || row.origen || "-",
    },
  ];

  return (
    <div className="dashboard-container w-100 flex flex-column">
      <h2>Dashboard Inventario Ecoladrillos</h2>

      {/* Resumen General */}
      <div className="dashboard-cards flex">
        <Card
          title="Stock Total"
          value={metrics.totalStock}
          subtitle="unidades en inventario"
          icon="📦"
          color="primary"
          trend={{ type: "up", value: "5%" }}
        />
        <Card
          title="Ecoladrillos"
          value={metrics.stockEcoladrillos}
          subtitle={`${metrics.tiposEcoladrillos} tipos disponibles`}
          icon="🧱"
          color="success"
        />
        <Card
          title="Materiales"
          value={metrics.stockMateriales}
          subtitle={`${metrics.tiposMateriales} tipos disponibles`}
          icon="🔧"
          color="info"
        />
        <Card
          title="Estado del Sistema"
          value={metrics.alertas.length === 0 ? "✅ OK" : "⚠️ Alertas"}
          subtitle={
            metrics.alertas.length === 0
              ? "Todo funcionando bien"
              : `${metrics.alertas.length} alertas activas`
          }
          color={metrics.alertas.length === 0 ? "success" : "warning"}
        />
      </div>

      {/* Alertas del sistema */}
      {metrics.alertas.length > 0 && (
        <AlertCard alerts={metrics.alertas} type="warning" />
      )}

      {/* SECCIÓN ECOLADRILLOS */}
      <div style={{ margin: "1rem 0 1rem 0" }}>
        <h3
          style={{
            color: "#2c3e50",
            borderBottom: "3px solid #007bff",
            paddingBottom: "0.5rem",
            marginBottom: "2rem",
          }}
        >
          🧱 Análisis de Ecoladrillos
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <StatCard
            title="Stock por Tipo"
            color="primary"
            stats={
              dashboardData.ecoladrillos?.ecoladrillos?.map((eco) => ({
                label: eco.nombre,
                value: `${eco.cantidad} (${eco.size_display})`,
              })) || []
            }
          />

          <StatCard
            title="Requerimientos de Material"
            color="info"
            stats={
              dashboardData.ecoladrillos?.ecoladrillos?.map((eco) => ({
                label: eco.material_principal_nombre,
                value: `${eco.cantidad_material_requerida} unidades`,
              })) || []
            }
          />
        </div>

        <div className="dashboard-charts">
          <div className="chart-container dashboard-bar">
            <h4>Stock de Ecoladrillos por Tipo</h4>
            <div style={{ height: "300px" }}>
              <Bar data={chartData.ecobricksStockData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-container dashboard-doughnut">
            <h4>Distribución por Tamaños</h4>
            <div style={{ height: "300px" }}>
              <Doughnut
                data={chartData.ecobricksSizeData}
                options={doughnutOptions}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN MATERIALES */}
      <div style={{ margin: "1rem 0 1rem 0" }}>
        <h3
          style={{
            color: "#2c3e50",
            borderBottom: "3px solid #28a745",
            paddingBottom: "0.5rem",
            marginBottom: "2rem",
          }}
        >
          🔧 Inventario de Materiales
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <StatCard
            title="Stock por Material"
            color="success"
            stats={
              dashboardData.materiales?.materiales?.map((mat) => ({
                label: mat.nombre,
                value: `${mat.cantidad_disponible} ${mat.unidad_medida}`,
              })) || []
            }
          />

          <StatCard
            title="Tipos de Material"
            color="success"
            stats={
              dashboardData.materiales?.materiales?.map((mat) => ({
                label: mat.tipo.replace("_", " "),
                value: mat.nombre,
              })) || []
            }
          />
        </div>

        <div className="dashboard-charts">
          <div className="chart-container dashboard-doughnut">
            <h4>Distribución de Materiales por Tipo</h4>
            <div style={{ height: "300px" }}>
              <Doughnut
                data={chartData.materialsTypeData}
                options={doughnutOptions}
              />
            </div>
          </div>

          <div className="chart-container dashboard-polar">
            <h4>Distribución Polar de Materiales</h4>
            <div style={{ height: "300px" }}>
              <PolarArea
                data={chartData.materialDistributionData}
                options={chartOptions}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN REGISTROS Y ACTIVIDAD */}
      <div style={{ margin: "1rem 0 1rem 0" }}>
        <h3
          style={{
            color: "#2c3e50",
            borderBottom: "3px solid #ffc107",
            paddingBottom: "0.5rem",
            marginBottom: "2rem",
          }}
        >
          📊 Registros y Actividad
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <StatCard
            title="Resumen de Actividad"
            color="warning"
            stats={[
              {
                label: "Total Registros Ecoladrillos",
                value: dashboardData.registrosEco?.count || 0,
              },
              {
                label: "Total Retiros Ecoladrillos",
                value: dashboardData.retirosEco?.count || 0,
              },
              {
                label: "Total Registros Materiales",
                value: dashboardData.registrosMat?.count || 0,
              },
            ]}
          />

          <MetricGrid
            title="Actividad de Hoy"
            metrics={[
              {
                label: "Registros Ecoladrillos",
                value: getTodayDataFlexible(dashboardData.registrosEco, "fecha")
                  .length,
                icon: "📈",
                color: "#28a745",
              },
              {
                label: "Retiros Ecoladrillos",
                value: getTodayDataFlexible(dashboardData.retirosEco, "fecha")
                  .length,
                icon: "📉",
                color: "#dc3545",
              },
              {
                label: "Materiales Ingresados",
                value: getTodayDataFlexible(dashboardData.registrosMat, "fecha")
                  .length,
                icon: "🔄",
                color: "#17a2b8",
              },
            ]}
          />
        </div>

        <div className="dashboard-charts">
          <div
            className="chart-container dashboard-line"
            style={{ gridColumn: "1 / -1" }}
          >
            <h4>Actividad Mensual Real - {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h4>
            <div style={{ height: "350px" }}>
              <Line
                data={chartData.monthlyActivityData}
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        {/* Tabla de actividad reciente */}
        <Table
          title="Actividad Reciente del Inventario"
          data={recentActivity()}
          columns={tableColumns}
        />
      </div>
    </div>
  );
}

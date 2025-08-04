import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { motion } from "framer-motion";
import "./homePage.scss";

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  // Dummy data for cards
  const stock = 1200;
  const outOfStock = 300;
  const ecoImpact = 450;

  // Chart.js data
  const pieData = {
    labels: ["Stock", "Agotados"],
    datasets: [
      {
        data: [stock, outOfStock],
        backgroundColor: ["#4CAF50", "#E57373"],
        borderWidth: 0,
      },
    ],
  };

  // Dummy predictive search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.length > 1) {
      setSuggestions(
        [
          "SKU123 - Ladrillo Verde",
          "Lote 45 - Bodega Central",
          "Ubicación: Patio 2",
        ].filter((s) => s.toLowerCase().includes(value.toLowerCase()))
      );
    } else {
      setSuggestions([]);
    }
  };

  // Dark mode toggle
  const toggleDarkMode = () => setDarkMode((d) => !d);

  return (
    <div className={`home-page${darkMode ? " dark" : ""} w-100`}>
      {/* Dark mode toggle */}
      <button className="dark-toggle" onClick={toggleDarkMode}>
        {darkMode ? "☀️" : "🌙"}
      </button>

      {/* Hero Section */}
      <section className="hero-section min-height-page">
        <div className="hero-bg">
          {/* Video de fondo */}
          <video
            src="/videos/Video3.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="video-bg"
          />
        </div>

        <div className="hero-content">
          <div className="hero-content-title">
            <h1>Inventario EcoGlobant</h1>
          </div>

          {/* Cards Section */}
          <section className="cards-section">
            <motion.div
              className="card"
              whileHover={{ y: -5, boxShadow: "0 8px 16px rgba(0,0,0,0.15)" }}
              onClick={() => navigate("/inventory")}
            >
              <span className="icon">📦</span>
              <h3>Inventario</h3>
              <p>Consulta y gestiona tu inventario ecológico.</p>
            </motion.div>
            <motion.div
              className="card"
              whileHover={{ y: -5, boxShadow: "0 8px 16px rgba(0,0,0,0.15)" }}
              onClick={() => navigate("/reports")}
            >
              <span className="icon">📊</span>
              <h3>Reportes</h3>
              <p>Genera Reportes del Inventario</p>
            </motion.div>
            <motion.div
              className="card escaner-card"
              whileHover={{ y: -5, boxShadow: "0 8px 16px rgba(0,0,0,0.15)" }}
              onMouseEnter={() => setFabOpen("escaner")}
              onMouseLeave={() => setFabOpen(false)}
            >
              <span className="icon qr">
                <span className="qr-anim">🔍</span>
              </span>
              <h3>Registrar</h3>
              <p>Registrar Movimientos</p>
              {fabOpen === "escaner" && (
                <div className="escaner-menu">
                  <button onClick={() => navigate("/register/ecobricks")}>
                    Registrar Entrada
                  </button>
                  <button onClick={() => navigate("/register/withdraw")}>
                    Registrar Salida
                  </button>
                </div>
              )}
            </motion.div>
            <motion.div
              className="card"
              whileHover={{ y: -5, boxShadow: "0 8px 16px rgba(0,0,0,0.15)" }}
              onClick={() => navigate("/register/material")}
            >
              <span className="icon">🌱</span>
              <h3>Agregar Producto</h3>
              <p>Agrega Productos al Inventario</p>
            </motion.div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

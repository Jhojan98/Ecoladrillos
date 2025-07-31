import React, { useState } from "react";
import "./consultaInventario.scss";

// Datos simulados (mock)
const mockEcoladrillos = [
  { id: "ECO001", fecha_registro: "2025-07-30", cantidad: 500 },
  { id: "ECO002", fecha_registro: "2025-07-29", cantidad: 320 },
];

const mockMateriales = [
  { id: "MAT001", nombre: "Arena", tipo: "Materia Prima", cantidad_disponible: 200, unidad_medida: "kg" },
  { id: "MAT002", nombre: "Cemento", tipo: "Materia Prima", cantidad_disponible: 150, unidad_medida: "kg" },
  { id: "MAT003", nombre: "Botellas PET", tipo: "Reciclable", cantidad_disponible: 1000, unidad_medida: "unidades" },
  { id: "MAT004", nombre: "Agua", tipo: "Líquido", cantidad_disponible: 300, unidad_medida: "litros" },
];

const categorias = ["Todos", "Ecoladrillos", "Materiales"];

export default function ConsultaInventario() {
  const [categoria, setCategoria] = useState("Todos");
  const [modal, setModal] = useState(null);

  // Filtrado
  let items = [];
  if (categoria === "Todos") {
    items = [...mockEcoladrillos, ...mockMateriales];
  } else if (categoria === "Ecoladrillos") {
    items = mockEcoladrillos;
  } else {
    items = mockMateriales;
  }

  // Totales
  const totalEcoladrillos = mockEcoladrillos.reduce((acc, e) => acc + e.cantidad, 0);
  const totalMateriales = mockMateriales.reduce((acc, m) => acc + m.cantidad_disponible, 0);

  return (
    <div className="consulta-inventario">
      {/* Header */}
      <header className="header">
        <h1>📦 Inventario General</h1>
        <div className="select-wrapper">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {categorias.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Grid de inventario */}
      <div className="grid">
        {items.map((item) => (
          <div className="card" key={item.id} onClick={() => setModal(item)}>
            <h3>{item.nombre || "Ecoladrillo"}</h3>
            <p className="id">ID: {item.id}</p>
            {item.fecha_registro && <p>📅 {item.fecha_registro}</p>}
            {item.tipo && <p>🏷 {item.tipo}</p>}
            <p className="cantidad">
              {item.cantidad ?? item.cantidad_disponible}{" "}
              {item.unidad_medida || "unidades"}
            </p>
          </div>
        ))}
      </div>

      {/* Barra inferior */}
      <div className="footer-bar">
        <span>
          Total Ecoladrillos: {totalEcoladrillos} | Total Materiales: {totalMateriales}
        </span>
      </div>

      {/* Modal detalle */}
      {modal && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setModal(null)}>×</button>
            <h2>Detalles de {modal.nombre || "Ecoladrillo"}</h2>
            <div className="detalle">
              <p><strong>ID:</strong> {modal.id}</p>
              {modal.fecha_registro && <p><strong>Fecha Registro:</strong> {modal.fecha_registro}</p>}
              {modal.tipo && <p><strong>Tipo:</strong> {modal.tipo}</p>}
              <p><strong>Cantidad:</strong> {modal.cantidad ?? modal.cantidad_disponible} {modal.unidad_medida || "unidades"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

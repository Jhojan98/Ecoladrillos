import React, { useState } from "react";
import "./registroEcoladrillos.scss";

// Simulación de roles y stock
const userRole = "operario"; // Cambia a "admin" para probar vista admin
const stockMateriales = {
  Plastico: 100,
  Vidrio: 50,
  Organico: 30,
};

const materialesList = Object.keys(stockMateriales);

export default function RegistroEcoladrillos() {
  const [form, setForm] = useState({
    cantidad: "",
    fecha: new Date().toISOString().slice(0, 10),
    materiales: {},
    responsable: "UsuarioEjemplo",
  });
  const [error, setError] = useState("");
  const [registros, setRegistros] = useState([]);

  // Validación de materiales
  const validarMateriales = () => {
    for (const mat of Object.keys(form.materiales)) {
      if (form.materiales[mat] > stockMateriales[mat]) {
        return `Faltan ${form.materiales[mat] - stockMateriales[mat]} kg de ${mat}`;
      }
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.cantidad || form.cantidad <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }
    const matError = validarMateriales();
    if (matError) {
      setError(matError);
      return;
    }
    setError("");
    setRegistros([
      ...registros,
      { ...form, id: registros.length + 1 },
    ]);
  };

  return (
    <div className="registro-ecoladrillos-container">
      <h2>Registro de Ecoladrillos</h2>
      <form onSubmit={handleSubmit} className="registro-form">
        <label>
          Cantidad producida:
          <input
            type="number"
            min="1"
            value={form.cantidad}
            onChange={e => setForm({ ...form, cantidad: e.target.value })}
            required
          />
        </label>
        <label>
          Fecha:
          <input
            type="date"
            value={form.fecha}
            onChange={e => setForm({ ...form, fecha: e.target.value })}
            required
          />
        </label>
        <div>
          <span>Materiales utilizados:</span>
          {materialesList.map(mat => (
            <div key={mat}>
              <label>{mat} (Stock: {stockMateriales[mat]} kg):</label>
              <input
                type="number"
                min="0"
                value={form.materiales[mat] || ""}
                onChange={e => setForm({
                  ...form,
                  materiales: {
                    ...form.materiales,
                    [mat]: Number(e.target.value)
                  }
                })}
              />
            </div>
          ))}
        </div>
        <label>
          Responsable:
          <input type="text" value={form.responsable} disabled />
        </label>
        {error && <div className="error-msg">{error}</div>}
        <button type="submit">Registrar</button>
      </form>
      <h3>Registros recientes</h3>
      <table className="registros-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Cantidad</th>
            <th>Materiales usados</th>
            <th>Responsable</th>
          </tr>
        </thead>
        <tbody>
          {registros.map(reg => (
            <tr key={reg.id}>
              <td>{reg.id}</td>
              <td>{reg.fecha}</td>
              <td>{reg.cantidad}</td>
              <td>{Object.entries(reg.materiales).map(([mat, cant]) => `${mat}: ${cant}kg`).join(", ")}</td>
              <td>{reg.responsable}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

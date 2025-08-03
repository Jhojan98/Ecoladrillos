import React, { useState } from "react";
import "./registroEcoladrillos.scss";

// Simulación de stock y roles
const userRole = "operario"; // Cambia a "admin" para probar vista admin
const stockEcoladrillos = 1200;

export default function RegistroSalidaEcoladrillos() {
  const [form, setForm] = useState({
    cantidad: "",
    fecha: new Date().toISOString().slice(0, 10),
    motivo: "Venta",
    destinatario: "",
    responsable: "UsuarioEjemplo",
  });
  const [error, setError] = useState("");
  const [registros, setRegistros] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.cantidad || form.cantidad <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }
    if (form.cantidad > stockEcoladrillos) {
      setError(`No hay suficiente stock. Stock actual: ${stockEcoladrillos}`);
      return;
    }
    if (!form.destinatario) {
      setError("Debes ingresar un destinatario");
      return;
    }
    setError("");
    setRegistros([
      ...registros,
      { ...form, id: registros.length + 1 },
    ]);
  };

  return (
    <div className="registro-ecoladrillos-container w-100">
      <h2>Registrar Salida de Ecoladrillos</h2>
      <form onSubmit={handleSubmit} className="registro-form">
        <label>
          Cantidad a salir:
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
        <label>
          Motivo:
          <select
            value={form.motivo}
            onChange={e => setForm({ ...form, motivo: e.target.value })}
            required
          >
            <option value="Venta">Venta</option>
            <option value="Donación">Donación</option>
            <option value="Uso interno">Uso interno</option>
          </select>
        </label>
        <label>
          Destinatario:
          <input
            type="text"
            value={form.destinatario}
            onChange={e => setForm({ ...form, destinatario: e.target.value })}
            required
          />
        </label>
        <label>
          Responsable:
          <input type="text" value={form.responsable} disabled />
        </label>
        {error && <div className="error-msg">{error}</div>}
        <button type="submit">Registrar salida</button>
      </form>
      <h3>Salidas recientes</h3>
      <table className="registros-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Cantidad</th>
            <th>Motivo</th>
            <th>Destinatario</th>
            <th>Responsable</th>
          </tr>
        </thead>
        <tbody>
          {registros.map(reg => (
            <tr key={reg.id}>
              <td>{reg.id}</td>
              <td>{reg.fecha}</td>
              <td>{reg.cantidad}</td>
              <td>{reg.motivo}</td>
              <td>{reg.destinatario}</td>
              <td>{reg.responsable}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

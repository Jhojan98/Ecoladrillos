import React from "react";

export function Card({ title, value }) {
  return (
    <div className="dashboard-card">
      <h4>{title}</h4>
      <p>{value}</p>
    </div>
  );
}

export function Table({ data }) {
  return (
    <table className="dashboard-table">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Material</th>
          <th>Cantidad</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            <td>{row.tipo}</td>
            <td>{row.material}</td>
            <td>{row.cantidad}</td>
            <td>{row.fecha}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

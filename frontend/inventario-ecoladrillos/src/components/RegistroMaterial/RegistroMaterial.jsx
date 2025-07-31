import React, { useState } from 'react';
import './registroMaterial.scss';

const RegistroMaterial = () => {
  const [materiales, setMateriales] = useState([]);
  const [form, setForm] = useState({
    id: '',
    nombre: '',
    tipo: '',
    cantidad: '',
    unidad: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMateriales([...materiales, form]);
    setForm({ id: '', nombre: '', tipo: '', cantidad: '', unidad: '' });
  };

  return (
    <div className="registro-material-page">
      <h2>Registro de Materiales</h2>
      <form className="registro-form" onSubmit={handleSubmit}>
        <input name="id" value={form.id} onChange={handleChange} placeholder="ID" required />
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
        <input name="tipo" value={form.tipo} onChange={handleChange} placeholder="Tipo" required />
        <input name="cantidad" value={form.cantidad} onChange={handleChange} placeholder="Cantidad" type="number" required />
        <input name="unidad" value={form.unidad} onChange={handleChange} placeholder="Unidad de medida" required />
        <button type="submit">Agregar Material</button>
      </form>
      <div className="materiales-list">
        <h3>Materiales Registrados</h3>
        <ul>
          {materiales.map((mat, i) => (
            <li key={i}>
              <b>{mat.nombre}</b> ({mat.tipo}) - {mat.cantidad} {mat.unidad} [ID: {mat.id}]
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RegistroMaterial;

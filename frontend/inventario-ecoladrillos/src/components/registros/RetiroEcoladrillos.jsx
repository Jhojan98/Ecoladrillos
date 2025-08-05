import { useState, useEffect } from "react";
// hooks
import { useNotifier } from "@hooks/useNotifier";
// queries
import { useGetEcoladrillos } from "@db/queries/Ecoladrillos";
import {
  useGetRetirosEcobricks,
  useRetiroEcoladrillosMutation,
} from "@db/queries/Ecoladrillos";

export default function RetiroEcoladrillos() {
  const notify = useNotifier();

  // --- OBTENER ECOLADRILLOS ---
  const [ecoladrillos, setEcoladrillos] = useState([]);

  const { fetchData: getEcoladrillos } = useGetEcoladrillos();

  const fetchEcobricks = async () => {
    const ecoladrillos = await getEcoladrillos();

    if (ecoladrillos.fetchErrorMsg) {
      notify.error(ecoladrillos.fetchErrorMsg);
      return;
    }

    setEcoladrillos(ecoladrillos.results || []);
  };

  // ------ OBTENER RETIROS ECOLADRILLOS ------
  const [retiros, setRetiros] = useState([]);

  const { fetchData: getRetiros } = useGetRetirosEcobricks();

  const fetchRetiros = async () => {
    const response = await getRetiros();

    if (response.fetchErrorMsg) {
      notify.error(response.fetchErrorMsg);
      return;
    }

    setRetiros(response.results || []);
  };

  useEffect(() => {
    fetchRetiros();
    fetchEcobricks();
  }, []);

  // ------ FORMULARIO DE RETIRO ------
  const [retiroEcoForm, setRetiroEcoForm] = useState({
    idEcoladrillo: 0,
    cantidad: 0,
    fecha: "",
    motivo: "Venta",
  });
  const [error, setError] = useState("");

  // ------ RETIRO DE ECOLADRILLOS ------
  const retiroEcobricksMutate = useRetiroEcoladrillosMutation();

  const onSubmitRetiro = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!retiroEcoForm.idEcoladrillo) {
      newErrors.idEcoladrillo = "Selecciona un ecoladrillo válido";
    }
    if (retiroEcoForm.cantidad <= 0) {
      newErrors.cantidad = "La cantidad debe ser mayor a 0";
    }
    if (!retiroEcoForm.fecha) {
      newErrors.fecha = "Selecciona una fecha válida";
    }
    if (!retiroEcoForm.motivo) {
      newErrors.motivo = "Selecciona un motivo válido";
    }

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }
    setError("");

    // Enviar petición
    const newRetiro = {
      fecha: retiroEcoForm.fecha,
      ecoladrillo: retiroEcoForm.idEcoladrillo,
      cantidad: retiroEcoForm.cantidad,
      motivo: retiroEcoForm.motivo,
    };

    const response = await retiroEcobricksMutate.post(newRetiro);
    if (response.errorMutationMsg) {
      notify.error(response.errorMutationMsg);
      return;
    }
    notify.success("Retiro registrado exitosamente");
    
    // Limpiar formulario
    setRetiroEcoForm({
      idEcoladrillo: 0,
      cantidad: 0,
      fecha: "",
      motivo: "Venta",
    });
    
    fetchRetiros();
  };

  return (
    <div className="registro-container w-100">
      <h1>Retiro de Ecoladrillos</h1>
      <form onSubmit={onSubmitRetiro} className="registro-form">
        <label>
          Tipo de Ecoladrillo:
          <select
            name="id_ecoladrillo"
            value={retiroEcoForm.idEcoladrillo}
            onChange={(e) =>
              setRetiroEcoForm({
                ...retiroEcoForm,
                idEcoladrillo: parseInt(e.target.value),
              })
            }
          >
            <option value="">Selecciona un ecoladrillo</option>
            {ecoladrillos.map((ecoladrillo) => (
              <option
                key={ecoladrillo.id_ecoladrillo}
                value={ecoladrillo.id_ecoladrillo}
              >
                {ecoladrillo.nombre}
              </option>
            ))}
          </select>
          {error.idEcoladrillo && (
            <span className="error-msg">{error.idEcoladrillo}</span>
          )}
        </label>
        <label>
          Cantidad a retirar:
          <input
            type="number"
            value={retiroEcoForm.cantidad}
            onChange={(e) =>
              setRetiroEcoForm({
                ...retiroEcoForm,
                cantidad: parseInt(e.target.value),
              })
            }
          />
          {error.cantidad && (
            <span className="error-msg">{error.cantidad}</span>
          )}
        </label>
        <label>
          Fecha:
          <input
            type="date"
            value={retiroEcoForm.fecha}
            onChange={(e) =>
              setRetiroEcoForm({ ...retiroEcoForm, fecha: e.target.value })
            }
          />
          {error.fecha && <span className="error-msg">{error.fecha}</span>}
        </label>
        <label>
          Motivo:
          <select
            value={retiroEcoForm.motivo}
            onChange={(e) =>
              setRetiroEcoForm({ ...retiroEcoForm, motivo: e.target.value })
            }
          >
            <option value="Venta">Venta</option>
            <option value="Donación">Donación</option>
            <option value="Uso interno">Uso interno</option>
          </select>
          {error.motivo && <span className="error-msg">{error.motivo}</span>}
        </label>
        <button className="btn-submit" type="submit">
          Registrar Retiro
        </button>
      </form>

      {/* Retiros recientes */}
      <h3 className="registro-reciente">Retiros recientes</h3>
      <table className="registros-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Ecoladrillo</th>
            <th>Cantidad</th>
            <th>Motivo</th>
          </tr>
        </thead>
        <tbody>
          {retiros.map((retiro) => (
            <tr key={retiro.id_retiro}>
              <td>{retiro.id_retiro}</td>
              <td>{retiro.fecha}</td>
              <td>{retiro.ecoladrillo_nombre || retiro.ecoladrillo}</td>
              <td>{retiro.cantidad}</td>
              <td>{retiro.motivo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

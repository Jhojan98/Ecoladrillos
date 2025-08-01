import { useState, useEffect } from "react";
// hooks
import { useNotifier } from "@hooks/useNotifier";
// queries
import { useGetEcoladrillos } from "@db/queries/Inventory";
import {
  useGetRegistersEcobricks,
  useRegisterEcobricksMutation,
} from "@db/queries/Ecoladrillos";
// styles
import "./registroEcoladrillos.scss";

export default function RegistroEcoladrillos() {
  const notify = useNotifier();

  // --- OBTERENER ECOALDRILLOS ---
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

  // ------ OBTENER REGISTROS ECOLADRILLOS ------
  const [registers, setRegisters] = useState([]);

  const { fetchData: getRegisters } = useGetRegistersEcobricks();

  const fetchRegisters = async () => {
    const response = await getRegisters();

    if (response.fetchErrorMsg) {
      notify.error(response.fetchErrorMsg);
      return;
    }

    setRegisters(response.results || []);
  };

  useEffect(() => {
    fetchRegisters();
    fetchEcobricks();
  }, []);

  // ------ FORMULARIO DE REGISTRO ------
  const [registerEcoForm, setRegisterEcoForm] = useState({
    idEcoladrillo: 0,
    cantidad: 0,
    // fecha: new Date().toISOString().slice(0, 10),
    fecha: "",
  });
  const [error, setError] = useState("");

  // ------ REGISTRO DE ECOALDRILLOS ------
  const registerEcobricksMutate = useRegisterEcobricksMutation();

  const onSubmitRegister = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!registerEcoForm.idEcoladrillo) {
      newErrors.idEcoladrillo = "seleccion un ecoladrillo valido";
    }
    if (registerEcoForm.cantidad <= 0) {
      newErrors.cantidad = "La cantidad debe ser mayor a 0";
    }
    if (!registerEcoForm.fecha) {
      newErrors.fecha = "Selecciona una fecha valida";
    }

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }
    setError("");

    // Enviar peticon
    const newResgister = {
      fecha: registerEcoForm.fecha,
      ecoladrillo: registerEcoForm.idEcoladrillo,
      cantidad: registerEcoForm.cantidad,
    };

    console.log("Nuevo registro:", newResgister);

    const response = await registerEcobricksMutate.post(newResgister);
    if (response.errorMutationMsg) {
      notify.error(response.errorMutationMsg);
      return;
    }
    notify.success("Ecoladrillo registrado");
    fetchRegisters();
  };

  return (
    <div className="registro-ecoladrillos-container w-100">
      <h1>Registro de Ecoladrillos</h1>
      <form onSubmit={onSubmitRegister} className="registro-form">
        <label>
          Tipo de Ecoladrillo:
          <select
            name="id_ecoladrillo"
            value={registerEcoForm.idEcoladrillo}
            onChange={(e) =>
              setRegisterEcoForm({
                ...registerEcoForm,
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
          Cantidad producida:
          <input
            type="number"
            value={registerEcoForm.cantidad}
            onChange={(e) =>
              setRegisterEcoForm({
                ...registerEcoForm,
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
            value={registerEcoForm.fecha}
            onChange={(e) =>
              setRegisterEcoForm({ ...registerEcoForm, fecha: e.target.value })
            }
            // required
          />
          {error.fecha && <span className="error-msg">{error.fecha}</span>}
        </label>
        <button className="btn-submit" type="submit">
          Registrar
        </button>
      </form>

      {/* Registros recientes */}
      <h3 className="registro-reciente">Registros recientes</h3>
      <table className="registros-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Cantidad</th>
            {/* <th>Responsable</th> */}
          </tr>
        </thead>
        <tbody>
          {registers.map((reg) => (
            <tr key={reg.id_registro}>
              <td>{reg.id_registro}</td>
              <td>{reg.fecha}</td>
              <td>{reg.cantidad}</td>
              {/* <td>{reg.responsable}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

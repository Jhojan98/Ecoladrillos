import { useState, useEffect } from "react";
// hooks
import { useNotifier } from "@hooks/useNotifier";
// queries
import { useGetMaterials } from "@db/queries/Material";
import {
  useGetRegistersMaterials,
  useRegisterMaterialMutation,
} from "@db/queries/Material";

export default function RegistroMaterial() {
  const notify = useNotifier();

  // --- OBTENER MATERIALES ---
  const [materiales, setMateriales] = useState([]);

  const { fetchData: getMaterials } = useGetMaterials();

  const fetchMaterials = async () => {
    const materials = await getMaterials();

    if (materials.fetchErrorMsg) {
      notify.error(materials.fetchErrorMsg);
      return;
    }

    setMateriales(materials.materiales || []);
  };

  // ------ OBTENER REGISTROS MATERIALES ------
  const [registers, setRegisters] = useState([]);

  const { fetchData: getRegisters } = useGetRegistersMaterials();

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
    fetchMaterials();
  }, []);

  // ------ FORMULARIO DE REGISTRO ------
  const [registerMaterialForm, setRegisterMaterialForm] = useState({
    idMaterial: 0,
    cantidad: 0,
    fecha: "",
    origen: "",
  });
  const [error, setError] = useState("");

  // ------ REGISTRO DE MATERIALES ------
  const registerMaterialMutate = useRegisterMaterialMutation();

  const onSubmitRegister = async (e) => {
    e.preventDefault();

    const newRegister = {
      fecha: registerMaterialForm.fecha,
      material: registerMaterialForm.idMaterial,
      cantidad: parseInt(registerMaterialForm.cantidad) || 0,
      origen: registerMaterialForm.origen,
    };

    let newErrors = {};
    if (!newRegister.material) {
      newErrors.idMaterial = "Selecciona un material válido";
    }
    if (newRegister.cantidad <= 0) {
      newErrors.cantidad = "La cantidad debe ser mayor a 0";
    }
    if (!newRegister.fecha) {
      newErrors.fecha = "Selecciona una fecha válida";
    }
    if (!newRegister.origen.trim()) {
      newErrors.origen = "El origen es requerido";
    }

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }
    setError("");

    // Enviar petición
    const response = await registerMaterialMutate.post(newRegister);
    if (response.errorJsonMsg) {
      notify.error(response.errorJsonMsg);
      return;
    }
    notify.success("Material registrado");
    fetchRegisters();

    // Limpiar formulario
    setRegisterMaterialForm({
      idMaterial: 0,
      cantidad: 0,
      fecha: "",
      origen: "",
    });
  };

  return (
    <div className="registro-container w-100">
      <h1>Registro de Materiales</h1>
      <form onSubmit={onSubmitRegister} className="registro-form">
        <label>
          Tipo de Material:
          <select
            name="id_insumo"
            value={registerMaterialForm.idMaterial}
            onChange={(e) =>
              setRegisterMaterialForm({
                ...registerMaterialForm,
                idMaterial: parseInt(e.target.value),
              })
            }
          >
            <option value="">Selecciona un material</option>
            {materiales.map((material) => (
              <option key={material.id_insumo} value={material.id_insumo}>
                {material.nombre}
              </option>
            ))}
          </select>
          {error.idMaterial && (
            <span className="error-msg">{error.idMaterial}</span>
          )}
        </label>
        <label>
          Cantidad:
          <input
            type="number"
            value={registerMaterialForm.cantidad}
            onChange={(e) =>
              setRegisterMaterialForm({
                ...registerMaterialForm,
                cantidad: e.target.value,
              })
            }
            placeholder="Ingrese la cantidad"
          />
          {error.cantidad && (
            <span className="error-msg">{error.cantidad}</span>
          )}
        </label>
        <label>
          Fecha:
          <input
            type="date"
            value={registerMaterialForm.fecha}
            onChange={(e) =>
              setRegisterMaterialForm({
                ...registerMaterialForm,
                fecha: e.target.value,
              })
            }
          />
          {error.fecha && <span className="error-msg">{error.fecha}</span>}
        </label>
        <label>
          Origen:
          <input
            type="text"
            value={registerMaterialForm.origen}
            onChange={(e) =>
              setRegisterMaterialForm({
                ...registerMaterialForm,
                origen: e.target.value,
              })
            }
            placeholder="Ingrese el origen del material"
          />
          {error.origen && <span className="error-msg">{error.origen}</span>}
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
            <th>ID Registro</th>
            <th>Fecha</th>
            <th>Material</th>
            <th>Cantidad</th>
            <th>Origen</th>
          </tr>
        </thead>
        <tbody>
          {registers.map((reg) => (
            <tr key={reg.id_registro_material}>
              <td>{reg.id_registro_material}</td>
              <td>{reg.fecha}</td>
              <td>{reg.material_nombre}</td>
              <td>{reg.cantidad}</td>
              <td>{reg.origen}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

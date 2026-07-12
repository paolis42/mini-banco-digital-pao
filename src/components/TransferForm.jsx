import { useState } from "react";
import { buscarUsuarioPorEmail, transferirDinero } from "../services/bankService";
import { validarTransferencia } from "../utils/validaciones";

function TransferForm({ perfil, onTransferenciaExitosa }) {
  const [transferencia, setTransferencia] = useState({ email: "", monto: "" });
  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);

  const handleChange = (e) => {
    setTransferencia({
      ...transferencia,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcesando(true);
    setMensaje("");

    try {
      const validacion = validarTransferencia({
        emailDestino: transferencia.email,
        emailUsuario: perfil.email,
        monto: transferencia.monto,
        saldo: perfil.saldo
      });

      if (!validacion.ok) {
        throw new Error(validacion.mensaje);
      }

      const receptor = await buscarUsuarioPorEmail(validacion.email);

      if (!receptor) {
        throw new Error("El destinatario no existe");
      }

      await transferirDinero({
        emisor: perfil,
        receptor,
        monto: validacion.monto
      });

      setTransferencia({ email: "", monto: "" });
      setMensaje("Transferencia realizada");

      if (onTransferenciaExitosa) {
        onTransferenciaExitosa();
      }
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="tarjeta formulario" noValidate>
      <h2>Transferir</h2>

      <input
        name="email"
        type="email"
        value={transferencia.email}
        onChange={handleChange}
        placeholder="Email del destinatario"
        autoComplete="off"
      />

      <input
        name="monto"
        type="number"
        value={transferencia.monto}
        onChange={handleChange}
        placeholder="Monto"
        min="1"
      />

      <button disabled={procesando}>Enviar transferencia</button>

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </form>
  );
}

export default TransferForm;
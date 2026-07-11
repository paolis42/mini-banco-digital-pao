export const validarTransferencia = ({ emailDestino, emailUsuario, monto, saldo }) => {
  const email = emailDestino.trim().toLowerCase();
  const emailActual = emailUsuario.trim().toLowerCase();
  const montoNumero = Number(monto);

  const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return { ok: false, mensaje: "Ingresa el email del destinatario" };
  }

  if (!formatoEmail.test(email)) {
    return { ok: false, mensaje: "Ingresa un email válido" };
  }

  if (email === emailActual) {
    return { ok: false, mensaje: "No puedes transferirte a ti misma" };
  }

  if (monto === "" || Number.isNaN(montoNumero)) {
    return { ok: false, mensaje: "El monto debe ser un número" };
  }

  if (montoNumero <= 0) {
    return { ok: false, mensaje: "El monto debe ser mayor a 0" };
  }

  if (!Number.isInteger(montoNumero)) {
    return { ok: false, mensaje: "El monto debe ser un número entero" };
  }

  if (montoNumero > Number(saldo)) {
    return { ok: false, mensaje: "Saldo insuficiente" };
  }

  return {
    ok: true,
    mensaje: "",
    email,
    monto: montoNumero
  };
};
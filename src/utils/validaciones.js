export const validarTransferencia = ({ emailDestino, emailUsuario, monto, saldo }) => {
  const email = emailDestino.trim().toLowerCase();
  const emailActual = emailUsuario.trim().toLowerCase();
  const montoTexto = String(monto).trim();

  const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const soloEnteros = /^-?\d+$/;

  if (!email) {
    return { ok: false, mensaje: "Ingresa el email del destinatario" };
  }

  if (!formatoEmail.test(email)) {
    return { ok: false, mensaje: "Ingresa un email válido" };
  }

  if (email === emailActual) {
    return { ok: false, mensaje: "No puedes transferirte a ti misma" };
  }

  if (!montoTexto) {
    return { ok: false, mensaje: "El monto debe ser un número" };
  }

  if (montoTexto.includes(".") || montoTexto.includes(",")) {
    return {
      ok: false,
      mensaje: "El monto debe ser un número entero sin puntos ni comas"
    };
  }

  if (!soloEnteros.test(montoTexto)) {
    return { ok: false, mensaje: "El monto debe ser un número" };
  }

  const montoNumero = Number(montoTexto);

  if (montoNumero <= 0) {
    return { ok: false, mensaje: "El monto debe ser mayor a 0" };
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
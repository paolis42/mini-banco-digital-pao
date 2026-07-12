import { describe, expect, it } from "vitest";
import { validarTransferencia } from "./validaciones";

describe("validarTransferencia", () => {
  const datosBase = {
    emailDestino: "levi.ackerman@gmail.com",
    emailUsuario: "eren.yeager@gmail.com",
    monto: "5000",
    saldo: 100000
  };

  it.each([
    ["monto negativo", "-1000", "El monto debe ser mayor a 0"],
    ["monto cero", "0", "El monto debe ser mayor a 0"],
    ["monto no numérico", "abc", "El monto debe ser un número"],
    ["monto con decimales", "10.5", "El monto debe ser un número entero sin puntos ni comas"],
    ["monto con separador de miles", "5.000", "El monto debe ser un número entero sin puntos ni comas"],
    ["monto con coma", "10,5", "El monto debe ser un número entero sin puntos ni comas"]
   ])("rechaza transferencia con %s", (_, monto, mensajeEsperado) => {
    const resultado = validarTransferencia({
      ...datosBase,
      monto
    });

    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toBe(mensajeEsperado);
  });

  it("rechaza transferencia cuando el monto supera el saldo disponible", () => {
    const resultado = validarTransferencia({
      ...datosBase,
      monto: "150000"
    });

    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toBe("Saldo insuficiente");
  });

  it("rechaza transferencia a uno mismo", () => {
    const resultado = validarTransferencia({
      ...datosBase,
      emailDestino: "eren.yeager@gmail.com"
    });

    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toBe("No puedes transferirte a ti misma");
  });

  it.each([
    ["email vacío", "", "Ingresa el email del destinatario"],
    ["email inválido", "correo-malo", "Ingresa un email válido"]
  ])("rechaza transferencia con %s", (_, emailDestino, mensajeEsperado) => {
    const resultado = validarTransferencia({
      ...datosBase,
      emailDestino
    });

    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toBe(mensajeEsperado);
  });

  it("acepta una transferencia válida con saldo suficiente", () => {
    const resultado = validarTransferencia(datosBase);

    expect(resultado.ok).toBe(true);
    expect(resultado.mensaje).toBe("");
    expect(resultado.email).toBe("levi.ackerman@gmail.com");
    expect(resultado.monto).toBe(5000);
  });
});
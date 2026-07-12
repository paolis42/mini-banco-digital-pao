import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Historial from "./Historial";

describe("Historial", () => {
  const perfil = {
    uid: "user-1",
    email: "eren.yeager@gmail.com",
  };

  const crearFecha = (fecha) => ({
    toDate: () => new Date(fecha),
  });

  const movimientos = [
    {
      id: "mov-1",
      emisorUid: "user-1",
      receptorUid: "user-2",
      emisorEmail: "eren.yeager@gmail.com",
      receptorEmail: "levi.ackerman@gmail.com",
      monto: 5000,
      fecha: crearFecha("2026-07-10T10:00:00"),
      descripcion: "Transferencia enviada",
    },
    {
      id: "mov-2",
      emisorUid: "user-3",
      receptorUid: "user-1",
      emisorEmail: "mikasa.ackerman@gmail.com",
      receptorEmail: "eren.yeager@gmail.com",
      monto: 10000,
      fecha: crearFecha("2026-07-11T10:00:00"),
      descripcion: "Transferencia recibida",
    },
  ];

  it("muestra mensaje cuando no hay movimientos", () => {
    render(
      <Historial
        movimientos={[]}
        perfil={perfil}
        busquedaHistorial=""
        setBusquedaHistorial={vi.fn()}
      />
    );

    expect(screen.getByText("No tienes movimientos todavía.")).toBeInTheDocument();
  });

  it("muestra los movimientos ordenados del más reciente al más antiguo", () => {
    render(
      <Historial
        movimientos={movimientos}
        perfil={perfil}
        busquedaHistorial=""
        setBusquedaHistorial={vi.fn()}
      />
    );

    const items = screen.getAllByRole("listitem");

    expect(within(items[0]).getByText("Recepción")).toBeInTheDocument();
    expect(within(items[0]).getByText("mikasa.ackerman@gmail.com")).toBeInTheDocument();

    expect(within(items[1]).getByText("Envío")).toBeInTheDocument();
    expect(within(items[1]).getByText("levi.ackerman@gmail.com")).toBeInTheDocument();
  });

  it("distingue envíos y recepciones", () => {
    render(
      <Historial
        movimientos={movimientos}
        perfil={perfil}
        busquedaHistorial=""
        setBusquedaHistorial={vi.fn()}
      />
    );

    expect(screen.getByText("Recepción")).toBeInTheDocument();
    expect(screen.getByText("Envío")).toBeInTheDocument();
    expect(screen.getByText("mikasa.ackerman@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("levi.ackerman@gmail.com")).toBeInTheDocument();
  });

  it("filtra movimientos por tipo de movimiento", () => {
    render(
      <Historial
        movimientos={movimientos}
        perfil={perfil}
        busquedaHistorial="recepcion"
        setBusquedaHistorial={vi.fn()}
      />
    );

    expect(screen.getByText("Recepción")).toBeInTheDocument();
    expect(screen.queryByText("Envío")).not.toBeInTheDocument();
  });

  it("muestra mensaje cuando no encuentra movimientos filtrados", () => {
    render(
      <Historial
        movimientos={movimientos}
        perfil={perfil}
        busquedaHistorial="sasha"
        setBusquedaHistorial={vi.fn()}
      />
    );

    expect(screen.getByText("No se encontraron movimientos.")).toBeInTheDocument();
  });

  it("actualiza el texto de búsqueda al escribir", async () => {
    const user = userEvent.setup();
    const setBusquedaHistorial = vi.fn();

    render(
      <Historial
        movimientos={movimientos}
        perfil={perfil}
        busquedaHistorial=""
        setBusquedaHistorial={setBusquedaHistorial}
      />
    );

    await user.type(
      screen.getByPlaceholderText("Buscar por email o tipo de movimiento"),
      "l"
    );

    expect(setBusquedaHistorial).toHaveBeenCalledWith("l");
  });
});

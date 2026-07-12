import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import TransferForm from "./TransferForm";
import {
  buscarUsuarioPorEmail,
  transferirDinero
} from "../services/bankService";

vi.mock("../services/bankService", () => ({
  buscarUsuarioPorEmail: vi.fn(),
  transferirDinero: vi.fn()
}));

describe("TransferForm", () => {
  const perfil = {
    uid: "user-1",
    nombre: "Eren Yeager",
    email: "eren.yeager@gmail.com",
    saldo: 100000
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza los campos y el botón de enviar", () => {
    render(<TransferForm perfil={perfil} />);

    expect(screen.getByPlaceholderText("Email del destinatario")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Monto")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar transferencia/i })).toBeInTheDocument();
  });

  it("muestra error si el email no es válido y no llama al servicio", async () => {
    const user = userEvent.setup();

    render(<TransferForm perfil={perfil} />);

    await user.type(screen.getByPlaceholderText("Email del destinatario"), "poto");
    await user.type(screen.getByPlaceholderText("Monto"), "5000");
    await user.click(screen.getByRole("button", { name: /enviar transferencia/i }));

    expect(await screen.findByText("Ingresa un email válido")).toBeInTheDocument();
    expect(buscarUsuarioPorEmail).not.toHaveBeenCalled();
    expect(transferirDinero).not.toHaveBeenCalled();
  });

  it("muestra error si el monto tiene punto y no llama al servicio", async () => {
    const user = userEvent.setup();

    render(<TransferForm perfil={perfil} />);

    await user.type(screen.getByPlaceholderText("Email del destinatario"), "levi.ackerman@gmail.com");
    await user.type(screen.getByPlaceholderText("Monto"), "5.000");
    await user.click(screen.getByRole("button", { name: /enviar transferencia/i }));

    expect(
      await screen.findByText("El monto debe ser un número entero sin puntos ni comas")
    ).toBeInTheDocument();

    expect(buscarUsuarioPorEmail).not.toHaveBeenCalled();
    expect(transferirDinero).not.toHaveBeenCalled();
  });

  it("envía transferencia válida llamando al servicio una vez", async () => {
    const user = userEvent.setup();

    const receptor = {
      uid: "user-2",
      nombre: "Levi Ackerman",
      email: "levi.ackerman@gmail.com",
      saldo: 100000
    };

    buscarUsuarioPorEmail.mockResolvedValue(receptor);
    transferirDinero.mockResolvedValue();

    render(<TransferForm perfil={perfil} />);

    await user.type(screen.getByPlaceholderText("Email del destinatario"), "levi.ackerman@gmail.com");
    await user.type(screen.getByPlaceholderText("Monto"), "5000");
    await user.click(screen.getByRole("button", { name: /enviar transferencia/i }));

    await waitFor(() => {
      expect(transferirDinero).toHaveBeenCalledTimes(1);
    });

    expect(buscarUsuarioPorEmail).toHaveBeenCalledWith("levi.ackerman@gmail.com");

    expect(transferirDinero).toHaveBeenCalledWith({
      emisor: perfil,
      receptor,
      monto: 5000
    });

    expect(await screen.findByText("Transferencia realizada")).toBeInTheDocument();
  });
});
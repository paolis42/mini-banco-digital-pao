import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import App from "./App";
import { onAuthStateChanged } from "firebase/auth";
import {
  crearPerfil,
  escucharPerfil,
  escucharMovimientos
} from "./services/bankService";

vi.mock("./firebase", () => ({
  auth: {}
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn()
}));

vi.mock("./services/bankService", () => ({
  cambiarSaldo: vi.fn(),
  crearPerfil: vi.fn(),
  escucharPerfil: vi.fn(),
  escucharMovimientos: vi.fn(),
  buscarUsuarioPorEmail: vi.fn(),
  transferirDinero: vi.fn()
}));

describe("App - suscripciones", () => {
  let unsubscribeAuth;
  let unsubscribePerfil;
  let unsubscribeMovimientos;

  beforeEach(() => {
    vi.clearAllMocks();

    unsubscribeAuth = vi.fn();
    unsubscribePerfil = vi.fn();
    unsubscribeMovimientos = vi.fn();

    onAuthStateChanged.mockImplementation((_auth, callback) => {
      callback({
        uid: "user-1",
        email: "eren.yeager@gmail.com"
      });

      return unsubscribeAuth;
    });

    escucharPerfil.mockImplementation((_uid, callback) => {
      const snapPerfil = {
        exists: () => true,
        data: () => ({
          nombre: "Eren Yeager",
          email: "eren.yeager@gmail.com",
          saldo: 100000
        })
      };

      callback(snapPerfil);

      return unsubscribePerfil;
    });

    escucharMovimientos.mockImplementation((_uid, callback) => {
      callback([]);

      return unsubscribeMovimientos;
    });
  });

  it("llama a unsubscribe al desmontar el componente", async () => {
    const { unmount } = render(<App />);

    await waitFor(() => {
      expect(escucharPerfil).toHaveBeenCalledTimes(1);
      expect(escucharMovimientos).toHaveBeenCalledTimes(1);
    });

    expect(escucharPerfil.mock.calls[0][0]).toBe("user-1");
    expect(typeof escucharPerfil.mock.calls[0][1]).toBe("function");

    expect(escucharMovimientos.mock.calls[0][0]).toBe("user-1");
    expect(typeof escucharMovimientos.mock.calls[0][1]).toBe("function");

    unmount();

    expect(unsubscribeAuth).toHaveBeenCalledTimes(1);
    expect(unsubscribePerfil).toHaveBeenCalledTimes(1);
    expect(unsubscribeMovimientos).toHaveBeenCalledTimes(1);
  });

  it("crea el perfil si el documento del usuario no existe", async () => {
    escucharPerfil.mockImplementation((_uid, callback) => {
      const snapPerfil = {
        exists: () => false
      };

      callback(snapPerfil);

      return unsubscribePerfil;
    });

    const { unmount } = render(<App />);

    await waitFor(() => {
      expect(crearPerfil).toHaveBeenCalledWith(
        expect.objectContaining({
          uid: "user-1",
          email: "eren.yeager@gmail.com"
        }),
        "eren.yeager"
      );
    });

    expect(escucharMovimientos).toHaveBeenCalledTimes(1);

    unmount();

    expect(unsubscribeAuth).toHaveBeenCalledTimes(1);
    expect(unsubscribePerfil).toHaveBeenCalledTimes(1);
  });

  it("no inicia suscripciones si no hay usuario autenticado", async () => {
    onAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(null);
      return unsubscribeAuth;
    });

    const { unmount } = render(<App />);

    await waitFor(() => {
      expect(onAuthStateChanged).toHaveBeenCalledTimes(1);
    });

    expect(escucharPerfil).not.toHaveBeenCalled();
    expect(escucharMovimientos).not.toHaveBeenCalled();

    unmount();

    expect(unsubscribeAuth).toHaveBeenCalledTimes(1);
  });
});

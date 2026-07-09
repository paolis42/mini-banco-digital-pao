import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth } from "./firebase";
import {
  buscarUsuarioPorEmail,
  cambiarSaldo,
  crearPerfil,
  escucharMovimientos,
  escucharPerfil,
  transferirDinero
} from "./services/bankService";

const dinero = (valor) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP"
  }).format(valor || 0);

const fechaMovimiento = (fecha) => {
  if (!fecha?.toDate) return "Fecha pendiente";

  return fecha.toDate().toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short"
  });
};
function App() {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [authForm, setAuthForm] = useState({ nombre: "", email: "", password: "" });
  const [transferencia, setTransferencia] = useState({ email: "", monto: "" });
  const [montoRapido, setMontoRapido] = useState("");
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!usuario) {
      setPerfil(null);
      setMovimientos([]);
      return;
    }

    setCargando(true);

    const unsubPerfil = escucharPerfil(
  usuario.uid,
  async (snap) => {
    if (!snap.exists()) {
      await crearPerfil(usuario, usuario.email.split("@")[0]);
      return;
    }

    setPerfil({ uid: usuario.uid, ...snap.data() });
    setCargando(false);
  },
  () => mostrarMensaje("No se pudo cargar el perfil")
  );

    const unsubMovimientos = escucharMovimientos(
      usuario.uid,
      setMovimientos,
      () => mostrarMensaje("No se pudo cargar el historial")
    );

    return () => {
      unsubPerfil();
      unsubMovimientos();
    };
  }, [usuario]);

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 3500);
  };

  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleTransferChange = (e) => {
    setTransferencia({ ...transferencia, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setProcesando(true);
    setMensaje("");

    try {
      const email = authForm.email.trim().toLowerCase();
      const password = authForm.password;

      if (!email || !password) throw new Error("Completa email y contraseña");

      if (modoRegistro) {
        if (!authForm.nombre.trim()) throw new Error("Ingresa tu nombre");
        const credencial = await createUserWithEmailAndPassword(auth, email, password);
        await crearPerfil(credencial.user, authForm.nombre.trim());
        mostrarMensaje("Cuenta creada correctamente");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        mostrarMensaje("Sesión iniciada");
      }

      setAuthForm({ nombre: "", email: "", password: "" });
    } catch (error) {
      mostrarMensaje(error.message);
    } finally {
      setProcesando(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setProcesando(true);
    setMensaje("");

    try {
      const email = transferencia.email.trim().toLowerCase();
      const monto = Number(transferencia.monto);

      if (!email) throw new Error("Ingresa el email del destinatario");
      if (email === perfil.email) throw new Error("No puedes transferirte a ti misma");
      if (!monto || monto <= 0) throw new Error("El monto debe ser mayor a 0");
      if (monto > perfil.saldo) throw new Error("Saldo insuficiente");

      const receptor = await buscarUsuarioPorEmail(email);

      if (!receptor) throw new Error("El destinatario no existe");

      await transferirDinero({ emisor: perfil, receptor, monto });
      setTransferencia({ email: "", monto: "" });
      mostrarMensaje("Transferencia realizada");
    } catch (error) {
      mostrarMensaje(error.message);
    } finally {
      setProcesando(false);
    }
  };

  const handleCambioSaldo = async (tipo) => {
    setProcesando(true);
    setMensaje("");

    try {
      const monto = Number(montoRapido);

      if (!monto || monto <= 0) throw new Error("El monto debe ser mayor a 0");
      if (tipo === "retiro" && monto > perfil.saldo) throw new Error("Saldo insuficiente");

      await cambiarSaldo({ uid: perfil.uid, monto, tipo });
      setMontoRapido("");
      mostrarMensaje(tipo === "deposito" ? "Depósito realizado" : "Retiro realizado");
    } catch (error) {
      mostrarMensaje(error.message);
    } finally {
      setProcesando(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUsuario(null);
    setPerfil(null);
    setMovimientos([]);
  };

  if (cargando) {
    return <main className="contenedor">Cargando...</main>;
  }

  if (!usuario) {
    return (
      <main className="contenedor auth">
        <h1>Mini Banco Digital</h1>
        <p>Inicia sesión o crea tu cuenta para comenzar.</p>

        <form onSubmit={handleAuthSubmit} className="tarjeta formulario">
          {modoRegistro && (
            <input
              name="nombre"
              value={authForm.nombre}
              onChange={handleAuthChange}
              placeholder="Nombre"
            />
          )}

          <input
            name="email"
            type="email"
            value={authForm.email}
            onChange={handleAuthChange}
            placeholder="Email"
          />

          <input
            name="password"
            type="password"
            value={authForm.password}
            onChange={handleAuthChange}
            placeholder="Contraseña"
          />

          <button disabled={procesando}>
            {modoRegistro ? "Registrarme" : "Iniciar sesión"}
          </button>
        </form>

        <button className="link" onClick={() => setModoRegistro(!modoRegistro)}>
          {modoRegistro ? "Ya tengo cuenta" : "Crear cuenta nueva"}
        </button>

        {mensaje && <p className="mensaje">{mensaje}</p>}
      </main>
    );
  }

  return (
    <main className="contenedor">
      <header className="encabezado">
        <div>
          <h1>Mini Banco Digital</h1>
          <p>{perfil?.nombre} · {perfil?.email}</p>
        </div>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </header>

      <section className="tarjeta saldo">
        <span>Saldo actual</span>
        <strong>{dinero(perfil?.saldo)}</strong>
      </section>

      <section className="grid">
        <form onSubmit={handleTransferSubmit} className="tarjeta formulario">
          <h2>Transferir</h2>

          <input
            name="email"
            type="email"
            value={transferencia.email}
            onChange={handleTransferChange}
            placeholder="Email del destinatario"
          />

          <input
            name="monto"
            type="number"
            value={transferencia.monto}
            onChange={handleTransferChange}
            placeholder="Monto"
            min="1"
          />

          <button disabled={procesando}>Enviar transferencia</button>
        </form>

        <div className="tarjeta formulario">
          <h2>Depósito / retiro</h2>

          <input
            type="number"
            value={montoRapido}
            onChange={(e) => setMontoRapido(e.target.value)}
            placeholder="Monto"
            min="1"
          />

          <div className="botones">
            <button disabled={procesando} onClick={() => handleCambioSaldo("deposito")}>
              Depositar
            </button>
            <button disabled={procesando} onClick={() => handleCambioSaldo("retiro")}>
              Retirar
            </button>
          </div>
        </div>
      </section>

      {mensaje && <p className="mensaje">{mensaje}</p>}

      <section className="tarjeta">
        <h2>Historial</h2>

        {movimientos.length === 0 ? (
          <p>No tienes movimientos todavía.</p>
        ) : (
          <ul className="historial">
            {movimientos.map((mov) => {
              const recibido = mov.receptorUid === perfil.uid;

              return (
                <li key={mov.id}>
                  <div>
                  <strong>{recibido ? "Recepción" : "Envío"}</strong>
                 <span>{recibido ? mov.emisorEmail : mov.receptorEmail}</span>
                 <span>{fechaMovimiento(mov.fecha)}</span>
                 </div>
                  <strong className={recibido ? "positivo" : "negativo"}>
                    {recibido ? "+" : "-"} {dinero(mov.monto)}
                  </strong>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;

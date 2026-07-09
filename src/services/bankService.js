import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { db } from "../firebase";

const saldoInicial = 100000;

export const crearPerfil = (usuario, nombre) => {
  return setDoc(doc(db, "users", usuario.uid), {
    nombre,
    email: usuario.email.toLowerCase(),
    saldo: saldoInicial,
    creadoEn: serverTimestamp()
  });
};

export const escucharPerfil = (uid, callback, errorCallback) => {
  return onSnapshot(doc(db, "users", uid), callback, errorCallback);
};

export const escucharMovimientos = (uid, callback, errorCallback) => {
  const enviados = query(
    collection(db, "movimientos"),
    where("emisorUid", "==", uid)
  );

  const recibidos = query(
    collection(db, "movimientos"),
    where("receptorUid", "==", uid)
  );

  let listaEnviados = [];
  let listaRecibidos = [];

  const ordenarYMostrar = () => {
    const movimientos = [...listaEnviados, ...listaRecibidos].sort((a, b) => {
      const fechaA = a.fecha?.toMillis?.() || 0;
      const fechaB = b.fecha?.toMillis?.() || 0;

      return fechaB - fechaA;
    });

    callback(movimientos);
  };

  const unsubEnviados = onSnapshot(
    enviados,
    (snap) => {
      listaEnviados = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      ordenarYMostrar();
    },
    errorCallback
  );

  const unsubRecibidos = onSnapshot(
    recibidos,
    (snap) => {
      listaRecibidos = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      ordenarYMostrar();
    },
    errorCallback
  );

  return () => {
    unsubEnviados();
    unsubRecibidos();
  };
};

export const buscarUsuarioPorEmail = async (email) => {
  const usuariosRef = collection(db, "users");

  const q = query(
    usuariosRef,
    where("email", "==", email.toLowerCase()),
    limit(1)
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  const usuario = snap.docs[0];

  return {
    uid: usuario.id,
    ...usuario.data()
  };
};

export const transferirDinero = async ({ emisor, receptor, monto }) => {
  const emisorRef = doc(db, "users", emisor.uid);
  const receptorRef = doc(db, "users", receptor.uid);

  await runTransaction(db, async (transaction) => {
    const emisorSnap = await transaction.get(emisorRef);
    const receptorSnap = await transaction.get(receptorRef);

    if (!emisorSnap.exists()) throw new Error("No existe la cuenta emisora");
    if (!receptorSnap.exists()) throw new Error("No existe la cuenta receptora");

    const saldoActual = Number(emisorSnap.data().saldo);

    if (saldoActual < monto) throw new Error("Saldo insuficiente");

    transaction.update(emisorRef, {
      saldo: saldoActual - monto
    });

    transaction.update(receptorRef, {
      saldo: increment(monto)
    });

    transaction.set(doc(collection(db, "movimientos")), {
      emisorUid: emisor.uid,
      receptorUid: receptor.uid,
      emisorEmail: emisor.email,
      receptorEmail: receptor.email,
      monto,
      fecha: serverTimestamp(),
      descripcion: `Transferencia a ${receptor.email}`
    });
  });
};

export const cambiarSaldo = async ({ uid, monto, tipo }) => {
  const usuarioRef = doc(db, "users", uid);
  const cambio = tipo === "deposito" ? monto : -monto;

  await updateDoc(usuarioRef, {
    saldo: increment(cambio)
  });

  await addDoc(collection(db, "movimientos"), {
    emisorUid: tipo === "retiro" ? uid : "sistema",
    receptorUid: tipo === "deposito" ? uid : "sistema",
    emisorEmail: tipo === "retiro" ? "usuario" : "sistema",
    receptorEmail: tipo === "deposito" ? "usuario" : "sistema",
    monto,
    fecha: serverTimestamp(),
    descripcion: tipo === "deposito" ? "Depósito simulado" : "Retiro simulado"
  });
};
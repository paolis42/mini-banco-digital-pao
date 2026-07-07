import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
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
    where("emisorUid", "==", uid),
    orderBy("fecha", "desc")
  );

  const recibidos = query(
    collection(db, "movimientos"),
    where("receptorUid", "==", uid),
    orderBy("fecha", "desc")
  );

  let listaEnviados = [];
  let listaRecibidos = [];

  const unir = () => {
    callback(
      [...listaEnviados, ...listaRecibidos].sort((a, b) => {
        const fechaA = a.fecha?.toMillis?.() || 0;
        const fechaB = b.fecha?.toMillis?.() || 0;
        return fechaB - fechaA;
      })
    );
  };

  const unsubEnviados = onSnapshot(enviados, (snap) => {
    listaEnviados = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    unir();
  }, errorCallback);

  const unsubRecibidos = onSnapshot(recibidos, (snap) => {
    listaRecibidos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    unir();
  }, errorCallback);

  return () => {
    unsubEnviados();
    unsubRecibidos();
  };
};

export const buscarUsuarioPorEmail = async (email) => {
  const q = query(
    collection(db, "users"),
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

    if (!emisorSnap.exists()) throw new Error("No existe la cuenta emisora");

    const saldoActual = Number(emisorSnap.data().saldo);

    if (saldoActual < monto) throw new Error("Saldo insuficiente");

    transaction.update(emisorRef, { saldo: saldoActual - monto });
    transaction.update(receptorRef, { saldo: increment(monto) });

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
  const ref = doc(db, "users", uid);
  const cambio = tipo === "deposito" ? monto : -monto;

  await updateDoc(ref, {
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

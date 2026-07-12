function dinero(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(valor || 0);
}

function fechaMovimiento(fecha) {
  if (!fecha) return "Fecha pendiente";

  const fechaFinal = fecha.toDate ? fecha.toDate() : new Date(fecha);

  return fechaFinal.toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function obtenerTiempo(fecha) {
  if (!fecha) return 0;

  const fechaFinal = fecha.toDate ? fecha.toDate() : new Date(fecha);
  return fechaFinal.getTime();
}

function Historial({ movimientos, perfil, busquedaHistorial, setBusquedaHistorial }) {
  const movimientosOrdenados = [...movimientos].sort(
    (a, b) => obtenerTiempo(b.fecha) - obtenerTiempo(a.fecha)
  );

  const movimientosFiltrados = movimientosOrdenados.filter((mov) => {
    const texto = busquedaHistorial.toLowerCase();
    const recibido = mov.receptorUid === perfil?.uid;
    const tipo = recibido ? "recepcion recepción" : "envio envío";

    return (
      tipo.includes(texto) ||
      mov.emisorEmail?.toLowerCase().includes(texto) ||
      mov.receptorEmail?.toLowerCase().includes(texto) ||
      mov.descripcion?.toLowerCase().includes(texto)
    );
  });

  return (
    <section className="tarjeta">
      <h2>Historial</h2>

      <input
        className="buscador-historial"
        value={busquedaHistorial}
        onChange={(e) => setBusquedaHistorial(e.target.value)}
        placeholder="Buscar por email o tipo de movimiento"
        autoComplete="off"
      />

      {movimientos.length === 0 ? (
        <p>No tienes movimientos todavía.</p>
      ) : movimientosFiltrados.length === 0 ? (
        <p>No se encontraron movimientos.</p>
      ) : (
        <ul className="historial">
          {movimientosFiltrados.map((mov) => {
            const recibido = mov.receptorUid === perfil?.uid;

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
  );
}

export default Historial;
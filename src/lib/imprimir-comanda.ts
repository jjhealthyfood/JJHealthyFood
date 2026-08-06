export function imprimirComanda() {
  const tituloOriginal = document.title;
  const ahora = new Date();

  const fecha = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ahora);

  const hora = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(ahora)
    .replace(":", "-");

  document.title = `JJ Healthy Food - Administración ${fecha} ${hora}`;

  // En iOS Safari, "afterprint" dispara casi al instante (no espera a que
  // se guarde el PDF desde la hoja de compartir), asi que restaurar el
  // titulo ahi mismo revierte el nombre antes de que el telefono lo use
  // para el archivo. "focus" es mas confiable: se dispara cuando la
  // ventana recupera el foco al cerrar el dialogo/hoja de impresion, ya
  // sea en desktop o en iOS, y para ese momento el nombre ya se uso.
  function restaurarTitulo() {
    document.title = tituloOriginal;
    window.removeEventListener("focus", restaurarTitulo);
  }
  window.addEventListener("focus", restaurarTitulo, { once: true });

  window.print();
}

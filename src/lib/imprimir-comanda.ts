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

  function restaurarTitulo() {
    document.title = tituloOriginal;
    window.removeEventListener("afterprint", restaurarTitulo);
  }
  window.addEventListener("afterprint", restaurarTitulo);

  window.print();
}

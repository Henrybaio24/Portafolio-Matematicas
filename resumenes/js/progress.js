/* ============================================================
   PROGRESS.JS — Barra de progreso de lectura
   Compartido por todos los unidad-N.html. Requiere que exista
   un <div class="u1-progress-bar" id="progress-bar"></div>
   justo después de <body>.
   ============================================================ */

(function () {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;

  function actualizarProgreso() {
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progreso = alturaTotal > 0
      ? (window.scrollY / alturaTotal) * 100
      : 0;
    bar.style.width = Math.min(progreso, 100) + '%';
  }

  window.addEventListener('scroll', actualizarProgreso, { passive: true });
  window.addEventListener('resize', actualizarProgreso);
  actualizarProgreso();
})();
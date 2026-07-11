/* ============================================================
   SCROLL_BUTTON.JS — Controla visibilidad del botón "Volver arriba"
   ============================================================ */

const BOTON_ID = 'btn-volver-arriba';
let boton = null;

export function initScrollButton() {
  boton = document.getElementById(BOTON_ID);
  if (!boton) return;

  boton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', updateVisibility, { passive: true });
  updateVisibility();
}

export function destroyScrollButton() {
  window.removeEventListener('scroll', updateVisibility);
}

export function hideScrollButton() {
  if (!boton) return;
  boton.classList.add('is-hidden-by-modal');
  boton.classList.remove('is-visible');
}

export function showScrollButton() {
  if (!boton) return;
  boton.classList.remove('is-hidden-by-modal');
  updateVisibility();
}

function updateVisibility() {
  if (!boton || boton.classList.contains('is-hidden-by-modal')) return;

  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const umbral = 300;

  if (scrollY > umbral) {
    boton.classList.add('is-visible');
  } else {
    boton.classList.remove('is-visible');
  }
}
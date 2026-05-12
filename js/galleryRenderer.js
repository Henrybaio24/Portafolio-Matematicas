/* ============================================================
   GALLERY_RENDERER.JS — Renderizado de tarjetas en la galería
   ============================================================ */
import { buildCard } from './uiTemplates.js';
import { mostrarEstado, limpiarEstados } from './uiState.js';

const TIMEOUT_IFRAME = 8000; // ms — espera antes de aplicar fallback

/* ── Fallback para iframes que no cargan a tiempo ─────────────
   Misma lógica del proyecto de referencia:
   1. Espera 8s
   2. Si no cargó → intenta thumbnail de Drive
   3. Si esa imagen también falla → icono SVG genérico
   ─────────────────────────────────────────────────────────── */
function initIframeFallback(imageZone) {
  const iframe   = imageZone.querySelector('.gallery-card__iframe-thumb');
  const skeleton = imageZone.querySelector('.gallery-card__skeleton');
  const fileId   = imageZone.dataset.fileId;
  const tipo     = imageZone.dataset.tipo;

  if (!iframe) return;

  let loaded = false;

  /* Iframe cargó a tiempo → quita el skeleton */
  iframe.addEventListener('load', () => {
    loaded = true;
    if (skeleton) {
      skeleton.style.opacity = '0';
      setTimeout(() => skeleton?.remove(), 400);
    }
  }, { once: true });

  /* Timeout: si no cargó en 8s → fallback */
  setTimeout(() => {
    if (loaded) return;

    const label = tipo === 'grupal' ? 'Grupal' : 'Individual';
    const svgIcono = `
      <div class="gallery-card__fallback-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span>${label}</span>
      </div>`;

    if (fileId && skeleton) {
      /* Intento 1: thumbnail pública de Drive */
      skeleton.innerHTML = `
        <img
          src="https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300"
          alt=""
          style="width:100%;height:100%;object-fit:cover;"
          onerror="this.parentElement.innerHTML='${svgIcono.replace(/'/g, "\\'").replace(/\n\s*/g, '')}';this.parentElement.style.display='flex';">`;
      skeleton.style.opacity  = '1';
      skeleton.style.overflow = 'hidden';
    } else if (skeleton) {
      /* Sin fileId → icono genérico directo */
      skeleton.innerHTML      = svgIcono;
      skeleton.style.opacity  = '1';
      skeleton.style.display  = 'flex';
      skeleton.style.alignItems    = 'center';
      skeleton.style.justifyContent = 'center';
    }

    /* Oculta el iframe fallido */
    iframe.style.opacity = '0';

  }, TIMEOUT_IFRAME);
}

/* ── Renderiza la lista completa de tareas ──────────────────── */
export function renderTareas(tareas) {
  const ul   = document.getElementById('tareas-gallery');
  const body = ul?.closest('.modal-body');
  if (!ul || !body) return;

  limpiarEstados();

  if (tareas.length === 0) {
    ul.innerHTML = '';
    mostrarEstado('vacio');
    return;
  }

  ul.innerHTML = tareas.map(t => buildCard(t)).join('');

  /* Inicia fallback para cada card que tenga iframe de thumbnail */
  ul.querySelectorAll('.gallery-card__image--thumb').forEach(zone => {
    initIframeFallback(zone);
  });
}
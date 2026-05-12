/* ============================================================
   GALLERY_RENDERER.JS — Renderizado de galería
   ============================================================ */

import { buildCard } from '../templates/uiTemplates.js';
import { mostrarEstado, limpiarEstados } from '../components/uiState.js';

const TIMEOUT_IFRAME = 8000;

/* ── Renderizado principal ────────────────────────────────── */

export function renderTareas(tareas) {
  const ul = document.getElementById('tareas-gallery');
  const body = ul?.closest('.modal-body');
  if (!ul || !body) return;

  limpiarEstados();

  if (tareas.length === 0) {
    ul.innerHTML = '';
    mostrarEstado('vacio');
    return;
  }

  ul.innerHTML = tareas.map(t => buildCard(t)).join('');
  initAllFallbacks(ul);
}

export function clearGallery() {
  const ul = document.getElementById('tareas-gallery');
  if (ul) ul.innerHTML = '';
}

/* ── Fallback de iframes (delegado desde iframeManager) ───── */

function initAllFallbacks(container) {
  container.querySelectorAll('.gallery-card__image--thumb').forEach(zone => {
    initIframeFallback(zone);
  });
}

function initIframeFallback(imageZone) {
  const iframe = imageZone.querySelector('.gallery-card__iframe-thumb');
  const skeleton = imageZone.querySelector('.gallery-card__skeleton');
  const fileId = imageZone.dataset.fileId;
  const tipo = imageZone.dataset.tipo;

  if (!iframe) return;

  let loaded = false;

  // Iframe cargó a tiempo
  iframe.addEventListener('load', () => {
    loaded = true;
    if (skeleton) {
      skeleton.style.opacity = '0';
      setTimeout(() => skeleton?.remove(), 400);
    }
  }, { once: true });

  // Timeout fallback
  setTimeout(() => {
    if (loaded) return;
    applyFallback(skeleton, fileId, tipo);
    iframe.style.opacity = '0';
  }, TIMEOUT_IFRAME);
}

function applyFallback(skeleton, fileId, tipo) {
  if (!skeleton) return;

  const label = tipo === 'grupal' ? 'Grupal' : 'Individual';
  const svgIcono = createFallbackIcon(label);

  if (fileId) {
    // Intento 1: thumbnail de Drive
    const thumbUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`;
    skeleton.innerHTML = `
      <img
        src="${thumbUrl}"
        alt=""
        style="width:100%;height:100%;object-fit:cover;"
        onerror="this.onerror=null;this.parentElement.innerHTML='${svgIcono.replace(/'/g, "\\'")}';this.parentElement.style.display='flex';">`;
    skeleton.style.opacity = '1';
    skeleton.style.overflow = 'hidden';
  } else {
    // Sin fileId → icono genérico
    skeleton.innerHTML = svgIcono;
    skeleton.style.opacity = '1';
    skeleton.style.display = 'flex';
    skeleton.style.alignItems = 'center';
    skeleton.style.justifyContent = 'center';
  }
}

function createFallbackIcon(label) {
  return `
    <div class="gallery-card__fallback-icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="1.5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      <span>${label}</span>
    </div>`;
}
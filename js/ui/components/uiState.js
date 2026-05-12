/* ============================================================
   UI_STATE.JS — Gestión de estados de UI (cargando, vacío, error)
   ============================================================ */

import { UI_STATES } from '../../data/config.js';

// Referencias DOM cacheadas
let galleryElements = null;

function getGalleryElements() {
  if (!galleryElements) {
    const ul = document.getElementById('tareas-gallery');
    const body = ul?.closest('.modal-body');
    galleryElements = { ul, body };
  }
  return galleryElements;
}

// Invalidar cache cuando el DOM cambia (ej: hot reload)
export function invalidateGalleryCache() {
  galleryElements = null;
}

export function mostrarEstado(tipo, customState = null) {
  const { ul, body } = getGalleryElements();
  if (!body) return;

  limpiarEstados();

  if (!tipo) return;

  if (ul) ul.innerHTML = '';

  const estado = customState || UI_STATES[tipo];
  if (!estado) return;

  const html = buildEmptyStateHTML(estado);
  body.insertAdjacentHTML('beforeend', html);
}

export function limpiarEstados() {
  const { body } = getGalleryElements();
  body?.querySelectorAll('.gallery-empty').forEach(el => el.remove());
}

/* ── Builder interno (antes estaba en uiTemplates, causaba dependencia circular) ── */

function buildEmptyStateHTML({ icon, title, desc, spin }) {
  return `
    <div class="gallery-empty">
      <div class="gallery-empty__icon${spin ? ' gallery-empty__icon--spin' : ''}"
           aria-hidden="true">
        ${icon}
      </div>
      <p class="gallery-empty__title">${title}</p>
      ${desc ? `<p class="gallery-empty__desc">${desc}</p>` : ''}
    </div>`;
}
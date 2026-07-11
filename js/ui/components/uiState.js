/* ============================================================
   UI_STATE.JS — Gestión de estados de UI (cargando, vacío, error)
   Soporta múltiples galerías (tareas, recursos, …) por galleryId.
   ============================================================ */

import { UI_STATES } from '../../data/config.js';

// Referencias DOM cacheadas por galería
const galleryCache = new Map();

// Mapa de galería → grupo de textos en UI_STATES (config.js)
const GRUPO_POR_GALERIA = {
  'tareas-gallery': 'tareas',
  'recursos-gallery': 'recursos'
};

function getGalleryElements(galleryId) {
  if (!galleryCache.has(galleryId)) {
    const ul = document.getElementById(galleryId);
    const body = ul?.closest('.modal-body');
    galleryCache.set(galleryId, { ul, body });
  }
  return galleryCache.get(galleryId);
}

// Invalidar cache cuando el DOM cambia (ej: hot reload)
export function invalidateGalleryCache(galleryId) {
  if (galleryId) {
    galleryCache.delete(galleryId);
  } else {
    galleryCache.clear();
  }
}

export function mostrarEstado(galleryId, tipo, customState = null) {
  const { ul, body } = getGalleryElements(galleryId);
  if (!body) return;

  limpiarEstados(galleryId);

  if (!tipo) return;

  if (ul) ul.innerHTML = '';

  const grupo = GRUPO_POR_GALERIA[galleryId] || 'tareas';
  const estado = customState || UI_STATES[grupo]?.[tipo];
  if (!estado) return;

  const html = buildEmptyStateHTML(estado);
  body.insertAdjacentHTML('beforeend', html);
}

export function limpiarEstados(galleryId) {
  const { body } = getGalleryElements(galleryId);
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

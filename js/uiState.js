/* ============================================================
   UI_STATE.JS — Mostrar/ocultar estados (cargando, error, vacío)
   ============================================================ */

import { UI_STATES } from './config.js';
import { buildEmptyState } from './uiTemplates.js';

function getGalleryElements() {
  const ul = document.getElementById('tareas-gallery');
  const body = ul?.closest('.modal-body');
  return { ul, body };
}

export function mostrarEstado(tipo) {
  const { ul, body } = getGalleryElements();
  if (!body) return;

  // Limpiar estados anteriores
  body.querySelectorAll('.gallery-empty').forEach(el => el.remove());
  
  if (!tipo) return;

  if (ul) ul.innerHTML = '';
  
  const estado = UI_STATES[tipo];
  if (estado) {
    body.insertAdjacentHTML('beforeend', buildEmptyState(estado));
  }
}

export function limpiarEstados() {
  const { body } = getGalleryElements();
  body?.querySelectorAll('.gallery-empty').forEach(el => el.remove());
}
/* ============================================================
   GALLERY_RENDERER.JS — Renderizado de galería
   Genérico: funciona para cualquier galería (tareas, recursos…)
   pasando su galleryId (id del <ul>).
   ============================================================ */

import { buildCard } from '../templates/uiTemplates.js';
import { mostrarEstado, limpiarEstados } from '../components/uiState.js';

/* ── Renderizado principal ────────────────────────────────── */

export function renderGallery(items, galleryId) {
  const ul = document.getElementById(galleryId);
  const body = ul?.closest('.modal-body');
  if (!ul || !body) return;

  limpiarEstados(galleryId);

  if (items.length === 0) {
    ul.innerHTML = '';
    mostrarEstado(galleryId, 'vacio');
    return;
  }

  ul.innerHTML = items.map(t => buildCard(t)).join('');
  initAllFallbacks(ul);
}

export function clearGallery(galleryId) {
  const ul = document.getElementById(galleryId);
  if (ul) ul.innerHTML = '';
}

/* ── Fallback de miniaturas (imagen liviana, no iframe) ───── */

function initAllFallbacks(container) {
  container.querySelectorAll('.gallery-card__image--thumb').forEach(zone => {
    initThumbFallback(zone);
  });
}

function initThumbFallback(imageZone) {
  const img = imageZone.querySelector('.gallery-card__thumb-img');
  const skeleton = imageZone.querySelector('.gallery-card__skeleton');
  const tipo = imageZone.dataset.tipo;

  if (!img) return;

  // La imagen ya cargó desde cache antes de engancharse el listener
  if (img.complete && img.naturalWidth > 0) {
    ocultarSkeleton(skeleton);
    return;
  }

  img.addEventListener('load', () => ocultarSkeleton(skeleton), { once: true });

  img.addEventListener('error', () => {
    applyFallback(skeleton, tipo);
    img.style.display = 'none';
  }, { once: true });
}

function ocultarSkeleton(skeleton) {
  if (!skeleton) return;
  skeleton.style.opacity = '0';
  setTimeout(() => skeleton?.remove(), 400);
}

function applyFallback(skeleton, tipo) {
  if (!skeleton) return;

  // La miniatura de Drive ya falló (evento "error" de la <img> principal),
  // así que aquí vamos directo al ícono genérico sin reintentar la misma URL.
  const label = getFallbackLabel(tipo);
  skeleton.innerHTML = createFallbackIcon(label);
  skeleton.style.opacity = '1';
  skeleton.style.display = 'flex';
  skeleton.style.alignItems = 'center';
  skeleton.style.justifyContent = 'center';
}

function getFallbackLabel(tipo) {
  const labels = {
    grupal: 'Grupal',
    individual: 'Individual',
    resumen: 'Resumen',
    apuntes: 'Apuntes'
  };
  return labels[tipo] || 'Individual';
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

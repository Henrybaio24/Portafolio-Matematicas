/* ============================================================
   APP_CONTROLLER.JS — Orquesta toda la aplicación.
   ============================================================ */

import { cargarTareas } from '../data/api.js';
import { initFilterBar, getCurrentFilter, filtrarTareas, subscribe as subscribeFilter } from '../ui/views/filterManager.js';
import { renderTareas, clearGallery } from '../ui/views/galleryRenderer.js';
import { initModalEvents } from '../ui/modals/modalManager.js';
import { initPdfViewer, destroyPdfViewer } from '../ui/modals/pdfViewer.js';
import { initScrollButton, destroyScrollButton } from '../ui/components/scrollButton.js';
import { mostrarEstado } from '../ui/components/uiState.js';

let todasLasTareas = [];
let unsubscribeFilter = null;

/* ── Inicialización ───────────────────────────────────────── */

export function initAppController() {
  console.log('🚀 Iniciando app...');

  initModalEvents();
  initPdfViewer();
  initScrollButton();
  unsubscribeFilter = initFilterBar('#modal-tareas .filter-bar', handleFilterChange);
  subscribeFilter(handleFilterChange);

  loadData();
}

/* ── Carga de datos ───────────────────────────────────────── */

async function loadData() {
  mostrarEstado('cargando');
  clearGallery();

  try {
    todasLasTareas = await cargarTareas();
    updateTareasCard(todasLasTareas);
    applyCurrentFilter();
  } catch (err) {
    console.error('❌ Error al cargar tareas:', err);
    mostrarEstado('error');
    updateTareasCard([]);
  }
}

/* ── Actualizar card de tareas en la portada ──────────────── */

function updateTareasCard(tareas) {
  const badge = document.querySelector('[data-tareas-badge]');
  const progress = document.querySelector('[data-tareas-progress]');
  const subtitle = document.querySelector('[data-tareas-subtitle]');

  const total = tareas.length;
  const individuales = tareas.filter(t => t.tipo === 'individual').length;
  const grupales = tareas.filter(t => t.tipo === 'grupal').length;

  if (badge) {
    badge.textContent = total === 1 ? '1 tarea' : `${total} tareas`;
  }

  if (subtitle) {
    subtitle.textContent = total === 0
      ? 'Sin tareas registradas'
      : `${individuales} individuales · ${grupales} grupales`;
  }

  if (progress) {
    const porcentaje = total > 0 ? 100 : 0;
    progress.style.width = `${porcentaje}%`;
    progress.parentElement?.setAttribute('aria-valuenow', porcentaje);
  }
}

/* ── Filtrado y renderizado ───────────────────────────────── */

function handleFilterChange(filtro) {
  const tareasFiltradas = filtrarTareas(todasLasTareas, filtro);
  renderTareas(tareasFiltradas);
}

function applyCurrentFilter() {
  const filtro = getCurrentFilter();
  handleFilterChange(filtro);
}

/* ── Cleanup ──────────────────────────────────────────────── */

export function destroyAppController() {
  if (unsubscribeFilter) {
    unsubscribeFilter();
    unsubscribeFilter = null;
  }
  destroyPdfViewer();
  destroyScrollButton();
}
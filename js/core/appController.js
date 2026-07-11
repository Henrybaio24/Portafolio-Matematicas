import { cargarTareas } from '../data/api.js';
import { createFilterManager } from '../ui/views/filterManager.js';
import { renderGallery, clearGallery } from '../ui/views/galleryRenderer.js';
import { initModalEvents } from '../ui/modals/modalManager.js';
import { initPdfViewer, destroyPdfViewer } from '../ui/modals/pdfViewer.js';
import { initScrollButton, destroyScrollButton } from '../ui/components/scrollButton.js';
import { mostrarEstado } from '../ui/components/uiState.js';

const GALLERIES = {
  tareas:   { galleryId: 'tareas-gallery',   modalId: 'tareas' },
  recursos: { galleryId: 'recursos-gallery', modalId: 'recursos' }
};

const tareasFilter = createFilterManager('todas');
const recursosFilter = createFilterManager('todos');

let tareas = [];
let recursos = [];
let tareasSearchQuery = '';
let recursosSearchQuery = '';
let unsubscribeTareasFilter = null;
let unsubscribeRecursosFilter = null;

export function initAppController() {
  console.log('🚀 Iniciando app...');

  initModalEvents();
  initPdfViewer([
    { galleryId: GALLERIES.tareas.galleryId,   modalId: GALLERIES.tareas.modalId },
    { galleryId: GALLERIES.recursos.galleryId, modalId: GALLERIES.recursos.modalId }
  ]);
  initScrollButton();
  initFooterYear();

  unsubscribeTareasFilter = tareasFilter.initFilterBar('#modal-tareas .filter-bar', handleTareasFilterChange);
  tareasFilter.subscribe(handleTareasFilterChange);

  unsubscribeRecursosFilter = recursosFilter.initFilterBar('#modal-recursos .filter-bar', handleRecursosFilterChange);
  recursosFilter.subscribe(handleRecursosFilterChange);

  initSearchInputs();

  loadData();
}

function initFooterYear() {
  const el = document.querySelector('[data-footer-year]');
  if (el) el.textContent = new Date().getFullYear();
}

async function loadData() {
  mostrarEstado(GALLERIES.tareas.galleryId, 'cargando');
  mostrarEstado(GALLERIES.recursos.galleryId, 'cargando');
  clearGallery(GALLERIES.tareas.galleryId);
  clearGallery(GALLERIES.recursos.galleryId);

  try {
    const filas = await cargarTareas();

    tareas = filas.filter(f => normalizarCategoria(f.categoria) !== 'recurso');
    recursos = filas.filter(f => normalizarCategoria(f.categoria) === 'recurso');

    updateTareasCard(tareas);
    updateRecursosCard(recursos);

    applyCurrentFilters();
  } catch (err) {
    console.error('❌ Error al cargar datos del Sheet:', err);
    mostrarEstado(GALLERIES.tareas.galleryId, 'error');
    mostrarEstado(GALLERIES.recursos.galleryId, 'error');
    updateTareasCard([]);
    updateRecursosCard([]);
  }
}

function normalizarCategoria(categoria) {
  return (categoria || 'tarea').toLowerCase().trim();
}

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

function updateRecursosCard(recursos) {
  const badge = document.querySelector('[data-recursos-badge]');
  const progress = document.querySelector('[data-recursos-progress]');
  const subtitle = document.querySelector('[data-recursos-subtitle]');

  const total = recursos.length;
  const resumenes = recursos.filter(r => r.tipo === 'resumen').length;
  const apuntes = recursos.filter(r => r.tipo === 'apuntes').length;

  if (badge) {
    badge.textContent = total === 0
      ? 'No disponible'
      : (total === 1 ? '1 recurso' : `${total} recursos`);
  }

  if (subtitle) {
    subtitle.textContent = total === 0
      ? 'Sin recursos registrados'
      : `${resumenes} resúmenes · ${apuntes} apuntes`;
  }

  if (progress) {
    const porcentaje = total > 0 ? 100 : 0;
    progress.style.width = `${porcentaje}%`;
    progress.parentElement?.setAttribute('aria-valuenow', porcentaje);
  }
}

function initSearchInputs() {
  const tareasInput = document.querySelector('[data-search="tareas"]');
  if (tareasInput) {
    tareasInput.addEventListener('input', (e) => {
      tareasSearchQuery = e.target.value.trim();
      handleTareasFilterChange(tareasFilter.getCurrentFilter());
    });
  }

  const recursosInput = document.querySelector('[data-search="recursos"]');
  if (recursosInput) {
    recursosInput.addEventListener('input', (e) => {
      recursosSearchQuery = e.target.value.trim();
      handleRecursosFilterChange(recursosFilter.getCurrentFilter());
    });
  }
}

function aplicarBusqueda(items, query) {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter(t =>
    (t.titulo || '').toLowerCase().includes(q) ||
    (t.desc || '').toLowerCase().includes(q)
  );
}

function handleTareasFilterChange(filtro) {
  const filtradas = tareasFilter.filtrar(tareas, filtro);
  renderGallery(aplicarBusqueda(filtradas, tareasSearchQuery), GALLERIES.tareas.galleryId);
}

function handleRecursosFilterChange(filtro) {
  const filtrados = recursosFilter.filtrar(recursos, filtro);
  renderGallery(aplicarBusqueda(filtrados, recursosSearchQuery), GALLERIES.recursos.galleryId);
}

function applyCurrentFilters() {
  handleTareasFilterChange(tareasFilter.getCurrentFilter());
  handleRecursosFilterChange(recursosFilter.getCurrentFilter());
}

export function destroyAppController() {
  if (unsubscribeTareasFilter) {
    unsubscribeTareasFilter();
    unsubscribeTareasFilter = null;
  }
  if (unsubscribeRecursosFilter) {
    unsubscribeRecursosFilter();
    unsubscribeRecursosFilter = null;
  }
  destroyPdfViewer();
  destroyScrollButton();
}

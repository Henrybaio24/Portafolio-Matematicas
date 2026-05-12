/* ============================================================
   FILTER_MANAGER.JS — Filtrado de tareas (desacoplado del DOM)
   ============================================================ */

const DEFAULT_FILTER = 'todas';

let currentFilter = DEFAULT_FILTER;
let subscribers = [];

/* ── API pública ──────────────────────────────────────────── */

export function filtrarTareas(tareas, filtro) {
  return filtro === DEFAULT_FILTER ? tareas : tareas.filter(t => t.tipo === filtro);
}

export function getCurrentFilter() {
  return currentFilter;
}

export function setFilter(filtro) {
  if (filtro === currentFilter) return;
  currentFilter = filtro;
  notifySubscribers();
}

export function resetFilter() {
  setFilter(DEFAULT_FILTER);
}

/* ── Patrón Observer para notificar cambios ───────────────── */

export function subscribe(callback) {
  subscribers.push(callback);
  return () => {
    subscribers = subscribers.filter(cb => cb !== callback);
  };
}

function notifySubscribers() {
  subscribers.forEach(cb => cb(currentFilter));
}

/* ── Inicialización de UI (opcional, desacoplada) ─────────── */

export function initFilterBar(containerSelector, onChange) {
  const filterBar = document.querySelector(containerSelector);
  if (!filterBar) return null;

  // Sincronizar UI con estado actual
  syncFilterUI(filterBar, currentFilter);

  // Delegación de eventos (más eficiente)
  const handler = (e) => {
    const btn = e.target.closest('.filter-tab');
    if (!btn) return;

    const filtro = btn.dataset.filter;
    setFilter(filtro);
    syncFilterUI(filterBar, filtro);
    if (onChange) onChange(filtro);
  };

  filterBar.addEventListener('click', handler);

  // Cleanup function
  return () => filterBar.removeEventListener('click', handler);
}

function syncFilterUI(filterBar, activeFilter) {
  filterBar.querySelectorAll('.filter-tab').forEach(btn => {
    const isActive = btn.dataset.filter === activeFilter;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
}
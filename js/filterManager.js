/* ============================================================
   FILTER_MANAGER.JS — Filtrado de tareas por tipo
   ============================================================ */

let currentFilter = 'todas';
let onFilterChange = null;

export function filtrarTareas(tareas, filtro) {
  return filtro === 'todas' ? tareas : tareas.filter(t => t.tipo === filtro);
}

export function getCurrentFilter() {
  return currentFilter;
}

export function initFilters(callbackOnChange) {
  onFilterChange = callbackOnChange;
  const filterBar = document.querySelector('#modal-tareas .filter-bar');
  if (!filterBar) return;

  filterBar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-tab');
    if (!btn) return;

    // Actualizar UI de tabs
    filterBar.querySelectorAll('.filter-tab').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    currentFilter = btn.dataset.filter;
    if (onFilterChange) onFilterChange(currentFilter);
  });
}

export function resetFiltersToAll() {
  const filterBar = document.querySelector('#modal-tareas .filter-bar');
  if (!filterBar) return;

  filterBar.querySelectorAll('.filter-tab').forEach(b => {
    const isAll = b.dataset.filter === 'todas';
    b.classList.toggle('active', isAll);
    b.setAttribute('aria-selected', isAll ? 'true' : 'false');
  });
  currentFilter = 'todas';
}
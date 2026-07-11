export function createFilterManager(defaultFilter = 'todas') {
  let currentFilter = defaultFilter;
  let subscribers = [];

  function filtrar(items, filtro) {
    return filtro === defaultFilter ? items : items.filter(t => t.tipo === filtro);
  }

  function getCurrentFilter() {
    return currentFilter;
  }

  function setFilter(filtro) {
    if (filtro === currentFilter) return;
    currentFilter = filtro;
    notifySubscribers();
  }

  function resetFilter() {
    setFilter(defaultFilter);
  }

  function subscribe(callback) {
    subscribers.push(callback);
    return () => {
      subscribers = subscribers.filter(cb => cb !== callback);
    };
  }

  function notifySubscribers() {
    subscribers.forEach(cb => cb(currentFilter));
  }

  function initFilterBar(containerSelector, onChange) {
    const filterBar = document.querySelector(containerSelector);
    if (!filterBar) return null;

    syncFilterUI(filterBar, currentFilter);

    const handler = (e) => {
      const btn = e.target.closest('.filter-tab');
      if (!btn) return;

      const filtro = btn.dataset.filter;
      setFilter(filtro);
      syncFilterUI(filterBar, filtro);
      if (onChange) onChange(filtro);
    };

    filterBar.addEventListener('click', handler);

    return () => filterBar.removeEventListener('click', handler);
  }

  function syncFilterUI(filterBar, activeFilter) {
    filterBar.querySelectorAll('.filter-tab').forEach(btn => {
      const isActive = btn.dataset.filter === activeFilter;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  return { filtrar, getCurrentFilter, setFilter, resetFilter, subscribe, initFilterBar };
}

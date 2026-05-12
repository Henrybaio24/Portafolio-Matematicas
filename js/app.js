/* ============================================================
   APP.JS — Punto de entrada. Coordina todos los módulos.
   ============================================================ */
import { openModal, closeModal, initModalEvents } from './modalManager.js';
import { cargarTareas }                            from './api.js';
import { renderTareas }                            from './galleryRenderer.js';
import {
  initFilters,
  filtrarTareas,
  resetFiltersToAll,
  getCurrentFilter,
} from './filterManager.js';
import { mostrarEstado } from './uiState.js';

let TAREAS_CACHE = [];

/* ══════════════════════════════════════════════════════════════
   CONTEO DINÁMICO DE TAREAS
   ══════════════════════════════════════════════════════════════ */

function actualizarConteoTareas(tareas) {
  const total        = tareas.length;
  const individuales = tareas.filter(t => t.tipo === 'individual').length;
  const grupales     = tareas.filter(t => t.tipo === 'grupal').length;
  const porcentaje   = total > 0 ? Math.round((individuales / total) * 100) : 0;

  console.log(`[Conteo] Total: ${total}, Ind: ${individuales}, Grup: ${grupales}, %: ${porcentaje}`);

  /* ── CARD PRINCIPAL ────────────────────────────────────── */

  const badge = document.querySelector('[data-tareas-badge]');
  if (badge) {
    badge.textContent = total === 0
      ? 'Sin tareas'
      : `${total} ${total === 1 ? 'tarea' : 'tareas'} · ${grupales} ${grupales === 1 ? 'grupal' : 'grupales'}`;
    badge.style.opacity = '1';
  }

  const progressFill = document.querySelector('[data-tareas-progress]');
  if (progressFill) {
    progressFill.style.width   = `${porcentaje}%`;
    progressFill.style.opacity = '1';
  }

  const progressMeter = document.querySelector('.cs-card--green .cs-progress');
  if (progressMeter) {
    progressMeter.setAttribute('aria-valuenow', porcentaje);
    progressMeter.setAttribute('aria-label', `${porcentaje}% son tareas individuales`);
  }

  /* ── MODAL DE TAREAS ───────────────────────────────────── */

  const modalSubtitle = document.querySelector('[data-tareas-subtitle]');
  if (modalSubtitle) {
    modalSubtitle.textContent = total === 0
      ? 'Sin tareas registradas'
      : `${total} ${total === 1 ? 'tarea' : 'tareas'} · ${grupales} ${grupales === 1 ? 'grupal' : 'grupales'}`;
  }

  const modalProgressFill = document.querySelector('#modal-tareas .cs-progress-fill--green');
  if (modalProgressFill) {
    modalProgressFill.style.width = `${porcentaje}%`;
  }

  const modalProgressMeter = document.querySelector('#modal-tareas .cs-progress');
  if (modalProgressMeter) {
    modalProgressMeter.setAttribute('aria-valuenow', porcentaje);
    modalProgressMeter.setAttribute('aria-label', `${porcentaje}% son tareas individuales`);
  }

  return { total, individuales, grupales, porcentaje };
}

/* ══════════════════════════════════════════════════════════════
   CERRAR TAREAS — guarda scroll y no salta al top
   ══════════════════════════════════════════════════════════════ */

let _scrollTareas = 0;

function cerrarTareas() {
  /* Guardar posición de scroll del body ANTES de cerrar */
  _scrollTareas = window.scrollY;

  closeModal('tareas');

  /* Restaurar scroll inmediatamente para que no salte */
  window.scrollTo({ top: _scrollTareas, behavior: 'instant' });
}

/* ── Bandera: el sílabo fue abierto desde una tarea ────────── */
let _silaboAbiertoDesdeTarea = false;

/* ── Abrir modal de tareas ────────────────────────────────── */
async function handleOpenTareasModal() {
  openModal('tareas');
  resetFiltersToAll();
  mostrarEstado('cargando');

  try {
    const tareas = await cargarTareas();
    TAREAS_CACHE = tareas;

    actualizarConteoTareas(tareas);
    renderTareas(filtrarTareas(TAREAS_CACHE, getCurrentFilter()));
  } catch (err) {
    mostrarEstado('error');
    TAREAS_CACHE = [];
    actualizarConteoTareas([]);
  }
}

/* ── Cambio de filtro ─────────────────────────────────────── */
function handleFilterChange(filtro) {
  renderTareas(filtrarTareas(TAREAS_CACHE, filtro));
}

/* ══════════════════════════════════════════════════════════════
   VISOR PDF — Reutiliza el modal-silabo.
   ══════════════════════════════════════════════════════════════ */

let _silaboBodyOriginal     = null;
let _silaboTitleOriginal    = '';
let _silaboSubtitleOriginal = '';

function abrirVisorPdf(pdfUrl, titulo) {
  _silaboAbiertoDesdeTarea = true;
  closeModal('tareas');

  const modalSilabo = document.getElementById('modal-silabo');
  if (!modalSilabo) return;

  const modalTitle    = modalSilabo.querySelector('.modal-title');
  const modalSubtitle = modalSilabo.querySelector('.modal-subtitle');
  const body          = document.getElementById('silabo-modal-body');
  if (!body) return;

  if (_silaboBodyOriginal === null) {
    _silaboBodyOriginal     = body.innerHTML;
    _silaboTitleOriginal    = modalTitle    ? modalTitle.textContent    : '';
    _silaboSubtitleOriginal = modalSubtitle ? modalSubtitle.textContent : '';
  }

  if (modalTitle)    modalTitle.textContent    = titulo;
  if (modalSubtitle) modalSubtitle.textContent = 'Tarea — Matemáticas IV';

  body.innerHTML = `
    <iframe
      src="${pdfUrl}"
      class="pdf-iframe"
      title="${titulo}"
      allowfullscreen
      loading="lazy">
    </iframe>`;

  openModal('silabo');
}

function restaurarSilabo() {
  if (_silaboBodyOriginal === null) return;

  const modalSilabo = document.getElementById('modal-silabo');
  if (!modalSilabo) return;

  const modalTitle    = modalSilabo.querySelector('.modal-title');
  const modalSubtitle = modalSilabo.querySelector('.modal-subtitle');
  const body          = document.getElementById('silabo-modal-body');

  if (modalTitle)    modalTitle.textContent    = _silaboTitleOriginal;
  if (modalSubtitle) modalSubtitle.textContent = _silaboSubtitleOriginal;
  if (body)          body.innerHTML            = _silaboBodyOriginal;

  _silaboBodyOriginal     = null;
  _silaboTitleOriginal    = '';
  _silaboSubtitleOriginal = '';
}

function cerrarSilabo() {
  closeModal('silabo');
  restaurarSilabo();

  if (_silaboAbiertoDesdeTarea) {
    _silaboAbiertoDesdeTarea = false;
    setTimeout(() => openModal('tareas'), 180);
  }
}

/* ── Delegación de clic/teclado en cards con PDF ─────────────*/
function initCardPdfEvents() {
  const gallery = document.getElementById('tareas-gallery');
  if (!gallery) return;

  function activarCard(target) {
    const card = target.closest('.gallery-card--clickable');
    if (!card) return;
    const url    = card.dataset.pdfUrl;
    const titulo = card.dataset.pdfTitulo;
    if (url && titulo) abrirVisorPdf(url, titulo);
  }

  gallery.addEventListener('click',   e => activarCard(e.target));
  gallery.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activarCard(e.target);
    }
  });
}

/* ── DOMContentLoaded ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  initModalEvents();

  /* ── Tareas: botón X interceptado ──────────────────────── */
  document.querySelectorAll('[data-close="tareas"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopImmediatePropagation();
      cerrarTareas();
    }, true);
  });

  /* ── Tareas: clic en overlay interceptado ──────────────── */
  const overlayTareas = document.getElementById('modal-tareas');
  if (overlayTareas) {
    overlayTareas.addEventListener('click', e => {
      if (e.target === overlayTareas) {
        e.stopImmediatePropagation();
        cerrarTareas();
      }
    }, true);
  }

  /* Sílabo: botón X */
  document.querySelectorAll('[data-close="silabo"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopImmediatePropagation();
      cerrarSilabo();
    }, true);
  });

  /* Sílabo: overlay */
  const overlaySilabo = document.getElementById('modal-silabo');
  if (overlaySilabo) {
    overlaySilabo.addEventListener('click', e => {
      if (e.target === overlaySilabo) {
        e.stopImmediatePropagation();
        cerrarSilabo();
      }
    }, true);
  }

  /* Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      e.stopImmediatePropagation();
      if (_silaboAbiertoDesdeTarea) {
        cerrarSilabo();
      } else {
        /* Guardar scroll antes de cerrar cualquier modal */
        const scrollY = window.scrollY;
        const overlayTareasOpen = document.getElementById('modal-tareas')?.classList.contains('is-open');
        
        // Cerrar todos
        document.querySelectorAll('.modal-overlay.is-open').forEach(overlay => {
          const id = overlay.dataset.modalId;
          if (id) closeModal(id);
        });

        if (overlayTareasOpen) {
          window.scrollTo({ top: scrollY, behavior: 'instant' });
        }
      }
    }
  }, true);

  /* Sílabo real */
  document.querySelectorAll('[data-modal="silabo"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopImmediatePropagation();
      _silaboAbiertoDesdeTarea = false;
      openModal('silabo');
    }, true);
  });

  /* Tareas */
  document.querySelectorAll('[data-modal="tareas"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopImmediatePropagation();
      handleOpenTareasModal();
    }, true);
  });

  /* Evaluaciones */
  document.querySelectorAll('[data-modal="evaluaciones"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopImmediatePropagation();
      openModal('evaluaciones');
    }, true);
  });

  initFilters(handleFilterChange);
  initCardPdfEvents();

  /* CARGAR CONTEO AL INICIO */
  console.log('[App] Cargando conteo inicial...');
  cargarTareas()
    .then(tareas => {
      console.log('[App] Tareas cargadas:', tareas.length);
      actualizarConteoTareas(tareas);
    })
    .catch(err => {
      console.error('[App] Error:', err);
      actualizarConteoTareas([]);
    });
});

/* ═══════════════════════════════════════════════════════
   BOTÓN "VOLVER ARRIBA" — Comportamiento
   ══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    const btnTop = document.getElementById('btn-volver-arriba');
    if (!btnTop) return;

    const SHOW_THRESHOLD = 350; // px de scroll para mostrarlo

    const toggleVisibility = () => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        if (scrollY > SHOW_THRESHOLD) {
            btnTop.classList.add('is-visible');
        } else {
            btnTop.classList.remove('is-visible');
        }
    };

    // Escuchar scroll de forma performante
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility(); // Verificar al cargar por si ya está scrolleado

    // Click → subir suavemente al inicio
    btnTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
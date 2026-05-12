/* ============================================================
   PDF_VIEWER.JS — Cierra tareas, abre sílabo con transición limpia
   ============================================================ */

import { closeModal } from './modalManager.js';
import { hideScrollButton } from '../components/scrollButton.js'; // ← NUEVO IMPORT

const GALLERY_ID = 'tareas-gallery';
const SPINNER_CLASS = 'pdf-loading-spinner';

/* ── Inicialización ───────────────────────────────────────── */

export function initPdfViewer() {
  const gallery = document.getElementById(GALLERY_ID);
  if (!gallery) {
    console.warn('pdfViewer: No se encontró #' + GALLERY_ID);
    return;
  }

  gallery.addEventListener('click', handleGalleryClick);
  gallery.addEventListener('keydown', handleGalleryKeydown);

  console.log('✅ pdfViewer inicializado');
}

export function destroyPdfViewer() {
  const gallery = document.getElementById(GALLERY_ID);
  if (!gallery) return;

  gallery.removeEventListener('click', handleGalleryClick);
  gallery.removeEventListener('keydown', handleGalleryKeydown);
}

/* ── Handlers ─────────────────────────────────────────────── */

function handleGalleryClick(e) {
  const card = e.target.closest('.gallery-card--clickable');
  if (!card) return;

  const pdfUrl = card.dataset.pdfUrl;
  if (!pdfUrl) return;

  e.preventDefault();
  e.stopPropagation();

  openPdfFromTareas(pdfUrl, card.dataset.pdfTitulo);
}

function handleGalleryKeydown(e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;

  const card = e.target.closest('.gallery-card--clickable');
  if (!card) return;

  const pdfUrl = card.dataset.pdfUrl;
  if (!pdfUrl) return;

  e.preventDefault();
  openPdfFromTareas(pdfUrl, card.dataset.pdfTitulo);
}

/* ── Cierra tareas → Prepara sílabo → Muestra PDF tarea ───── */

function openPdfFromTareas(url, title) {
  const silaboModal = document.getElementById('modal-silabo');
  const iframe = document.querySelector('#silabo-modal-body .pdf-iframe');
  const titleEl = silaboModal?.querySelector('.modal-title');
  const modalBody = document.getElementById('silabo-modal-body');

  if (!silaboModal || !iframe || !modalBody) {
    console.error('pdfViewer: No se encontró modal-silabo o sus elementos');
    return;
  }

  // 1. CERRAR modal de tareas
  closeModal('tareas');

  // 2. Preparar spinner
  const spinner = getOrCreateSpinner(modalBody);

  // 3. OCULTAR iframe, MOSTRAR spinner
  iframe.classList.add('is-loading');
  spinner.classList.add('is-active');

  // 4. Cambiar título
  if (titleEl && title) {
    titleEl.textContent = title;
  }

  // 5. Cambiar src del iframe
  iframe.src = url;

  // 6. ABRIR modal de sílabo (se ve spinner, no iframe viejo)
  silaboModal.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  // ← NUEVO: Ocultar botón volver arriba (Sílabo es modal)
  hideScrollButton();

  // 7. Cuando cargue el PDF, mostrar iframe y ocultar spinner
  const onLoad = () => {
    spinner.classList.remove('is-active');
    iframe.classList.remove('is-loading');
    iframe.removeEventListener('load', onLoad);
  };
  iframe.addEventListener('load', onLoad);

  // 8. Setup restauración al cerrar
  setupRestore(silaboModal, iframe, titleEl, spinner, modalBody, onLoad);
}

/* ── Crear spinner si no existe ───────────────────────────── */

function getOrCreateSpinner(container) {
  let spinner = container.querySelector('.' + SPINNER_CLASS);
  if (!spinner) {
    spinner = document.createElement('div');
    spinner.className = SPINNER_CLASS;
    spinner.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <span>Cargando documento...</span>
    `;
    container.appendChild(spinner);
  }
  return spinner;
}

/* ── Al cerrar PDF de tarea, volver DIRECTO a Tareas ──────── */

function setupRestore(modal, iframe, titleEl, spinner, modalBody, onLoadHandler) {
  const originalTitle = 'Sílabo — Matemáticas IV';
  const originalPdf = 'https://drive.google.com/file/d/1w0Nd4vsftWvUw5GlPORKxw0OVSemO37b/preview';
  const tareasModal = document.getElementById('modal-tareas');

  const closeBtn = modal.querySelector('[data-close="silabo"]');

  const restore = () => {
    // Limpiar onload pendiente
    iframe.removeEventListener('load', onLoadHandler);

    // CERRAR Sílabo INMEDIATAMENTE
    modal.classList.remove('is-open');

    // ABRIR Tareas
    if (tareasModal) {
      tareasModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    // ← NUEVO: Ocultar botón volver arriba (Tareas es modal)
    hideScrollButton();

    // Restaurar contenido del Sílabo en SEGUNDO PLANO
    if (titleEl) titleEl.textContent = originalTitle;
    iframe.classList.add('is-loading');
    spinner.classList.add('is-active');
    iframe.src = originalPdf;

    // Cuando cargue el Sílabo original, dejarlo listo
    const onRestoreLoad = () => {
      spinner.classList.remove('is-active');
      iframe.classList.remove('is-loading');
      iframe.removeEventListener('load', onRestoreLoad);
    };
    iframe.addEventListener('load', onRestoreLoad);

    // Limpiar listeners
    cleanup();
  };

  const outsideClick = (e) => {
    if (e.target === modal) restore();
  };

  const cleanup = () => {
    closeBtn?.removeEventListener('click', restore);
    modal.removeEventListener('click', outsideClick);
  };

  closeBtn?.addEventListener('click', restore, { once: true });
  modal.addEventListener('click', outsideClick);
}
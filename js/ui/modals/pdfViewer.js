/* ============================================================
   PDF_VIEWER.JS — Cierra la galería de origen (tareas o recursos),
   abre sílabo con transición limpia y restaura la galería de origen.
   ============================================================ */

import { closeModal } from './modalManager.js';
import { hideScrollButton } from '../components/scrollButton.js';

const SPINNER_CLASS = 'pdf-loading-spinner';

let handlersActivos = [];

/* ── Inicialización ───────────────────────────────────────── */
// configs: [{ galleryId: 'tareas-gallery', modalId: 'tareas' }, ...]

export function initPdfViewer(configs = [{ galleryId: 'tareas-gallery', modalId: 'tareas' }]) {
  handlersActivos = configs
    .map(({ galleryId, modalId }) => {
      const gallery = document.getElementById(galleryId);
      if (!gallery) {
        console.warn('pdfViewer: No se encontró #' + galleryId);
        return null;
      }

      const onClick = (e) => handleGalleryClick(e, modalId);
      const onKeydown = (e) => handleGalleryKeydown(e, modalId);

      gallery.addEventListener('click', onClick);
      gallery.addEventListener('keydown', onKeydown);

      return { gallery, onClick, onKeydown };
    })
    .filter(Boolean);

  console.log('✅ pdfViewer inicializado');
}

export function destroyPdfViewer() {
  handlersActivos.forEach(({ gallery, onClick, onKeydown }) => {
    gallery.removeEventListener('click', onClick);
    gallery.removeEventListener('keydown', onKeydown);
  });
  handlersActivos = [];
}

/* ── Handlers ─────────────────────────────────────────────── */

function handleGalleryClick(e, originModalId) {
  const card = e.target.closest('.gallery-card--clickable');
  if (!card) return;

  const pdfUrl = card.dataset.pdfUrl;
  if (!pdfUrl) return;

  e.preventDefault();
  e.stopPropagation();

  if (card.dataset.contentTipo === 'html') {
    openFullscreenFromGallery(pdfUrl, card.dataset.pdfTitulo, originModalId);
  } else {
    openPdfFromGallery(pdfUrl, card.dataset.pdfTitulo, originModalId);
  }
}

function handleGalleryKeydown(e, originModalId) {
  if (e.key !== 'Enter' && e.key !== ' ') return;

  const card = e.target.closest('.gallery-card--clickable');
  if (!card) return;

  const pdfUrl = card.dataset.pdfUrl;
  if (!pdfUrl) return;

  e.preventDefault();

  if (card.dataset.contentTipo === 'html') {
    openFullscreenFromGallery(pdfUrl, card.dataset.pdfTitulo, originModalId);
  } else {
    openPdfFromGallery(pdfUrl, card.dataset.pdfTitulo, originModalId);
  }
}

/* ── Cierra galería de origen → Prepara sílabo → Muestra PDF ── */

function openPdfFromGallery(url, title, originModalId) {
  const silaboModal = document.getElementById('modal-silabo');
  const iframe = document.querySelector('#silabo-modal-body .pdf-iframe');
  const titleEl = silaboModal?.querySelector('.modal-title');
  const modalBody = document.getElementById('silabo-modal-body');

  if (!silaboModal || !iframe || !modalBody) {
    console.error('pdfViewer: No se encontró modal-silabo o sus elementos');
    return;
  }

  // 1. CERRAR modal de origen (tareas o recursos)
  closeModal(originModalId);

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

  hideScrollButton();

  // 7. Cuando cargue el PDF, mostrar iframe y ocultar spinner
  const onLoad = () => {
    spinner.classList.remove('is-active');
    iframe.classList.remove('is-loading');
    iframe.removeEventListener('load', onLoad);
  };
  iframe.addEventListener('load', onLoad);

  // 8. Setup restauración al cerrar → vuelve al modal de ORIGEN
  setupRestore(silaboModal, iframe, titleEl, spinner, modalBody, onLoad, originModalId);
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

/* ── Al cerrar PDF, volver DIRECTO a la galería de origen ─── */

function setupRestore(modal, iframe, titleEl, spinner, modalBody, onLoadHandler, originModalId) {
  const originalTitle = 'Sílabo — Matemáticas IV';
  const originalPdf = 'https://drive.google.com/file/d/1w0Nd4vsftWvUw5GlPORKxw0OVSemO37b/preview';
  const originModal = document.getElementById('modal-' + originModalId);

  const closeBtn = modal.querySelector('[data-close="silabo"]');

  const restore = () => {
    // Limpiar onload pendiente
    iframe.removeEventListener('load', onLoadHandler);

    // CERRAR Sílabo INMEDIATAMENTE
    modal.classList.remove('is-open');

    // ABRIR galería de origen (tareas o recursos)
    if (originModal) {
      originModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

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

/* ── PANTALLA COMPLETA (recursos HTML locales) ────────────── */
// Independiente del sistema de modales: cubre TODO el viewport,
// sin cabecera/padding de modal. Solo para archivos .html propios
// (los PDF de Drive siguen usando el modal-silabo de arriba).

function openFullscreenFromGallery(url, title, originModalId) {
  const viewer = document.getElementById('fullscreen-viewer');
  const iframe = document.getElementById('fullscreen-viewer-iframe');
  const titleEl = document.getElementById('fullscreen-viewer-title');

  if (!viewer || !iframe) {
    console.error('pdfViewer: No se encontró #fullscreen-viewer');
    return;
  }

  // 1. Cerrar el modal de origen (tareas o recursos)
  closeModal(originModalId);

  // 2. Cargar contenido y título
  if (titleEl) titleEl.textContent = title || '';
  iframe.src = url;

  // 3. Mostrar a pantalla completa
  viewer.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  hideScrollButton();

  // 4. Preparar el cierre → vuelve a la galería de origen
  setupFullscreenRestore(viewer, iframe, originModalId);
}

function setupFullscreenRestore(viewer, iframe, originModalId) {
  const closeBtn = viewer.querySelector('[data-close="fullscreen"]');
  const originModal = document.getElementById('modal-' + originModalId);

  const restore = () => {
    viewer.classList.remove('is-open');
    document.body.style.overflow = 'hidden'; // el modal de origen se re-abre igual

    // Detener cualquier script/audio del recurso al cerrar
    iframe.src = 'about:blank';

    // Volver a la galería de origen
    if (originModal) {
      originModal.classList.add('is-open');
    } else {
      document.body.style.overflow = '';
    }

    hideScrollButton();
    cleanup();
  };

  const onKeydown = (e) => {
    if (e.key === 'Escape') restore();
  };

  const cleanup = () => {
    closeBtn?.removeEventListener('click', restore);
    document.removeEventListener('keydown', onKeydown);
  };

  closeBtn?.addEventListener('click', restore, { once: true });
  document.addEventListener('keydown', onKeydown);
}

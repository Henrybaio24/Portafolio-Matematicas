import { closeModal } from './modalManager.js';
import { hideScrollButton } from '../components/scrollButton.js';

const SPINNER_CLASS = 'pdf-loading-spinner';

let handlersActivos = [];

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

function openPdfFromGallery(url, title, originModalId) {
  const silaboModal = document.getElementById('modal-silabo');
  const iframe = document.querySelector('#silabo-modal-body .pdf-iframe');
  const titleEl = silaboModal?.querySelector('.modal-title');
  const modalBody = document.getElementById('silabo-modal-body');

  if (!silaboModal || !iframe || !modalBody) {
    console.error('pdfViewer: No se encontró modal-silabo o sus elementos');
    return;
  }

  closeModal(originModalId);

  const spinner = getOrCreateSpinner(modalBody);

  iframe.classList.add('is-loading');
  spinner.classList.add('is-active');

  if (titleEl && title) {
    titleEl.textContent = title;
  }

  iframe.src = url;
   
  silaboModal.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  hideScrollButton();

  const onLoad = () => {
    spinner.classList.remove('is-active');
    iframe.classList.remove('is-loading');
    iframe.removeEventListener('load', onLoad);
  };
  iframe.addEventListener('load', onLoad);

  setupRestore(silaboModal, iframe, titleEl, spinner, modalBody, onLoad, originModalId);
}

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

function setupRestore(modal, iframe, titleEl, spinner, modalBody, onLoadHandler, originModalId) {
  const originalTitle = 'Sílabo — Matemáticas IV';
  const originalPdf = 'https://drive.google.com/file/d/1w0Nd4vsftWvUw5GlPORKxw0OVSemO37b/preview';
  const originModal = document.getElementById('modal-' + originModalId);

  const closeBtn = modal.querySelector('[data-close="silabo"]');

  const restore = () => {
    iframe.removeEventListener('load', onLoadHandler);

    modal.classList.remove('is-open');

    if (originModal) {
      originModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    hideScrollButton();

    if (titleEl) titleEl.textContent = originalTitle;
    iframe.classList.add('is-loading');
    spinner.classList.add('is-active');
    iframe.src = originalPdf;

    const onRestoreLoad = () => {
      spinner.classList.remove('is-active');
      iframe.classList.remove('is-loading');
      iframe.removeEventListener('load', onRestoreLoad);
    };
    iframe.addEventListener('load', onRestoreLoad);

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

function openFullscreenFromGallery(url, title, originModalId) {
  const viewer = document.getElementById('fullscreen-viewer');
  const iframe = document.getElementById('fullscreen-viewer-iframe');
  const titleEl = document.getElementById('fullscreen-viewer-title');

  if (!viewer || !iframe) {
    console.error('pdfViewer: No se encontró #fullscreen-viewer');
    return;
  }

  closeModal(originModalId);

  if (titleEl) titleEl.textContent = title || '';
  iframe.src = url;

  viewer.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  hideScrollButton();

  setupFullscreenRestore(viewer, iframe, originModalId);
}

function setupFullscreenRestore(viewer, iframe, originModalId) {
  const closeBtn = viewer.querySelector('[data-close="fullscreen"]');
  const originModal = document.getElementById('modal-' + originModalId);

  const restore = () => {
    viewer.classList.remove('is-open');
    document.body.style.overflow = 'hidden'; 

    iframe.src = 'about:blank';

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

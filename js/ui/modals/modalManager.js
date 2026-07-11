import { hideScrollButton, showScrollButton } from '../components/scrollButton.js';

const modalesAbiertos = new Set();

export function openModal(id) {
  const overlay = document.getElementById('modal-' + id);
  if (!overlay) return;

  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  modalesAbiertos.add(id);

  hideScrollButton();

  const box = overlay.querySelector('.modal-box');
  if (box) box.focus();

  return overlay;
}

export function closeModal(id) {
  const overlay = document.getElementById('modal-' + id);
  if (!overlay) return;

  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
  modalesAbiertos.delete(id);

  if (modalesAbiertos.size === 0) {
    showScrollButton();
  }
}

export function cerrarTodosLosModales() {
  [...modalesAbiertos].forEach(id => closeModal(id));
}

export function initModalEvents() {
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal));
  });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        const id = overlay.dataset.modalId;
        if (id) closeModal(id);
      }
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      cerrarTodosLosModales();
    }
  });
}

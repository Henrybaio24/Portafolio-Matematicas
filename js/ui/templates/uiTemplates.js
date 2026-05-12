/* ============================================================
   UI_TEMPLATES.JS — Generadores de HTML puro (sin side effects)
   ============================================================ */

import { SVG_INDIVIDUAL, SVG_GRUPAL, SVG_CAL } from '../../data/config.js';

/* ── Helpers privados ─────────────────────────────────────── */

function extraerIdDrive(url) {
  if (!url) return null;
  const m1 = url.match(/\/file\/d\/([^/?#]+)/);
  if (m1) return m1[1];
  const m2 = url.match(/[?&]id=([^&]+)/);
  if (m2) return m2[1];
  return null;
}

function getTipoInfo(tipo) {
  const esGrupal = tipo === 'grupal';
  return {
    label: esGrupal ? 'Grupal' : 'Individual',
    className: esGrupal ? 'grupal' : 'individual',
    svg: esGrupal ? SVG_GRUPAL : SVG_INDIVIDUAL
  };
}

/* ── Público: utilidades de URL ───────────────────────────── */

export function convertirPdfDrive(url) {
  const id = extraerIdDrive(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : url;
}

export function getThumbnailDrive(fileId) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`;
}

export function getFileId(tarea) {
  return tarea.pdf ? extraerIdDrive(tarea.pdf) : null;
}

/* ── Público: builders de HTML ────────────────────────────── */

export function buildImageZone(tarea) {
  const fileId = getFileId(tarea);
  const tipoInfo = getTipoInfo(tarea.tipo);

  if (!fileId) {
    // Sin PDF → SVG de respaldo
    return `
      <div class="gallery-card__image" aria-hidden="true">
        ${tipoInfo.svg}
      </div>`;
  }

  const iframeSrc = convertirPdfDrive(tarea.pdf);

  return `
    <div class="gallery-card__image gallery-card__image--thumb" 
         aria-hidden="true"
         data-file-id="${fileId}" 
         data-tipo="${tarea.tipo}">

      <div class="gallery-card__skeleton"></div>

      <iframe
        class="gallery-card__iframe-thumb"
        src="${iframeSrc}"
        tabindex="-1"
        aria-hidden="true"
        loading="lazy">
      </iframe>

      <div class="gallery-card__overlay"></div>

      <div class="gallery-card__view-overlay">
        <span class="gallery-card__view-text">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Ver
        </span>
      </div>
    </div>`;
}

export function buildCard(tarea) {
  const tienePdf = Boolean(tarea.pdf && tarea.pdf.startsWith('http'));
  const pdfUrl = tienePdf ? convertirPdfDrive(tarea.pdf) : '';
  const tipoInfo = getTipoInfo(tarea.tipo);

  const cardAttrs = tienePdf
    ? `role="button" tabindex="0" aria-label="Ver PDF: ${tarea.titulo}"
       data-pdf-url="${pdfUrl}" data-pdf-titulo="${tarea.titulo}"`
    : '';

  const cardClass = tienePdf
    ? 'gallery-card gallery-card--clickable'
    : 'gallery-card';

  return `
    <li class="${cardClass}" ${cardAttrs}>
      ${buildImageZone(tarea)}
      <div class="gallery-card__body">
        <h3 class="gallery-card__title">${tarea.titulo}</h3>
        <p class="gallery-card__desc">${tarea.desc}</p>
      </div>
      <div class="gallery-card__footer">
        ${SVG_CAL}
        <time>${tarea.fecha}</time>
        <span class="gallery-card__type-tag gallery-card__type-tag--${tipoInfo.className}">
          ${tipoInfo.label}
        </span>
      </div>
    </li>`;
}

export function buildEmptyState({ icon, title, desc, spin }) {
  return `
    <div class="gallery-empty">
      <div class="gallery-empty__icon${spin ? ' gallery-empty__icon--spin' : ''}"
           aria-hidden="true">
        ${icon}
      </div>
      <p class="gallery-empty__title">${title}</p>
      ${desc ? `<p class="gallery-empty__desc">${desc}</p>` : ''}
    </div>`;
}
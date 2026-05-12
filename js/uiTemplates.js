/* ============================================================
   UI_TEMPLATES.JS — Funciones que devuelven strings HTML
   ============================================================ */
import { SVG_INDIVIDUAL, SVG_GRUPAL, SVG_CAL } from './config.js';


/* ── Extrae el FILE_ID de cualquier URL de Google Drive ──────── */
function extraerIdDrive(url) {
  if (!url) return null;
  const m1 = url.match(/\/file\/d\/([^/?#]+)/);
  if (m1) return m1[1];
  const m2 = url.match(/[?&]id=([^&]+)/);
  if (m2) return m2[1];
  return null;
}

/* ── URL embebible para el iframe del visor ─────────────────── */
export function convertirPdfDrive(url) {
  const id = extraerIdDrive(url);
  if (id) return `https://drive.google.com/file/d/${id}/preview`;
  return url;
}

/* ── Zona imagen — SOLO "Ver" al hover, sin badge de tipo ───── */
export function buildImageZone(tarea) {
  const fileId = tarea.pdf ? extraerIdDrive(tarea.pdf) : null;

  if (fileId) {
    const iframeSrc = `https://drive.google.com/file/d/${fileId}/preview`;

    return `
      <div class="gallery-card__image gallery-card__image--thumb" aria-hidden="true"
           data-file-id="${fileId}" data-tipo="${tarea.tipo}">

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

  /* Sin PDF → SVG de respaldo */
  const esGrupal = tarea.tipo === 'grupal';
  return `
    <div class="gallery-card__image" aria-hidden="true">
      ${esGrupal ? SVG_GRUPAL : SVG_INDIVIDUAL}
    </div>`;
}


/* ── Card completa — Tipo va al footer ─────────────────────── */
export function buildCard(tarea) {
  const tienePdf = Boolean(tarea.pdf && tarea.pdf.startsWith('http'));
  const pdfUrl   = tienePdf ? convertirPdfDrive(tarea.pdf) : '';
  const esGrupal = tarea.tipo === 'grupal';
  const tipoLabel = esGrupal ? 'Grupal' : 'Individual';
  const tipoClass = esGrupal ? 'grupal' : 'individual';

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
        <span class="gallery-card__type-tag gallery-card__type-tag--${tipoClass}">
          ${tipoLabel}
        </span>
      </div>
    </li>`;
}


/* ── Estado vacío / carga / error ───────────────────────────── */
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
/* ============================================================
   UI_TEMPLATES.JS — Generadores de HTML puro (sin side effects)
   ============================================================ */

import { SVG_INDIVIDUAL, SVG_GRUPAL, SVG_RESUMEN, SVG_APUNTES, SVG_CAL } from '../../data/config.js';

/* ── Helpers privados ─────────────────────────────────────── */

function extraerIdDrive(url) {
  if (!url) return null;
  const m1 = url.match(/\/file\/d\/([^/?#]+)/);
  if (m1) return m1[1];
  const m2 = url.match(/[?&]id=([^&]+)/);
  if (m2) return m2[1];
  return null;
}

const TIPO_INFO = {
  individual: { label: 'Individual', className: 'individual', svg: SVG_INDIVIDUAL },
  grupal:     { label: 'Grupal',     className: 'grupal',     svg: SVG_GRUPAL },
  resumen:    { label: 'Resumen',    className: 'resumen',    svg: SVG_RESUMEN },
  apuntes:    { label: 'Apuntes',    className: 'apuntes',    svg: SVG_APUNTES }
};

function getTipoInfo(tipo) {
  return TIPO_INFO[tipo] || TIPO_INFO.individual;
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
  const tieneContenido = Boolean(tarea.pdf && tarea.pdf.trim().length > 0);

  if (!fileId) {
    // Sin miniatura de Drive (o sin contenido) → ícono SVG de respaldo.
    // Si SÍ hay contenido (ej. un resumen HTML local, que no tiene
    // fileId de Drive), igual mostramos el overlay "Ver" porque la
    // tarjeta ES clickeable — antes se perdía justo en este caso.
    return `
      <div class="gallery-card__image" aria-hidden="true">
        ${tipoInfo.svg}
        ${tieneContenido ? buildViewOverlay() : ''}
      </div>`;
  }

  // Miniatura liviana (imagen, NO iframe del visor de PDF).
  // Cargar un iframe del visor completo por cada tarjeta era lo que
  // hacía lenta la página cuando había varios elementos: cada iframe
  // arrastra el visor de PDF entero de Drive. Una <img> con el
  // thumbnail de Drive pesa una fracción de eso.
  const thumbUrl = getThumbnailDrive(fileId);

  return `
    <div class="gallery-card__image gallery-card__image--thumb" 
         aria-hidden="true"
         data-file-id="${fileId}" 
         data-tipo="${tarea.tipo}">

      <div class="gallery-card__skeleton"></div>

      <img
        class="gallery-card__thumb-img"
        src="${thumbUrl}"
        alt=""
        tabindex="-1"
        aria-hidden="true"
        loading="lazy"
        decoding="async">

      <div class="gallery-card__overlay"></div>

      ${buildViewOverlay()}
    </div>`;
}

function buildViewOverlay() {
  return `
      <div class="gallery-card__view-overlay">
        <span class="gallery-card__view-text">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Ver
        </span>
      </div>`;
}

export function buildCard(tarea) {
  // Acepta tanto links de Drive (http...) como rutas locales a un HTML
  // propio de resumen (ej: "resumenes/unidad-1.html").
  const tieneContenido = Boolean(tarea.pdf && tarea.pdf.trim().length > 0);
  const esLinkExterno = tieneContenido && tarea.pdf.startsWith('http');
  const pdfUrl = tieneContenido
    ? (esLinkExterno ? convertirPdfDrive(tarea.pdf) : tarea.pdf.trim())
    : '';
  // 'pdf' → se abre dentro del modal (visor actual). 'html' → pantalla completa.
  const contentTipo = esLinkExterno ? 'pdf' : 'html';
  const tipoInfo = getTipoInfo(tarea.tipo);

  const cardAttrs = tieneContenido
    ? `role="button" tabindex="0" aria-label="Ver: ${tarea.titulo}"
       data-pdf-url="${pdfUrl}" data-pdf-titulo="${tarea.titulo}"
       data-content-tipo="${contentTipo}"`
    : '';

  const cardClass = tieneContenido
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
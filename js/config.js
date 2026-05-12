/* ============================================================
   CONFIG.JS — Constantes globales y SVGs de respaldo
   ============================================================ */

export const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrJF4uUEcLDRF5u0DCyg3Ttt4iA7AdWuKvo8lsz7gb8_qHAGu_DsqPjoM5WQpFDyj8NjIx5uPxlQGA/pub?gid=0&single=true&output=csv';

export const SVG_INDIVIDUAL = `
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>`;

export const SVG_GRUPAL = `
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`;

export const SVG_CAL = `
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>`;

// Estados de UI predefinidos
export const UI_STATES = {
  cargando: {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
             <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
           </svg>`,
    title: 'Cargando tareas…',
    desc: '',
    spin: true
  },
  vacio: {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
             <path d="M9 11l3 3L22 4"/>
             <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
           </svg>`,
    title: 'Aún no hay tareas',
    desc: 'Las tareas aparecerán aquí cuando haya trabajos grupales.'
  },
  error: {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
             <circle cx="12" cy="12" r="10"/>
             <line x1="12" y1="8" x2="12" y2="12"/>
             <line x1="12" y1="16" x2="12.01" y2="16"/>
           </svg>`,
    title: 'No se pudieron cargar las tareas',
    desc: 'Revisa que la URL de la Sheet esté correcta y publicada como CSV.'
  }
};
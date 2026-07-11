import { SHEET_CSV_URL } from './config.js';
import { parsearCSV } from './csvParser.js';

export async function cargarTareas() {
  try {
    const res = await fetch(SHEET_CSV_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const texto = await res.text();
    return parsearCSV(texto);
  } catch (err) {
    console.error('Error al cargar la Sheet:', err);
    throw err; 
  }
}

export function parsearCSV(texto) {
  const lineas = texto.trim().split('\n');
  if (lineas.length < 2) return [];

  const headers = lineas[0]
    .split(',')
    .map(h => h.trim().toLowerCase().replace(/\r/g, ''));

  return lineas
    .slice(1)
    .map(linea => {
      const cols = [];
      let actual = '';
      let dentroComillas = false;

      for (let i = 0; i < linea.length; i++) {
        const c = linea[i];
        if (c === '"') {
          dentroComillas = !dentroComillas;
        } else if (c === ',' && !dentroComillas) {
          cols.push(actual.trim());
          actual = '';
        } else {
          actual += c;
        }
      }
      cols.push(actual.trim());

      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = (cols[i] || '').replace(/\r/g, '').trim();
      });
      return obj;
    })
    .filter(t => t.titulo);
}

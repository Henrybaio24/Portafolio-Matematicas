# Resúmenes en HTML por unidad

Esta carpeta guarda los resúmenes que armas tú mismo en HTML (uno por unidad,
por ejemplo `unidad-1.html`, `unidad-2.html`, etc.), en vez de subir un PDF a
Drive para esos recursos.

## Cómo se conecta con el portafolio

El portafolio no distingue entre "PDF de Drive" y "HTML local": ambos casos
usan la misma columna `pdf` de tu Google Sheet. El código detecta el tipo
automáticamente:

- Si el valor empieza con `http` → se trata como link de Drive y se abre en
  el visor de PDF.
- Si el valor es una ruta relativa (no empieza con `http`) → se carga tal
  cual dentro del mismo modal, como una página HTML normal.

### Ejemplo de fila en el Sheet

| titulo              | desc                      | fecha      | tipo    | categoria | pdf                          |
|----------------------|---------------------------|------------|---------|-----------|-------------------------------|
| Resumen — Unidad 1   | Límites y continuidad     | 2026-03-10 | resumen | recurso   | `resumenes/unidad-1.html`     |
| Resumen — Unidad 2   | Derivadas                 | 2026-04-02 | resumen | recurso   | `resumenes/unidad-2.html`     |

Con eso, la tarjeta en "Otros Recursos" queda clickeable y, al hacer clic,
se abre el modal mostrando ese HTML en vez de un PDF — sin tocar código.

## Notas

- La miniatura de la tarjeta mostrará el ícono genérico de "Resumen" (no hay
  miniatura de Drive posible para un HTML local), lo cual es normal.
- El archivo `unidad-1.html` en esta carpeta es solo una plantilla de
  ejemplo con la paleta de colores del portafolio: copia esa estructura
  para tus otras unidades.
- Las rutas son relativas a la raíz del sitio publicado (donde vive
  `index.html`). Si mueves la carpeta `resumenes/`, actualiza la ruta en el
  Sheet también.

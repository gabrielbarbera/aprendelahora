# La hora, paso a paso

Aplicación infantil, táctil y sin dependencias para aprender a leer un reloj analógico, con especial atención a “menos cuarto”.

## Probarla en el ordenador

Desde esta carpeta:

```powershell
python -m http.server 4173
```

Después abre `http://localhost:4173`.

## Usarla en el móvil

La carpeta es un sitio estático y se puede publicar tal cual en cualquier alojamiento web. Al abrir la URL publicada en el móvil, se puede añadir a la pantalla de inicio desde el menú del navegador. Después de la primera visita funciona también sin conexión.

## Actividades

- **Explora:** mueve cualquiera de las dos agujas o avanza en bloques de 15 minutos.
- **Aprende:** recorre lecciones guiadas desde las horas en punto hasta los minutos de cinco en cinco.
- **Practica:** alterna entre colocar agujas, escuchar, elegir una frase, relacionar la hora digital y corregir un reloj.

## Recorrido y progreso

- Cinco niveles progresivos: en punto, y media, y cuarto, menos cuarto y gran mezcla.
- Desbloqueo de niveles con cuatro aciertos.
- Estrellas, rachas y pegatinas sin cronómetros ni penalizaciones.
- Pistas adaptadas al concepto que necesita refuerzo.
- Panel para adultos con una recomendación de práctica.
- Nombre, personaje, colores, voz, pistas y formatos de 12 o 24 horas configurables.
- Progreso guardado únicamente en el dispositivo mediante almacenamiento local.

No recoge datos, no usa publicidad y no necesita crear una cuenta.

## Publicación en Vercel

El proyecto es un sitio estático y no necesita proceso de compilación ni variables de entorno.

1. Importa `gabrielbarbera/aprendelahora` desde el panel de Vercel.
2. Selecciona **Other** como framework.
3. Deja vacíos los comandos de build e instalación.
4. Usa `.` como directorio de salida y publica.

También se puede vincular y publicar desde esta carpeta:

```powershell
vercel link
vercel --prod
```

`vercel.json` configura las cabeceras de la PWA y evita que el navegador conserve una versión antigua del service worker.

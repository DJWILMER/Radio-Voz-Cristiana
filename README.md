# Radio Voz Cristiana — PWA

Aplicación web progresiva para escuchar **Radio Voz Cristiana** en vivo desde móvil, tablet o computadora.

## Funciones

- Reproductor de streaming en vivo.
- Instalación como aplicación desde Chrome, Edge, Android o iOS.
- Service Worker con shell cacheado para abrir la app sin conexión.
- Pantalla offline cuando no hay internet.
- Historial de canciones, temas visuales, notificaciones y enlaces sociales.

## Publicación

La aplicación debe servirse por **HTTPS** (GitHub Pages funciona correctamente). El Service Worker no funciona desde `file://`.

1. Abre el sitio publicado por HTTPS.
2. Espera a que cargue completamente.
3. Usa **Instalar App** dentro del menú o el botón de instalación del navegador.

El streaming y la metadata no se cachean: necesitan conexión para mantenerse en vivo. La pantalla y los recursos de la aplicación sí quedan disponibles offline.

# Inversión Argentina API

Backend seguro para conectar Inversión Argentina Lab con Claude mediante Vercel.

## Subir a GitHub

1. Crear un repositorio nuevo llamado `inversion-argentina-api`.
2. Subir todos los archivos de esta carpeta, manteniendo la carpeta `api`.
3. No subir ninguna clave real. `.env.example` contiene solo un ejemplo.

## Publicar en Vercel

1. En Vercel, seleccionar **Add New > Project**.
2. Importar el repositorio `inversion-argentina-api` desde GitHub.
3. En **Environment Variables**, agregar:
   - Nombre: `ANTHROPIC_API_KEY`
   - Valor: la API key real de Anthropic.
   - Entornos: Production, Preview y Development.
4. Presionar **Deploy**.

El endpoint final será parecido a:

`https://inversion-argentina-api.vercel.app/api/claude`

## Comprobar el servicio

Abrir en el navegador:

`https://TU-PROYECTO.vercel.app/api/claude`

Si está correctamente configurado devolverá:

```json
{"ok":true,"service":"inversion-argentina-claude"}
```

## Conectar la app

Una vez publicado, copiar la URL exacta del proyecto Vercel y reemplazar en Inversión Argentina Lab:

```js
fetch("https://TU-PROYECTO.vercel.app/api/claude", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ message, context, history })
})
```

La API solo acepta solicitudes desde:

`https://inversion-argentina-lab.sebas937873.chatgpt.site`

## Seguridad

- La API key permanece únicamente en Vercel.
- Nunca debe colocarse en el HTML ni subirse a GitHub.
- El backend limita el tamaño de mensajes y el origen permitido.
- Claude realiza análisis educativo y no ejecuta órdenes financieras.

// Guardado en la nube de Inversión Lab (cartera simulada, robots, bots, diario, ajustes).
// Usa Supabase desde el servidor: la clave nunca llega al navegador.
// Variables en Vercel: SUPABASE_URL, SUPABASE_SERVICE_KEY e ILAB_CODIGO (código que se carga en la app).
// Tabla: ilab_estado (ver supabase.sql). Solo guarda datos de práctica: nada de claves ni datos bancarios.

const MAX_BYTES = 900_000;

function json(res, status, data) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).send(JSON.stringify(data));
}

function mismoOrigen(req) {
  const origin = req.headers.origin || "";
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (!mismoOrigen(req)) return json(res, 403, { error: "Origen no autorizado." });

  const url = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = String(process.env.SUPABASE_SERVICE_KEY || "").trim();
  const codigo = String(process.env.ILAB_CODIGO || "").trim();
  if (!url || !key || !codigo) {
    return json(res, 503, { error: "Falta configurar el guardado en la nube en Vercel.", configurado: false });
  }

  const enviado = String(req.headers["x-ilab-codigo"] || "");
  if (enviado.length !== codigo.length || enviado !== codigo) {
    return json(res, 401, { error: "Código de sincronización incorrecto." });
  }

  const base = `${url}/rest/v1/ilab_estado`;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

  try {
    if (req.method === "GET") {
      const r = await fetch(`${base}?id=eq.principal&select=datos,actualizado`, { headers });
      if (!r.ok) throw new Error(`Supabase respondió ${r.status}`);
      const filas = await r.json();
      return json(res, 200, filas[0] || { datos: null, actualizado: null });
    }

    if (req.method === "PUT") {
      const cuerpo = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
      if (cuerpo.length > MAX_BYTES) return json(res, 413, { error: "Datos demasiado grandes." });
      const datos = typeof req.body === "string" ? JSON.parse(req.body).datos : (req.body || {}).datos;
      if (!datos || typeof datos !== "object") return json(res, 400, { error: "Faltan los datos." });
      const actualizado = new Date().toISOString();
      const r = await fetch(base, {
        method: "POST",
        headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ id: "principal", datos, actualizado }),
      });
      if (!r.ok) throw new Error(`Supabase respondió ${r.status}`);
      return json(res, 200, { ok: true, actualizado });
    }

    return json(res, 405, { error: "Método no permitido." });
  } catch (e) {
    return json(res, 502, { error: e instanceof Error ? e.message : "No se pudo guardar." });
  }
}

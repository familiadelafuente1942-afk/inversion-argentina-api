// Proxy de datos de mercado para Inversión Lab.
// - Acciones argentinas y CEDEARs: data912.com (público, datos educativos, no tiempo real).
// - Velas de cripto: data-api.binance.vision (respaldo si el navegador no llega a api.binance.com).
// Solo lectura: no maneja claves ni ejecuta operaciones.

const PANELES = new Set(["arg_stocks", "arg_cedears", "mep", "ccl", "arg_bonds"]);
const CLASES = new Set(["stocks", "cedears", "bonds"]);
const INTERVALOS = new Set(["1h", "4h", "1d"]);

function json(res, status, data, cache = 300) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", `s-maxage=${cache}, stale-while-revalidate=600`);
  return res.status(status).send(JSON.stringify(data));
}

async function traer(url) {
  const r = await fetch(url, { headers: { accept: "application/json" } });
  const texto = await r.text();
  if (!r.ok) throw new Error(`La fuente respondió ${r.status}`);
  try {
    return JSON.parse(texto);
  } catch {
    throw new Error("La fuente devolvió datos no válidos");
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Método no permitido." }, 0);

  const q = req.query || {};
  const tipo = String(q.tipo || "");

  try {
    if (tipo === "live") {
      const panel = String(q.panel || "");
      if (!PANELES.has(panel)) return json(res, 400, { error: "Panel no válido." }, 0);
      return json(res, 200, await traer(`https://data912.com/live/${panel}`), 120);
    }

    if (tipo === "hist") {
      const clase = String(q.clase || "");
      const ticker = String(q.ticker || "").toUpperCase();
      if (!CLASES.has(clase) || !/^[A-Z0-9.]{1,12}$/.test(ticker)) {
        return json(res, 400, { error: "Ticker o clase no válidos." }, 0);
      }
      return json(res, 200, await traer(`https://data912.com/historical/${clase}/${ticker}`), 1800);
    }

    if (tipo === "klines") {
      const symbol = String(q.symbol || "").toUpperCase();
      const interval = String(q.interval || "1d");
      const limit = Math.min(1000, Math.max(1, parseInt(q.limit || "500", 10) || 500));
      if (!/^[A-Z0-9]{5,15}$/.test(symbol) || !INTERVALOS.has(interval)) {
        return json(res, 400, { error: "Par o intervalo no válidos." }, 0);
      }
      let url = `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
      if (q.startTime && /^\d{10,14}$/.test(String(q.startTime))) url += `&startTime=${q.startTime}`;
      return json(res, 200, await traer(url), interval === "1d" ? 900 : 300);
    }

    return json(res, 400, { error: "Indicá tipo=live, hist o klines." }, 0);
  } catch (e) {
    return json(res, 502, { error: e instanceof Error ? e.message : "No se pudo traer el dato." }, 0);
  }
}

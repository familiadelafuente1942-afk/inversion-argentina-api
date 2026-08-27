const ALLOWED_ORIGINS = new Set([
  "https://inversion-argentina-lab.sebas937873.chatgpt.site",
]);

const SYSTEM_PROMPT = `Sos el asistente educativo de Inversión Argentina Lab para Sebastián.
Respondé en español rioplatense, con lenguaje claro y directo.
Separá hechos, interpretación y riesgos.
Nunca prometas rentabilidad ni presentes una inferencia como certeza.
No des órdenes personalizadas de compra o venta.
Cuando falten datos actuales, decilo explícitamente.`;

function setCors(req, res) {
  const origin = req.headers.origin || "";

  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function cleanHistory(value) {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-8)
    .map((item) => ({
      role: item?.role === "assistant" ? "assistant" : "user",
      content: String(item?.content || "").slice(0, 2500),
    }))
    .filter((item) => item.content);
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const origin = req.headers.origin || "";

  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return res.status(403).json({
      error: "Origen no autorizado.",
    });
  }

  const apiKey = String(
    process.env.ANTHROPIC_API_KEY || ""
  ).trim();

  if (!apiKey) {
    return res.status(503).json({
      error: "Falta configurar ANTHROPIC_API_KEY en Vercel.",
    });
  }

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      service: "inversion-argentina-claude",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido.",
    });
  }

  try {
    const message = String(
      req.body?.message || ""
    ).trim().slice(0, 2500);

    const context = String(
      req.body?.context || ""
    ).slice(0, 5000);

    const history = cleanHistory(req.body?.history);

    if (!message) {
      return res.status(400).json({
        error: "Escribí una consulta.",
      });
    }

    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-5",
          max_tokens: 900,
          thinking: {
            type: "disabled",
          },
          system:
            SYSTEM_PROMPT +
            (context
              ? `\n\nDatos actuales provistos por la app:\n${context}`
              : ""),
          messages: [
            ...history,
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    const raw = await response.text();
    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(502).json({
        error:
          "Anthropic devolvió una respuesta no válida.",
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Claude no pudo responder.",
      });
    }

    const answer = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text || "")
      .join("\n")
      .trim();

    return res.status(200).json({
      answer:
        answer ||
        "Claude no devolvió una respuesta de texto.",
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "No se pudo conectar con Claude.",
    });
  }
}

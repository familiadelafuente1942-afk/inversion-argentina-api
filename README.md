# Inversión Lab (NEXO)

Laboratorio personal de paper trading de Sebastián: acciones argentinas, CEDEARs y cripto. Mismo entorno visual que NEXO 2.

## Qué tiene
- **Inicio:** cartera simulada vs. mantener BTC, resultado de los bots reales, señales del día y tendencia por sector.
- **Mercado:** BTC, ETH, SOL, YPF, Vista, Pampa, TGS, Central Puerto, Transener, Edenor, Mercado Libre y Globant. Detalle con gráfico, media de 20 días y niveles de compra por tramos.
- **Laboratorio:**
  - Fábrica de robots: genera ~340 reglas por activo y temporalidad (cruce de medias, ruptura, RSI, baja/alza), las prueba con velas de Binance (70% entrenamiento / 30% validación), filtra por robustez y deja adoptarlas en papel con señal en vivo.
  - Simulador de Bot de Grid de Binance spot con velas reales por hora (prueba 9 configuraciones).
  - Regla baja/alza (−3% por tramo, +5% de salida) probada sobre cualquier activo y período.
  - Seguimiento semanal de los 3 bots reales, con regla de corte en −15%.
  - Checklist de memecoins.
  - Ajustes y respaldo (exportar/importar).
- **Cartera:** compras y ventas simuladas en pesos y USDT, con comisiones y diario de decisiones.
- **Socio IA:** chat con Claude que recibe señales, tendencias, cartera y bots.

## Archivos
- `index.html`: la app completa.
- `api/mercado.js`: datos de mercado (data912 para Argentina; Binance como respaldo de velas).
- `api/claude.js`: chat con Claude. Acepta pedidos desde el mismo dominio y desde la app anterior.
- `manifest.webmanifest`, `icon-*.png`: instalación en el celular.

## Vercel
Variable necesaria para el chat: `ANTHROPIC_API_KEY` (Production, Preview y Development).

## Importante
Herramienta educativa: no ejecuta operaciones reales ni guarda claves de Binance. Los precios argentinos pueden tener demora. Los datos de la app se guardan en el navegador; usar Exportar respaldo para pasarlos a otro dispositivo.

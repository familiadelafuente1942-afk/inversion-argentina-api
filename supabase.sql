-- Inversión Lab: tabla de guardado en la nube.
-- Solo la usa el servidor (api/datos.js) con la clave de servicio.
-- RLS activado y sin políticas: nadie puede leerla ni escribirla desde el navegador.
create table if not exists public.ilab_estado (
  id text primary key,
  datos jsonb not null,
  actualizado timestamptz not null default now()
);
alter table public.ilab_estado enable row level security;

-- Guarda la fecha real de retiro/entrega (no solo el dia de la semana),
-- calculada al momento de crear el pedido con la misma logica que ya
-- usa el wizard para mostrarla en el resumen y en WhatsApp. Sin esto,
-- un pedido con dia_entrega = 'domingo' es ambiguo: no se puede saber
-- si es para este domingo o el de la semana siguiente (cuando la
-- clienta pidio fuera del horario normal y eligio "programar para la
-- proxima semana").

alter table public.pedidos
  add column if not exists fecha_entrega date;

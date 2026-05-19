VIVI-OLIVE - App web con Supabase

FUNCIONES:
- Registro diario identificable por codigo de paciente.
- Ejercicio, programa completo/parcial, porcentaje, dolor, cansancio, AOVE y comentarios.
- Guardado real en Supabase en la tabla records.
- Panel profesional con codigo: profesional
- Exportacion CSV para abrir en Excel, SPSS o R.

VARIABLES DE ENTORNO NECESARIAS EN VERCEL:
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

COLUMNAS NECESARIAS EN SUPABASE, TABLA records:
- id: int8, primary key, generated automatically
- created_at: timestamptz, default now()
- record_date: date
- patient_code: text
- exercise_done: bool
- completed_program: bool
- completion_percentage: int8
- pain: int8
- fatigue: int8
- olive_tablespoons: int8
- olive_ml: int8
- comments: text

Para empezar rapido, RLS puede estar desactivado. Para uso real con pacientes, revisar RGPD, seguridad y politicas de acceso.

-- Migration: Create logs_atividades table for activity tracking
-- This table stores activity logs for the admin dashboard

CREATE TABLE IF NOT EXISTS public.logs_atividades (
  id_log bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  acao text NOT NULL,
  descricao text NOT NULL,
  usuario_tipo text,
  usuario_email text,
  entidade_tipo text,
  entidade_id bigint,
  dados_adicionais jsonb,
  CONSTRAINT logs_atividades_pkey PRIMARY KEY (id_log)
);

-- Create index for faster queries on created_at (for recent logs)
CREATE INDEX IF NOT EXISTS idx_logs_atividades_created_at ON public.logs_atividades(created_at DESC);

-- Create index for filtering by action type
CREATE INDEX IF NOT EXISTS idx_logs_atividades_acao ON public.logs_atividades(acao);

-- Create index for filtering by entity
CREATE INDEX IF NOT EXISTS idx_logs_atividades_entidade ON public.logs_atividades(entidade_tipo, entidade_id);

-- Grant permissions (adjust as needed for your Supabase setup)
-- ALTER TABLE public.logs_atividades ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (uncomment and adjust as needed):
-- CREATE POLICY "Allow authenticated users to read logs"
--   ON public.logs_atividades
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- CREATE POLICY "Allow authenticated users to insert logs"
--   ON public.logs_atividades
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (true);

COMMENT ON TABLE public.logs_atividades IS 'Activity logs for tracking system events and displaying on admin dashboard';
COMMENT ON COLUMN public.logs_atividades.acao IS 'Type of action: aluno_criado, turma_criada, presenca_registrada, etc.';
COMMENT ON COLUMN public.logs_atividades.descricao IS 'Human-readable description of the activity';
COMMENT ON COLUMN public.logs_atividades.usuario_tipo IS 'Type of user who performed the action: admin, docente, responsavel';
COMMENT ON COLUMN public.logs_atividades.usuario_email IS 'Email of the user who performed the action';
COMMENT ON COLUMN public.logs_atividades.entidade_tipo IS 'Type of entity affected: aluno, turma, presenca, etc.';
COMMENT ON COLUMN public.logs_atividades.entidade_id IS 'ID of the affected entity';
COMMENT ON COLUMN public.logs_atividades.dados_adicionais IS 'Additional data in JSON format';

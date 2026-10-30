-- Solicitações recebidas pelo callback assinado da Meta.
-- A tabela guarda apenas o identificador Meta necessário para conferência manual;
-- não exclui contas, perfis ou progresso automaticamente.
CREATE TABLE IF NOT EXISTS public.facebook_data_deletion_requests (
  confirmation_code TEXT PRIMARY KEY
    CHECK (confirmation_code ~ '^[A-F0-9]{32}$'),
  meta_user_id TEXT NOT NULL
    CHECK (meta_user_id ~ '^[0-9]{1,64}$'),
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'in_review', 'completed', 'action_required')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.facebook_data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Somente o backend Vercel com a chave service role pode registrar/consultar
-- pedidos. O identificador Meta nunca fica acessível aos papéis do navegador.
REVOKE ALL ON TABLE public.facebook_data_deletion_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.facebook_data_deletion_requests TO service_role;

-- Remove privilégios que permitem esvaziar a tabela inteira pelo acesso cliente.
-- RLS não limita operações TRUNCATE; as políticas de linha permanecem intactas.
REVOKE TRUNCATE ON TABLE public.progresso_licoes FROM anon, authenticated;

-- Impede que a concessão reapareça em futuras tabelas public criadas por
-- postgres, papel que executa as migrations do projeto.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE TRUNCATE ON TABLES FROM anon, authenticated;

-- O catálogo também mostra TRUNCATE no ACL padrão de supabase_admin. A role
-- postgres não é membro dela nem superuser neste projeto, portanto PostgreSQL
-- não permite alterar esse ACL por esta migration. Essa concessão requer uma
-- operação administrativa separada e não é corrigida por este arquivo.

-- Falha de forma explícita se a migração não produzir o estado esperado.
DO $permissions$
BEGIN
  IF has_table_privilege('anon', 'public.progresso_licoes', 'TRUNCATE')
     OR has_table_privilege('authenticated', 'public.progresso_licoes', 'TRUNCATE') THEN
    RAISE EXCEPTION 'TRUNCATE ainda está efetivo para anon ou authenticated em public.progresso_licoes';
  END IF;

  IF NOT has_table_privilege('authenticated', 'public.progresso_licoes', 'SELECT')
     OR NOT has_table_privilege('authenticated', 'public.progresso_licoes', 'INSERT')
     OR NOT has_table_privilege('authenticated', 'public.progresso_licoes', 'UPDATE') THEN
    RAISE EXCEPTION 'As permissões SELECT, INSERT e UPDATE necessárias ao progresso foram alteradas';
  END IF;

  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.progresso_licoes'::regclass) THEN
    RAISE EXCEPTION 'RLS precisa permanecer habilitado em public.progresso_licoes';
  END IF;
END;
$permissions$;

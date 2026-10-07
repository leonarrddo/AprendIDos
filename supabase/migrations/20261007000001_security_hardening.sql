-- ==============================================================================
-- MIGRATION: 20261007000001_security_hardening.sql
-- PROJETO: AprendIDos - Alfabetização Digital e Inclusiva (TCC)
-- OBJETIVO: Fortalecimento de Segurança do PostgreSQL (RLS, Constraints e Triggers)
-- ==============================================================================

-- 1. CORREÇÃO DE SEGURANÇA NA FUNÇÃO TRIGGER (Mitigação do SEC-02: Search Path Mutable)
-- Funções SECURITY DEFINER executam com privilégios de superusuário e devem
-- fixar expressamente o search_path para evitar Search Path Hijacking.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.perfis (id, nome_completo, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL)
  );
  RETURN NEW;
END;
$$;

-- 2. GARANTE COLUNAS NECESSÁRIAS
ALTER TABLE public.progresso_licoes 
  ADD COLUMN IF NOT EXISTS tentativas INTEGER DEFAULT 1;

-- 3. VALIDAÇÃO DE INTEGRIDADE NO BANCO (Constraints contra dados forjados)
-- Impede inserção de pontuações negativas, notas acima de 100 ou licao_id arbitrários.
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_progresso_pontuacao') THEN
    ALTER TABLE public.progresso_licoes 
      ADD CONSTRAINT chk_progresso_pontuacao CHECK (pontuacao >= 0 AND pontuacao <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_progresso_tentativas') THEN
    ALTER TABLE public.progresso_licoes 
      ADD CONSTRAINT chk_progresso_tentativas CHECK (tentativas >= 1);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_progresso_licao_valida') THEN
    ALTER TABLE public.progresso_licoes 
      ADD CONSTRAINT chk_progresso_licao_valida 
      CHECK (licao_id IN ('letras', 'vogais', 'consoantes', 'meunome', 'silabas', 'palavras', 'frases', 'leituras', 'escrita'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_perfis_nome_length') THEN
    ALTER TABLE public.perfis 
      ADD CONSTRAINT chk_perfis_nome_length CHECK (char_length(nome_completo) <= 150);
  END IF;
END $$;

-- 4. REFINAMENTO DAS POLÍTICAS DE ROW LEVEL SECURITY (RLS) (Mitigação do SEC-03)
-- Garante a separação estrita de privilégios (Menor Privilégio) com cláusulas WITH CHECK explícitas.

-- Atualiza políticas de 'perfis'
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.perfis;
CREATE POLICY "Usuários podem atualizar seus próprios perfis" 
ON public.perfis FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Substitui a política genérica 'FOR ALL' de 'progresso_licoes' por políticas granulares
DROP POLICY IF EXISTS "Usuários podem inserir/atualizar seu próprio progresso" ON public.progresso_licoes;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio progresso" ON public.progresso_licoes;
DROP POLICY IF EXISTS "RLS: Usuários podem ler seu próprio progresso" ON public.progresso_licoes;
DROP POLICY IF EXISTS "RLS: Usuários podem inserir seu próprio progresso" ON public.progresso_licoes;
DROP POLICY IF EXISTS "RLS: Usuários podem atualizar seu próprio progresso" ON public.progresso_licoes;
DROP POLICY IF EXISTS "RLS: Usuários podem deletar seu próprio progresso" ON public.progresso_licoes;

-- Leitura: Apenas o próprio usuário autenticado pode ver seu progresso
CREATE POLICY "RLS: Usuários podem ler seu próprio progresso" 
ON public.progresso_licoes FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Inserção: O usuário autenticado só pode inserir registros vinculados ao seu próprio id
CREATE POLICY "RLS: Usuários podem inserir seu próprio progresso" 
ON public.progresso_licoes FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Atualização: O usuário só pode alterar seus próprios registros e não pode trocar o user_id
CREATE POLICY "RLS: Usuários podem atualizar seu próprio progresso" 
ON public.progresso_licoes FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Exclusão: O usuário autenticado só pode remover seus próprios registros
CREATE POLICY "RLS: Usuários podem deletar seu próprio progresso" 
ON public.progresso_licoes FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

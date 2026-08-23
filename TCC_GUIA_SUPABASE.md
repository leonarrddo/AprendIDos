# 🎓 Guia Arquitetural e Configuração do Supabase (TCC AprendIDos)

Este documento contém a fundamentação técnica, os scripts SQL e o passo a passo completo para a integração do **Supabase** no seu Trabalho de Conclusão de Curso (TCC).

---

## 🏛️ 1. Fundamentação Técnica para o seu TCC (Monografia/Artigo)

Você pode utilizar a seguinte argumentação na seção de **Metodologia / Arquitetura do Software** do seu TCC:

> *"Para a camada de persistência de dados e autenticação de usuários, a plataforma **AprendIDos** adota o modelo **Backend-as-a-Service (BaaS)** através do ecossistema **Supabase**, fundamentado no Sistema Gerenciador de Banco de Dados Relacional (SGBDR) **PostgreSQL**.*
> 
> *A escolha do Supabase viabiliza a implementação de autenticação federada baseada no protocolo **OAuth 2.0 / OpenID Connect** (com provedores Google e Meta/Facebook) e autenticação tradicional via credenciais seguras. A segurança e a privacidade dos dados dos alunos são garantidas por meio de políticas de **Row Level Security (RLS)** no PostgreSQL, assegurando que cada usuário acesse estritamente seus próprios registros de progresso pedagógico, em conformidade com as diretrizes da **Lei Geral de Proteção de Dados (LGPD)**."*

---

## 🗄️ 2. Scripts SQL para Criar no Supabase

No painel do seu Supabase, abra o menu **SQL Editor**, clique em **"New Query"**, cole o script abaixo e clique em **Run**:

```sql
-- ==============================================================================
-- PROJETO TCC: AprendIDos - Alfabetização Digital e Inclusiva
-- BANCO DE DADOS: PostgreSQL (Supabase)
-- ==============================================================================

-- 1. TABELA DE PERFIS DOS USUÁRIOS
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nome_completo TEXT,
    avatar_url TEXT,
    tipo_usuario TEXT DEFAULT 'aluno',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilita Row Level Security (RLS)
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para perfis
CREATE POLICY "Usuários podem visualizar seus próprios perfis" 
ON public.perfis FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" 
ON public.perfis FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seus próprios perfis" 
ON public.perfis FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 2. TABELA DE PROGRESSO DAS LIÇÕES
CREATE TABLE IF NOT EXISTS public.progresso_licoes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    licao_id TEXT NOT NULL, -- Ex: 'vogais', 'letras', 'silabas'
    concluido BOOLEAN DEFAULT FALSE NOT NULL,
    pontuacao INTEGER DEFAULT 0,
    tentativas INTEGER DEFAULT 1,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, licao_id)
);

-- Habilita Row Level Security (RLS)
ALTER TABLE public.progresso_licoes ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para progresso
CREATE POLICY "Usuários podem ver seu próprio progresso" 
ON public.progresso_licoes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir/atualizar seu próprio progresso" 
ON public.progresso_licoes FOR ALL 
USING (auth.uid() = user_id);

-- 3. TRIGGER AUTOMÁTICO: Cria perfil sempre que um novo usuário se cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis (id, nome_completo, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ativa o Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 🔑 3. Onde Pegar as Credenciais e Colocar no Projeto

1. Acesse seu projeto em [supabase.com](https://supabase.com/).
2. Vá em ⚙️ **Project Settings > API**.
3. Copie:
   - **Project URL** (ex: `https://abcdefghijklm.supabase.co`)
   - **anon / public key** (uma chave longa que começa com `eyJhbGciOi...`)
4. Abra o arquivo [supabase-config.js](file:///c:/Users/leo/Desktop/Nova%20pasta%20%284%29/supabase-config.js) no seu projeto e substitua as constantes:
   ```javascript
   export const SUPABASE_URL = 'https://SEU_PROJETO_AQUI.supabase.co';
   export const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_AQUI';
   ```

---

## 🌐 4. Como Configurar o Login do Google e Facebook

### No Supabase:
1. Vá em **Authentication > URL Configuration**.
2. Em **Site URL**, coloque a URL onde seu site roda (ex: `http://localhost:5500` ou `https://seusite.vercel.app`).
3. Em **Redirect URLs**, adicione:
   - `http://localhost:5500/**`
   - `http://127.0.0.1:5500/**`
   - A URL do seu domínio online se estiver hospedado.
4. Vá em **Authentication > Providers**:
   - Copie a **Callback URL (for OAuth)** (ex: `https://<seu-projeto>.supabase.co/auth/v1/callback`).

### No Google Cloud ([console.cloud.google.com](https://console.cloud.google.com/)):
1. Crie um projeto no Google Cloud.
2. Configure a **Tela de consentimento OAuth** (Tipo: Externo).
3. Vá em **Credenciais > Criar Credenciais > ID do cliente OAuth > Aplicativo da Web**.
4. Em **URIs de redirecionamento autorizados**, cole a Callback URL do Supabase.
5. Copie o **Client ID** e **Client Secret** e cole no Supabase (em Providers > Google).

### No Meta / Facebook Developers ([developers.facebook.com](https://developers.facebook.com/)):
1. Crie um aplicativo e adicione o produto **Login do Facebook**.
2. Nas configurações do Login do Facebook, cole a mesma Callback URL do Supabase.
3. Copie o **ID do Aplicativo** e a **Chave Secreta** e cole no Supabase (em Providers > Facebook).

---

## 💡 5. Como o Modo Demonstração Funciona
Mesmo antes de você colocar as chaves no `supabase-config.js`, o **AprendIDos** já funciona perfeitamente:
- Ao clicar em "Entrar com Google" ou "Entrar com Facebook", ele simula a entrada de um idoso fictício com foto e nome.
- Ao preencher a tela de `cadastro.html`, o cadastro é efetuado e o progresso é salvo no `localStorage`.
- Na tela de `licoes.html`, o nome do usuário aparece com saudação e o progresso da lição de `vogais.html` é atualizado em tempo real!

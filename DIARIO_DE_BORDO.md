# 📓 Diário de Bordo — TCC AprendIDos

> **Projeto:** AprendIDos — Plataforma de alfabetização digital para adultos
> **Repositório:** AprendIDos (workspace local)

---

## 📅 07/10/2026 — Integração do Supabase e Segurança da Autenticação

### 🎯 Objetivo da sessão
Conectar o backend de autenticação real (Supabase) ao projeto, implementar boas práticas de segurança no repositório e validar o fluxo de cadastro e login por e-mail com confirmação.

---

### 🗣️ Atividades realizadas

#### 1. Conexão do Supabase ao projeto
> *"O projeto AprendIDos utiliza atualmente um modo de autenticação local simulado (demo), que armazena dados de usuário apenas no `localStorage` sem nenhuma persistência ou validação real. É necessário substituir esse mecanismo pela autenticação do Supabase, integrando a chave pública do projeto (`anon key`) ao arquivo de configuração `supabase-config.js` e validando a conectividade com a API REST do serviço. Após a integração, confirmar que as tabelas necessárias (`perfis` e `progresso_licoes`) estão acessíveis no banco de dados remoto."*

**O que foi feito:**
- Identificada a chave pública (`anon key`) do projeto Supabase
- Atualizado o arquivo `supabase-config.js` com a URL e a chave do projeto
- Validada a conexão via requisição REST à API do Supabase
- Confirmada a existência das tabelas `perfis` e `progresso_licoes` no banco de dados

---

#### 2. Auditoria e fortalecimento de segurança (AppSec)
> *"Realizar uma auditoria completa de segurança no projeto AprendIDos, atuando como engenheiro de segurança de aplicações (AppSec). A auditoria deve cobrir três camadas: (1) higiene do repositório Git, garantindo que credenciais e arquivos sensíveis nunca sejam versionados; (2) segurança no banco de dados Supabase, habilitando Row Level Security (RLS) e criando políticas de acesso granulares para cada tabela; (3) segurança no frontend, implementando um módulo centralizado de autenticação (`auth.js`) com validações robustas, prevenção de ataques como Open Redirect e ReDoS, e tratamento adequado de erros. Todas as correções devem preservar o funcionamento existente das funcionalidades do site."*

**O que foi feito:**

**Higiene do repositório:**
- Criado `.gitignore` robusto, impedindo que arquivos sensíveis (`.env`, chaves de API, `node_modules`) sejam versionados acidentalmente
- Criado `.env.example` documentando as variáveis de ambiente necessárias sem expor valores reais
- Criado `SECURITY.md` com diretrizes de segurança do projeto

**Banco de dados (Supabase — SQL):**
- Habilitado **Row Level Security (RLS)** nas tabelas `perfis` e `progresso_licoes`
- Criadas políticas RLS garantindo que cada usuário acesse apenas seus próprios dados
- Adicionadas restrições de integridade (`CHECK constraints`) nas colunas críticas
- Adicionados índices de performance nas colunas mais consultadas

**Frontend (`auth.js`):**
- Implementado módulo de autenticação centralizado com as funções:
  - `signUpWithEmail` — cadastro com e-mail/senha e suporte à confirmação
  - `signInWithEmail` — login com tratamento de erros em português
  - `signInWithProvider` — login via OAuth (Google/Facebook)
  - `resendConfirmationEmail` — reenvio do link de confirmação
  - `signOut` — logout com limpeza de sessão
  - `saveLessonProgress` / `getLessonProgress` — persistência do progresso das lições
- Implementada prevenção de **Open Redirect** com allowlist de URLs internas
- Validação de e-mail com regex seguro contra **ReDoS**
- Adicionado `onAuthStateChange` para sincronizar o estado da sessão automaticamente

---

#### 3. Configuração da confirmação de e-mail
> *"No fluxo de cadastro atual, o usuário consegue acessar a plataforma imediatamente após o registro, sem que o endereço de e-mail seja verificado. Para garantir a validade dos dados dos usuários e evitar cadastros fraudulentos, é necessário configurar o Supabase para exigir a confirmação de e-mail antes do primeiro acesso. Isso inclui: verificar o estado da opção `mailer_autoconfirm` no painel do Supabase, implementar na interface de cadastro uma tela de aviso informando que um link de confirmação foi enviado, definir a URL de redirecionamento pós-confirmação (`login.html?confirmado=true`) e tratar adequadamente no frontend o erro retornado quando o usuário tenta fazer login sem ter confirmado o e-mail."*

**O que foi feito:**
- Verificado que `mailer_autoconfirm: false` já estava ativo no Supabase
- Implementado no `cadastro.html` o aviso de confirmação pendente após o cadastro
- Adicionada URL de redirecionamento pós-confirmação: `login.html?confirmado=true`
- Implementado no `login.html` tratamento do erro `email_not_confirmed` com mensagem clara

---

#### 4. Configuração do ambiente de desenvolvimento local com servidor HTTP
> *"Durante os testes iniciais, o site estava sendo acessado diretamente pelo sistema de arquivos do Windows, utilizando o protocolo `file://` (ex.: `file:///C:/Users/.../inicio.html`). Esse protocolo não é compatível com autenticação web moderna, pois impede o processamento de redirecionamentos OAuth e callbacks do Supabase após a confirmação de e-mail. É necessário configurar um servidor HTTP local para servir os arquivos do projeto, de modo que o site seja acessado via `http://localhost`, tornando o ambiente de desenvolvimento compatível com os fluxos de autenticação."*

**Diagnóstico:** O protocolo `file://` não suporta autenticação web moderna — OAuth e redirecionamentos do Supabase requerem uma URL HTTP real.

**O que foi feito:**
- Instalado o pacote `serve` como dependência de desenvolvimento
- Adicionado o script `"start": "npx serve . -p 3000"` ao `package.json`
- O projeto agora é acessado via `http://localhost:3000` durante o desenvolvimento
- Configuradas no painel do Supabase: **Site URL** e **Redirect URLs** apontando para `localhost:3000`

---

#### 5. Correção do comportamento no cadastro com e-mail duplicado
> *"Foi identificado um comportamento inesperado no fluxo de cadastro: ao submeter o formulário utilizando um endereço de e-mail já cadastrado na plataforma, o sistema não exibia nenhum erro ao usuário e aparentemente enviava um novo e-mail de confirmação, dando a entender que uma segunda conta havia sido criada. É necessário investigar a causa raiz desse comportamento, compreender como o Supabase trata internamente tentativas de cadastro com e-mails duplicados e implementar uma solução que exiba uma mensagem de erro clara e direcione o usuário para a tela de login."*

**Diagnóstico:** O Supabase não retorna erro explícito para e-mails duplicados (proteção anti-enumeração). Internamente, envia um e-mail diferente ao usuário, mas não cria conta duplicada.

**O que foi feito:**
- Implementada detecção via campo `data.user.identities` (vazio = e-mail já existente) em `auth.js`
- Atualizada a mensagem de erro no `cadastro.html` com link direto para a tela de login

---

### 📁 Arquivos modificados na sessão

| Arquivo | Alteração |
|---|---|
| `supabase-config.js` | URL e chave pública do Supabase |
| `auth.js` | Módulo completo de autenticação criado |
| `cadastro.html` | Fluxo de confirmação de e-mail e detecção de duplicidade |
| `login.html` | Tratamento de e-mail não confirmado |
| `package.json` | Script `start` para servidor local |
| `.gitignore` | Criado com regras de segurança |
| `.env.example` | Criado como modelo de variáveis de ambiente |
| `SECURITY.md` | Diretrizes de segurança do projeto |
| `supabase/migrations/` | Migration SQL com RLS, políticas e constraints |

---

### ⚠️ Pendências e próximos passos

- [ ] Configurar provedores OAuth (Google e Facebook) com credenciais das plataformas de desenvolvedor
- [ ] Atualizar URLs do Supabase para o domínio de produção antes do deploy
- [ ] Realizar testes de autenticação com usuários reais em homologação
- [ ] Implementar página de perfil do usuário (nome, avatar e progresso)

---

### 💡 Lições aprendidas

- O protocolo `file://` não suporta autenticação web moderna — sempre usar servidor HTTP local no desenvolvimento
- O Supabase protege contra enumeração de e-mails: o campo `identities` vazio é a forma correta de detectar cadastros duplicados via código
- RLS (Row Level Security) é essencial para garantir isolamento dos dados dos usuários no banco, mesmo com a chave pública exposta no frontend

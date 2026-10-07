# 🛡️ Diretrizes e Arquitetura de Segurança (AprendIDos — TCC)

Este documento descreve a modelagem de ameaças, as medidas defensivas implementadas, a fundamentação teórica segundo as diretrizes da **OWASP (Open Web Application Security Project)** e da **LGPD (Lei Geral de Proteção de Dados)**, e a suíte de testes de segurança da plataforma **AprendIDos**.

---

## 🏛️ 1. Modelo de Ameaças (Threat Model)

A plataforma AprendIDos é uma solução web voltada à alfabetização digital e inclusiva, manipulando dados cadastrais e progresso pedagógico de alunos. Os vetores de ataque avaliados foram:

| Agente de Ameaça | Vetor de Ataque | Impacto Potencial |
| :--- | :--- | :--- |
| **Invasor Externo Não Autenticado** | Manipulação direta da API PostgREST | Tentativa de leitura ou corrupção de dados de progresso e perfis alheios. |
| **Usuário Autenticado Malicioso** | Forjamento de IDs (`user_id`) e notas irreais | Violação do princípio do menor privilégio e poluição do banco. |
| **Injeção de Script (XSS)** | Inserção de payload malicioso no campo de nome | Execução de scripts no navegador do aluno e roubo de sessão. |
| **Ataque de UI Redressing** | Clickjacking via `<iframe>` malicioso | Manipulação de cliques de idosos em ações sensíveis. |
| **Phishing / Engenharia Social** | Open Redirect via parâmetros de retorno | Redirecionamento de usuários legítimos para sites de terceiros. |

---

## 🔒 2. Medidas de Segurança Implementadas e Mitigações

### 2.1. Controle de Acesso e Banco de Dados (Supabase / PostgreSQL)
- **Row Level Security (RLS) Granular:**
  - Habilitado em `public.perfis` e `public.progresso_licoes`.
  - A política genérica `FOR ALL` foi substituída pelo **Princípio do Menor Privilégio**, separando as operações em:
    - `SELECT`: Apenas o próprio usuário autenticado pode ler seus registros (`auth.uid() = user_id`).
    - `INSERT`: O usuário só pode inserir registros vinculados à sua própria identidade (`WITH CHECK (auth.uid() = user_id)`).
    - `UPDATE`: O usuário só pode alterar seus próprios registros, impedido de alterar o dono (`USING ... WITH CHECK`).
    - `DELETE`: Exclusão restrita ao dono do registro.
- **Mitigação de Search Path Mutable (SEC-02):**
  - A função trigger `public.handle_new_user()` (executada como `SECURITY DEFINER`) teve seu escopo protegido com:
    ```sql
    SET search_path = public, pg_temp;
    ```
    Isso impede que objetos maliciosos criados em esquemas temporários ou externos capturem a execução da função e escalem privilégios de superusuário.
- **Constraints de Integridade no Banco:**
  - `chk_progresso_pontuacao`: Restringe a pontuação estritamente ao intervalo de 0 a 100.
  - `chk_progresso_tentativas`: Garante tentativas $\ge 1$.
  - `chk_progresso_licao_valida`: Bloqueia inserção de lições inexistentes através de allowlist no SGBD.

### 2.2. Segurança Frontend e Mitigação de XSS (OWASP A03)
- **Eliminação de Sinks Inseguros:**
  - Em [meunome.js](file:///c:/Users/leo/Desktop/AprendIDos/meunome.js), a função `showNameAnalysis` foi reescrita eliminando concatenações de strings em `innerHTML`. Elementos são criados imperativamente via `document.createElement()` e seus conteúdos atribuídos via `textContent`.
  - Em [licoes.js](file:///c:/Users/leo/Desktop/AprendIDos/licoes.js), a renderização de avatares foi blindada contra pseudo-protocolos `javascript:` com validação estrita de esquemas permitidos (`https:`, `/`, `data:image/`).
- **Prevenção contra Open Redirects (SEC-07):**
  - O módulo [auth.js](file:///c:/Users/leo/Desktop/AprendIDos/auth.js) implementa a função `sanitizeRedirectPath()`, que valida qualquer destino contra uma allowlist estrita de rotas internas antes de autorizar navegações pós-login ou pós-cadastro.

### 2.3. Cabeçalhos de Segurança e Proteção do Navegador
Todas as páginas HTML da aplicação receberam metatags defensivas:
- **Content Security Policy (CSP):**
  ```html
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://vlibras.gov.br https://cdnjs.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
  font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net data:;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://ggptdxmsrsfrpvntlfja.supabase.co https://cdn.jsdelivr.net https://vlibras.gov.br;
  frame-src 'self' https://vlibras.gov.br;
  object-src 'none';
  base-uri 'self';
  ```
- **X-Content-Type-Options:** `nosniff` (impede ataques de MIME sniffing).
- **Referrer-Policy:** `strict-origin-when-cross-origin` (impede vazamento de dados de URLs em requisições de terceiros).
- **Proteção contra Clickjacking:**
  - Detecção ativa de enquadramento (frame-busting) defensivo em scripts inline.

### 2.4. Higiene do Código e Segredos
- **[.gitignore](file:///c:/Users/leo/Desktop/AprendIDos/.gitignore):** Protege chaves privadas, arquivos `.env*`, logs e `node_modules/`.
- **[.env.example](file:///c:/Users/leo/Desktop/AprendIDos/.env.example):** Molde público para desenvolvedores sem dados sensíveis.

---

## 📦 3. Dependências de Segurança Adicionadas

| Pacote | Versão | Justificativa de Arquitetura |
| :--- | :--- | :--- |
| `dompurify` | `^3.4.16` | Sanitização homologada de HTML para evitar DOM-based XSS. |
| `zod` | `^4.6.5` | Validação declarativa e tipada de schemas e entradas. |
| `@supabase/supabase-js` | `^2.49.1` | SDK oficial para autenticação segura e queries parametrizadas. |

*Auditoria:* Executado `npm audit` — **0 vulnerabilidades encontradas.**

---

## 🧪 4. Suíte de Testes de Segurança

Os testes de segurança estão centralizados no arquivo [tests/security.test.mjs](file:///c:/Users/leo/Desktop/AprendIDos/tests/security.test.mjs) e integrados ao comando padrão:
```bash
npm test
```

### Cobertura de Testes:
1. **Proteção contra Open Redirect:**
   - Bloqueio de URLs externas fraudulentas (`https://malicious-phishing.com`, `http://attacker.org`).
   - Bloqueio de esquema `javascript:` e dados maliciosos.
   - Aceitação de rotas internas válidas.
2. **Políticas de RLS e Integridade no Supabase:**
   - Garantia de que requisições anônimas são bloqueadas ao tentar inserir progresso.
   - Validação de que o SGBD rejeita notas fora do padrão (ex: `9999`).

---

## 🔮 5. Riscos Residuais e Trabalhos Futuros

Para a continuidade da pesquisa e evolução técnica do sistema em ambiente de produção em larga escala:
1. **Autenticação Multifator (MFA/TOTP):** Implementar verificação em duas etapas para contas de administradores/professores.
2. **WebAuthn / Passkeys:** Adicionar login biométrico (impressão digital/reconhecimento facial), o que é ideal para acessibilidade de idosos.
3. **Backend for Frontend (BFF) com Cookies HttpOnly:** Para eliminar totalmente a dependência de `localStorage` para tokens JWT em arquiteturas com servidor intermediário.
4. **Monitoramento de CSP:** Configurar diretiva `report-to` com endpoint centralizado de monitoramento de violações de segurança.

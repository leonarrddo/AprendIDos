/**
 * Gerador do Diário de Bordo Exclusivo: Sessão de Banco de Dados (Supabase)
 * Projeto: AprendIDos - TCC 2026
 * Data: 12 de Outubro de 2026
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_PDF = 'c:/Users/leo/Desktop/AprendIDos/Diario_de_Bordo_Banco_de_Dados.pdf';
const TEMP_HTML = 'c:/Users/leo/Desktop/AprendIDos/_temp_diario_banco.html';

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Diário de Bordo - Banco de Dados AprendIDos</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:wght@700&family=Fira+Code:wght@400;500;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', Arial, sans-serif;
    background: #fff;
    color: #1e293b;
    font-size: 10.5pt;
    line-height: 1.6;
  }

  /* ── CAPA EXCLUSIVA ── */
  .capa {
    width: 100%;
    min-height: 297mm;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 60px 40px;
    page-break-after: always;
    position: relative;
    overflow: hidden;
  }
  .capa::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
    top: -150px; right: -150px;
  }
  .capa .badge {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    color: #c7d2fe;
    font-size: 9pt;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 6px 20px;
    border-radius: 20px;
    margin-bottom: 30px;
    font-weight: 600;
  }
  .capa .emoji-icon {
    font-size: 64pt;
    margin-bottom: 20px;
    display: block;
  }
  .capa h1 {
    font-family: 'Playfair Display', serif;
    font-size: 38pt;
    font-weight: 700;
    color: #fff;
    line-height: 1.15;
    margin-bottom: 14px;
  }
  .capa h1 span {
    background: linear-gradient(90deg, #818cf8, #a78bfa, #38bdf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .capa .subtitulo {
    font-size: 14pt;
    color: #cbd5e1;
    margin-bottom: 40px;
    font-weight: 300;
    max-width: 650px;
  }
  .capa .meta-box {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 16px 28px;
    display: flex;
    gap: 30px;
    text-align: left;
    margin-top: 20px;
  }
  .capa .meta-item .label {
    font-size: 7.5pt;
    text-transform: uppercase;
    color: #94a3b8;
    letter-spacing: 1px;
    display: block;
  }
  .capa .meta-item .val {
    font-size: 11pt;
    font-weight: 600;
    color: #f8fafc;
  }

  /* ── PÁGINAS DE CONTEÚDO ── */
  .pagina {
    padding: 15mm 20mm;
    page-break-after: always;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 297mm;
    max-height: 297mm;
    overflow: hidden;
  }
  .pagina:last-child { page-break-after: avoid; }

  .header-secao {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 2px solid #f1f5f9;
  }
  .header-secao .icon-box {
    width: 38px; height: 38px;
    border-radius: 8px;
    background: #ede9fe;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17pt;
    flex-shrink: 0;
  }
  .header-secao .titulo-grupo .tag {
    font-size: 7.5pt;
    font-weight: 700;
    color: #6366f1;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
  .header-secao .titulo-grupo h2 {
    font-size: 14pt;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.2;
  }

  h3.sub {
    font-size: 10pt;
    font-weight: 700;
    color: #1e1b4b;
    margin: 10px 0 6px;
    padding-left: 8px;
    border-left: 3px solid #6366f1;
  }

  p.paragrafo {
    font-size: 8.8pt;
    color: #334155;
    line-height: 1.45;
    margin-bottom: 8px;
  }

  /* Cards de Prompts */
  .prompt-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 3px solid #6366f1;
    border-radius: 6px;
    padding: 8px 12px;
    margin: 6px 0 8px;
  }
  .prompt-card .autor {
    font-size: 7.5pt;
    font-weight: 700;
    color: #4338ca;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }
  .prompt-card .texto-prompt {
    font-size: 8.2pt;
    color: #1e293b;
    font-style: italic;
    line-height: 1.35;
  }

  /* Código */
  pre.codigo {
    background: #0f172a;
    color: #f8fafc;
    font-family: 'Fira Code', monospace;
    font-size: 7.2pt;
    line-height: 1.35;
    padding: 8px 12px;
    border-radius: 6px;
    margin: 6px 0 6px;
    border: 1px solid #1e293b;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* Cards Explicativos */
  .explicacao-card {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 6px;
    padding: 8px 12px;
    margin-bottom: 8px;
  }
  .explicacao-card strong {
    font-size: 8.2pt;
    color: #166534;
    display: block;
    margin-bottom: 3px;
  }
  .explicacao-card p {
    font-size: 7.9pt;
    color: #14532d;
    line-height: 1.35;
    margin: 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 7.8pt;
  }
  th {
    background: #f1f5f9;
    color: #475569;
    text-align: left;
    padding: 5px 8px;
    font-weight: 700;
    border-bottom: 2px solid #cbd5e1;
  }
  td {
    padding: 5px 8px;
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
    vertical-align: top;
  }
  tr:nth-child(even) td { background: #f8fafc; }

  .status-tag {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 10px;
    font-size: 7pt;
    font-weight: 700;
    text-transform: uppercase;
  }
  .status-ok { background: #dcfce7; color: #15803d; }
  .status-warn { background: #fef3c7; color: #b45309; }

  .rodape {
    margin-top: auto;
    padding-top: 8px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    font-size: 7.5pt;
    color: #94a3b8;
  }
</style>
</head>
<body>

<!-- ═══════════════════════════════ CAPA EXCLUSIVA ═══════════════════════════════ -->
<div class="capa">
  <div class="badge">Diário de Bordo Especial · TCC 2026</div>
  <span class="emoji-icon">🗄️</span>
  <h1>Aprend<span>IDos</span></h1>
  <div class="subtitulo">Relatório Exclusivo: Auditoria, Blindagem e Testes do Banco de Dados (Supabase)</div>

  <div class="meta-box">
    <div class="meta-item">
      <span class="label">Foco da Sessão</span>
      <span class="val">Banco de Dados PostgreSQL</span>
    </div>
    <div class="meta-item">
      <span class="label">Data de Realização</span>
      <span class="val">12 de Outubro de 2026</span>
    </div>
    <div class="meta-item">
      <span class="label">Ambiente</span>
      <span class="val">Supabase (PostgreSQL 17)</span>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════ PÁGINA 1 — PROMPTS E DIAGNÓSTICO ═══════════════════════════════ -->
<div class="pagina">
  <div class="header-secao">
    <div class="icon-box">💬</div>
    <div class="titulo-grupo">
      <div class="tag">Seção 01 · Registro de Diálogo e Demandas</div>
      <h2>Os Prompts do Usuário e o Diagnóstico Inicial</h2>
    </div>
  </div>

  <p class="paragrafo">
    O trabalho de hoje foi <strong>100% concentrado no banco de dados</strong> do projeto AprendIDos.
    Abaixo estão documentados os prompts reais enviados pelo usuário na sessão, o diagnóstico encontrado e as decisões tomadas.
  </p>

  <h3 class="sub">1. Prompt de Abertura: Relatório Trazido pelo Usuário</h3>
  <div class="prompt-card">
    <div class="autor">👤 Prompt do Usuário:</div>
    <div class="texto-prompt">
      "estava falando com o chat sobre a nossa parte do supabase e ele disse isso aqui como opiniao:
      'Fiz uma verificação somente de leitura do projeto AprendIDos no Supabase. O projeto está ativo e saudável...
      O que precisa de atenção: Não encontrei o trigger de criação automática de perfil. A função handle_new_user() existe, mas não tem trigger associado a ela...
      A função handle_new_user() pode ser executada por anon e authenticated (alerta SECURITY DEFINER).
      Há políticas RLS repetidas... mas são coisas muito importantes para mudar?'"
    </div>
  </div>

  <h3 class="sub">2. O que foi verificado e confirmado no Supabase:</h3>
  <table>
    <thead>
      <tr><th>Item Inspecionado</th><th>Diagnóstico no Banco</th><th>Impacto Funcional / Segurança</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Trigger de Cadastro</strong></td>
        <td>Ausente no schema <code>auth</code></td>
        <td>O cadastro criava o login, mas a tabela <code>perfis</code> não recebia a linha correspondente do aluno.</td>
      </tr>
      <tr>
        <td><strong>Função Privilegiada</strong></td>
        <td>Permissão <code>EXECUTE</code> aberta para <code>anon</code> e <code>PUBLIC</code></td>
        <td>Alerta no Supabase Linter (0028): função com superpoderes acessível diretamente pela API web.</td>
      </tr>
      <tr>
        <td><strong>Políticas RLS Duplicadas</strong></td>
        <td>Políticas legadas com role <code>public</code> coexistindo com as novas</td>
        <td>Redundância desnecessária e custo extra de avaliação por linha nas consultas.</td>
      </tr>
    </tbody>
  </table>

  <h3 class="sub">3. Prompt Solicitando Explicações Didáticas dos Códigos</h3>
  <div class="prompt-card">
    <div class="autor">👤 Prompt do Usuário:</div>
    <div class="texto-prompt">
      "bom eu queria saber mais afundo o que voce fez e oq significa esse codigo que vc mandou eu colocar no sql editor."
    </div>
  </div>

  <p class="paragrafo">
    Nas páginas seguintes, cada código executado está documentado acompanhado da sua respectiva explicação didática.
  </p>

  <div class="rodape">
    <span class="projeto">AprendIDos · Diário de Bordo Banco de Dados</span>
    <span>Página 1</span>
  </div>
</div>

<!-- ═══════════════════════════════ PÁGINA 2 — CÓDIGOS E EXPLICAÇÕES DIDÁTICAS ═══════════════════════════════ -->
<div class="pagina">
  <div class="header-secao">
    <div class="icon-box">🛡️</div>
    <div class="titulo-grupo">
      <div class="tag">Seção 02 · Execução Técnica e Explicações</div>
      <h2>Códigos SQL Aplicados e Explicação Didática</h2>
    </div>
  </div>

  <h3 class="sub">1. Revogação de Acesso da Função handle_new_user()</h3>
  <pre class="codigo">REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;</pre>

  <div class="explicacao-card">
    <strong>💡 Explicação Didática (Como foi explicado na sessão):</strong>
    <p>
      • <strong>O que é essa função:</strong> Ela serve para pegar o usuário recém-cadastrado no login e criar uma linha na tabela pública <code>perfis</code>.<br>
      • <strong>O problema de segurança:</strong> Ela foi criada como <code>SECURITY DEFINER</code> (roda com superpoderes de administrador). Porém, qualquer usuário na internet (inclusive o papel <code>anon</code>) podia chamá-la diretamente via API.<br>
      • <strong>O que o código fez:</strong> Removeu qualquer acesso direto de usuários. Ninguém de fora consegue mais chamá-la manualmente. Agora ela só roda internamente pelo próprio banco via trigger.
    </p>
  </div>

  <h3 class="sub">2. Criação do Trigger Automático de Novos Usuários</h3>
  <pre class="codigo">CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();</pre>

  <div class="explicacao-card">
    <strong>💡 Explicação Didática (Como foi explicado na sessão):</strong>
    <p>
      • <strong>O que é um Trigger (Gatilho):</strong> É uma regra automática no PostgreSQL: <em>"Toda vez que acontecer o evento X na tabela A, execute a ação Y"</em>.<br>
      • <strong>O que estava faltando:</strong> A função existia, mas o gatilho não estava criado. O aluno se cadastrava, mas a tabela de perfis continuava vazia porque ninguém "puxava o gatilho".<br>
      • <strong>O que o código faz:</strong> <code>AFTER INSERT ON auth.users</code> monitora os cadastros. Assim que um novo aluno entra, o gatilho executa a função e garante a criação imediata do perfil.
    </p>
  </div>

  <h3 class="sub">3. Faxina e Otimização de Políticas RLS (Row Level Security)</h3>
  <pre class="codigo">-- Remover políticas antigas duplicadas
DROP POLICY IF EXISTS "Progresso editável pelo dono" ON public.progresso_licoes;
DROP POLICY IF EXISTS "Progresso visível pelo dono" ON public.progresso_licoes;
DROP POLICY IF EXISTS "RLS: Usuários podem ler seu próprio progresso" ON public.progresso_licoes;

-- Recriar políticas limpas e otimizadas
CREATE POLICY progresso_select ON public.progresso_licoes
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY progresso_insert ON public.progresso_licoes
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);</pre>

  <div class="explicacao-card">
    <strong>💡 Explicação Didática (Como foi explicado na sessão):</strong>
    <p>
      • <strong>USING vs WITH CHECK:</strong> <code>USING</code> valida se você tem direito de enxergar ou encontrar a linha existente. <code>WITH CHECK</code> valida se os dados que você está enviando são seus (impede o usuário A de salvar progresso com o ID do usuário B).<br>
      • <strong>Por que (SELECT auth.uid()):</strong> O Supabase recomenda usar com sub-select porque faz o Postgres avaliar o ID do usuário apenas uma vez por consulta, tornando as buscas muito mais rápidas.
    </p>
  </div>

  <div class="rodape">
    <span class="projeto">AprendIDos · Diário de Bordo Banco de Dados</span>
    <span>Página 2</span>
  </div>
</div>

<!-- ═══════════════════════════════ PÁGINA 3 — TESTES E RESULTADOS ═══════════════════════════════ -->
<div class="pagina">
  <div class="header-secao">
    <div class="icon-box">🧪</div>
    <div class="titulo-grupo">
      <div class="tag">Seção 03 · Validação e Resultados</div>
      <h2>Bateria de Testes Automatizados e Conclusão</h2>
    </div>
  </div>

  <h3 class="sub">Prompt do Usuário Solicitando Testes:</h3>
  <div class="prompt-card">
    <div class="autor">👤 Prompt do Usuário:</div>
    <div class="texto-prompt">
      "eu queria que voce fizesses testes porque ai melhoraria nossa protecao"
    </div>
  </div>

  <p class="paragrafo">
    Desenvolvemos e executamos uma suíte completa de testes automatizados de regressão e integridade defensiva para comprovar as travas do sistema:
  </p>

  <h3 class="sub">Relatório de Execução dos Testes Automatizados</h3>
  <table>
    <thead>
      <tr><th>Alvo</th><th>Teste / Payload Forjado</th><th>Comportamento do Sistema</th><th>Status</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>auth.js</strong></td>
        <td>Redirecionamento para link malicioso (<code>http://site-falso.com</code>)</td>
        <td>Bloqueado pela allowlist; higienizado para index.html</td>
        <td><span class="status-tag status-ok">✓ 100% Passou</span></td>
      </tr>
      <tr>
        <td><strong>auth.js</strong></td>
        <td>Tentativa de injeção com barra dupla (<code>//evil.com</code>) e <code>javascript:</code></td>
        <td>Bloqueado contra ataques de Open Redirect (SEC-07)</td>
        <td><span class="status-tag status-ok">✓ 100% Passou</span></td>
      </tr>
      <tr>
        <td><strong>auth.js</strong></td>
        <td>Tentativa de cadastro com senha fraca (&lt; 6 caracteres)</td>
        <td>Rejeitado na validação de entrada antes do envio</td>
        <td><span class="status-tag status-ok">✓ 100% Passou</span></td>
      </tr>
      <tr>
        <td><strong>PostgreSQL</strong></td>
        <td>Tentativa de gravar pontuação forjada (ex: 999 pontos)</td>
        <td>Rejeitado no banco pela constraint <code>chk_progresso_pontuacao</code></td>
        <td><span class="status-tag status-ok">✓ Bloqueado</span></td>
      </tr>
      <tr>
        <td><strong>PostgreSQL</strong></td>
        <td>Tentativa de salvar lição com id inexistente ('licao_maliciosa')</td>
        <td>Rejeitado no banco pela constraint <code>chk_progresso_licao_valida</code></td>
        <td><span class="status-tag status-ok">✓ Bloqueado</span></td>
      </tr>
    </tbody>
  </table>

  <h3 class="sub">Status Final dos Avisos no Supabase</h3>
  <table>
    <thead>
      <tr><th>Alerta de Segurança (Advisor)</th><th>Antes da Sessão</th><th>Após as Correções de Hoje</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><code>anon_security_definer_function_executable</code></td>
        <td><span class="status-tag status-warn">Ativo (WARN)</span></td>
        <td><span class="status-tag status-ok">✅ Zerado (Neutralizado)</span></td>
      </tr>
      <tr>
        <td><code>authenticated_security_definer_function_executable</code></td>
        <td><span class="status-tag status-warn">Ativo (WARN)</span></td>
        <td><span class="status-tag status-ok">✅ Zerado (Neutralizado)</span></td>
      </tr>
      <tr>
        <td><code>Trigger on_auth_user_created</code></td>
        <td><span class="status-tag status-warn">Ausente</span></td>
        <td><span class="status-tag status-ok">✅ Ativo no auth.users</span></td>
      </tr>
      <tr>
        <td><code>Políticas RLS Otimizadas</code></td>
        <td><span class="status-tag status-warn">Duplicadas / Lentas</span></td>
        <td><span class="status-tag status-ok">✅ Padrão (SELECT auth.uid())</span></td>
      </tr>
    </tbody>
  </table>

  <div class="explicacao-card" style="margin-top:14px;">
    <strong>🎓 Conclusão da Sessão:</strong>
    <p>O objetivo do dia foi integralmente cumprido: o banco de dados do AprendIDos está blindado com menor privilégio, integridade referencial protegida contra notas forjadas, cadastro de alunos 100% funcional com trigger automático e suíte de testes aprovada.</p>
  </div>

  <div class="rodape">
    <span class="projeto">AprendIDos · Diário de Bordo Banco de Dados</span>
    <span>Página 3</span>
  </div>
</div>

</body>
</html>`;

(async () => {
  console.log('📄 Gerando Diário de Bordo Exclusivo do Banco de Dados...');
  fs.writeFileSync(TEMP_HTML, htmlContent, 'utf8');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.goto('file:///' + path.resolve(TEMP_HTML).replace(/\\\\/g, '/').replace(/\\/g, '/'), {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  await browser.close();

  if (fs.existsSync(TEMP_HTML)) {
    fs.unlinkSync(TEMP_HTML);
  }

  const stat = fs.statSync(OUTPUT_PDF);
  console.log('✅ PDF exclusivo gerado com sucesso:', OUTPUT_PDF, '(' + (stat.size / 1024).toFixed(1) + ' KB)');
})();

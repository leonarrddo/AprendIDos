# AprendIDos — estado atual conhecido e pendências

**Última compilação deste resumo:** 25/10/2026. Este documento foi montado com base no contexto de conversas anteriores; não é uma verificação automática do checkout atual. Confirme tudo no repositório.

## Prioridade atual: sincronização de progresso entre dispositivos

### Sintoma relatado
O usuário entra pelo computador, completa atividades e depois faz login com a mesma conta em outro dispositivo. O progresso aparece zerado ou não é recuperado.

### Pista técnica observada no código do repositório
Na versão que foi inspecionada via GitHub durante a conversa:
- `auth.js` exportava `saveLessonProgress()` e `getLessonProgress()`.
- `saveLessonProgress()` gravava localmente e tentava executar `upsert` em `public.progresso_licoes`.
- O retorno do `upsert` não era verificado pelo campo `error`; só havia `try/catch`, o que pode esconder erros retornados pelo Supabase sem exceção.
- `getLessonProgress()` tentava consultar a tabela e combinava os registros com dados de `localStorage`.
- `licoes.js` também tinha funções para carregar/salvar o progresso e lia chaves locais legadas/genéricas, o que exige cuidado para não deixar dados locais antigos sobrescreverem dados da conta.

Essas são pistas da versão inspecionada, não uma conclusão definitiva sobre a causa. O agente deve verificar a versão atual e os diffs antes de decidir a correção.

### Comportamento esperado
1. Concluir uma atividade com a conta autenticada e confirmar que o registro realmente foi salvo no Supabase.
2. Em outro navegador/dispositivo, entrar com a mesma conta, sem `localStorage` anterior, e recuperar o progresso por meio de `user_id`.
3. Atualizar a interface do menu e marcar as atividades corretas como concluídas.
4. Uma nova conclusão salva pelo celular deve aparecer no computador também.
5. Se o salvamento falhar, não declarar que foi salvo na nuvem; manter dados locais sem apagar o progresso.
6. Contas diferentes nunca podem compartilhar progresso.

### Testes essenciais
- Verificar o retorno e `error` de consultas Supabase.
- Cobrir salvamento com conta real/falsa de teste controlada e erros simulados.
- Testar as nove chaves de atividade.
- Testar recuperação sem dados locais.
- Verificar políticas RLS, índice/restrição única e permissões para upsert.
- Executar os testes existentes e diferenciar simulação de teste contra o Supabase real.
- Fazer teste manual em computador e celular após publicação.

## Mudanças pendentes vistas na interface do Antigravity
O usuário enviou uma captura de tela intitulada “Test Upsert”, em que a interface mostrava **“21 Files With Changes”** e botões **“Reject all”** / **“Accept all”**. Entre os arquivos visíveis estavam:
- `auth.js`
- `licoes.js`
- `licoes.html`
- `vogais.js`
- `vogais.html`
- `consoantes.html`
- `consoantes.js`
- `silabas.html`
- `silabas.js`
- `palavras.html`
- `palavras.js`
- `escrita.html`

Não temos confirmação se todos os 21 diffs estavam aceitos, aplicados, salvos ou commitados. Antes de iniciar novas alterações:
1. Abra a pasta original do projeto.
2. Execute/inspecione `git status` e o diff completo.
3. Preserve e revise todas as alterações; não descarte os diffs.
4. Faça backup/commit seguro depois de verificar o conteúdo, se apropriado.
5. Somente então continue a tarefa de sincronização.

## Outros pontos conhecidos
- O usuário deseja preservar a correção de áudio já feita.
- PWA/offline foi implementado e teve testes locais reportados, mas não temos confirmação de teste em dispositivos físicos ou de todos os recursos offline em produção.
- Autenticação real, APIs Supabase, sincronização e alguns recursos externos exigem internet.
- Recuperação de senha foi mencionada como uma necessidade anterior; o estado atual dessa funcionalidade não foi confirmado. Inspecione antes de alterar.

## Critério para declarar a sincronização concluída
Não basta os arquivos terem sido modificados ou a suíte unitária passar. O agente deve informar separadamente:
- testes automatizados executados e resultados;
- testes contra Supabase realmente executados;
- teste manual entre dois dispositivos;
- tarefas de painel/configuração ainda necessárias.

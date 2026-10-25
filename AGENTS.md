# AprendIDos — instruções permanentes para agentes de código

## Contexto do projeto
AprendIDos é um TCC: uma aplicação web de alfabetização voltada a pessoas idosas. O repositório principal conhecido é https://github.com/leonarrddo/AprendIDos.git. A aplicação usa HTML, CSS e JavaScript, Supabase para autenticação/dados, Vercel para hospedagem e PWA/Service Worker.

## Regras obrigatórias de trabalho
- Comece inspecionando o estado atual do repositório, `git status`, diffs e documentação. Não suponha que o contexto esteja atualizado.
- Preserve alterações existentes, inclusive alterações não commitadas feitas por outro agente. Nunca descarte ou sobrescreva diffs sem entender e preservar o trabalho.
- Faça mudanças pequenas, focadas e justificadas. Este projeto está na reta final do TCC; evite refatorações amplas.
- Não altere áudio, acessibilidade, layout, autenticação, navegação, PWA ou atividades pedagógicas, a menos que a tarefa exija isso.
- Não adicione frameworks, ferramentas ou dependências sem necessidade demonstrável e sem explicar o impacto.
- Não declare que uma operação Supabase funcionou sem verificar `error` e o resultado retornado. Um `try/catch` sozinho não detecta todos os erros devolvidos pelas consultas.
- Não afirme que testes, deploys, operações no Supabase ou testes em dispositivo foram executados se não foram de fato executados.
- Nunca coloque segredos no front-end, não use `service_role` no navegador e não desative RLS como atalho.
- Não faça migrações destrutivas nem apague dados existentes. Ao precisar mudar o banco, crie migration segura e diga claramente se precisa ser executada no painel Supabase.
- O `localStorage` é local a um navegador/dispositivo. Para sincronização entre dispositivos, o banco associado ao ID real do usuário autenticado deve ser a fonte central.
- Ao terminar, descreva a causa, arquivos alterados, testes reais executados, resultados, riscos e etapas manuais ainda necessárias.

## Testes
- Há histórico de 83 testes aprovados antes de algumas das alterações recentes; esse número é referência histórica, não garantia do estado atual.
- Descubra os scripts disponíveis em `package.json` e execute a suíte relevante após mudanças.
- Dê preferência a testes de comportamento. Não satisfaça testes apenas com verificações textuais superficiais.
- Separe claramente testes unitários, testes simulados, testes contra Supabase real e testes manuais em dispositivos.

## Segurança e dados
- O progresso conhecido usa `public.progresso_licoes`, com campos como `user_id`, `licao_id`, `concluido`, `pontuacao` e `atualizado_em`.
- Cada pessoa só pode ler e alterar o próprio progresso, com RLS usando `auth.uid() = user_id`.
- Não misture nem transfira automaticamente dados de progresso entre usuários.

## Fonte da verdade
Este arquivo contém orientações gerais. Consulte também `docs/CONTEXTO_TCC.md` e `docs/ESTADO_ATUAL.md`, mas confirme o estado do código antes de agir. Se a documentação e o código divergirem, reporte a divergência e verifique os arquivos e testes atuais.

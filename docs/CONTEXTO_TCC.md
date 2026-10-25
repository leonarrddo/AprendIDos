# AprendIDos — contexto de produto e TCC

## Propósito
AprendIDos é o projeto de TCC do usuário: um site de alfabetização para pessoas idosas. O objetivo é oferecer atividades acessíveis, com linguagem simples, apoio de áudio e navegação clara.

## Repositório e tecnologias
- Repositório GitHub informado: `leonarrddo/AprendIDos` — https://github.com/leonarrddo/AprendIDos.git
- Front-end: HTML, CSS e JavaScript.
- Dados e autenticação: Supabase.
- Hospedagem: Vercel.
- PWA: `manifest.json`, `sw.js`, `pwa.js` e ícones próprios.
- A aplicação tem páginas de login/cadastro, menu/atividades e páginas individuais de lições.

## Nove atividades principais
1. Letras (`letras`)
2. Vogais (`vogais`)
3. Consoantes e Sons (`consoantes`)
4. Meu Nome (`meunome`)
5. Sílabas (`silabas`)
6. Palavras do Dia a Dia (`palavras`)
7. Frases Simples (`frases`)
8. Pequenas Leituras (`leituras`)
9. Escrita (`escrita`)

O menu usa essas chaves para marcar lições concluídas e calcular o progresso geral.

## Áudio e acessibilidade
- Áudio é parte importante do projeto, implementado em várias atividades.
- Já houve um problema no iPhone em que o botão indicava reprodução, mas não saía som. O usuário relatou posteriormente que a correção de áudio estava funcionando.
- Em alguns dispositivos, o site pode usar Google TTS e/ou a síntese de voz nativa do navegador. Dependências remotas precisam de internet; a disponibilidade de vozes nativas depende do dispositivo.
- Não altere o áudio sem uma falha concreta reproduzível.
- Preserve fonte legível, botões grandes, linguagem simples e demais recursos de acessibilidade destinados ao público idoso.

## Supabase e progresso
- A tabela conhecida para progresso é `public.progresso_licoes`.
- A estrutura documentada inclui `user_id` (UUID da conta), `licao_id`, `concluido`, `pontuacao`, `tentativas`, `atualizado_em` e uma restrição única para o par `user_id, licao_id`.
- O banco deve aplicar RLS para que uma conta consulte e altere somente seus próprios registros.
- O `localStorage` deve ser tratado como armazenamento local/fallback, não como solução de sincronização entre dispositivos.
- Nunca use `service_role` no browser nem desative RLS para contornar erros.

## PWA e modo offline
Contexto registrado de trabalho anterior:
- Foi adicionado um manifesto PWA e ícones para instalação.
- Foi criado/atualizado um Service Worker que usa Network-First para HTML e Stale-While-Revalidate para alguns recursos estáticos.
- Chamadas remotas de autenticação/APIs não devem ser armazenadas como se fossem recursos estáticos.
- Arquivos de imagens muito grandes foram mantidos fora do precache para evitar um cache inicial enorme.
- Uma correção anterior incluiu `supabase-config.js` no precache de recursos locais e aumentou o cache versionado para v3, porque `auth.js` depende desse módulo. O cache de scripts locais não significa que APIs do Supabase funcionem offline.
- Esses detalhes são histórico informado; confirme o estado atual de `sw.js`, `pwa.js`, `manifest.json` e `vercel.json` antes de alterá-los.

## Dependências e testes
- Foi removido do projeto um grupo de dependências consideradas não utilizadas (`dompurify`, `routerjs`, `zod`) em trabalho anterior. Confirme o estado atual do `package.json` antes de assumir qualquer coisa.
- `jsconfig.json` foi adicionado para configuração do editor/JavaScript.
- Antes de uma etapa recente, o usuário informou que 83 testes passavam. Verifique os testes reais do checkout atual.

## Preferências de colaboração
- O usuário prefere instruções práticas, em português do Brasil e prompts que possa copiar/colar no Antigravity ou Codex.
- Explicar termos técnicos de forma direta.
- Não presumir conhecimento profundo de Git, Supabase ou configuração de ambiente; orientar passo a passo quando necessário.
- Priorizar segurança e estabilidade porque o projeto está na reta final.

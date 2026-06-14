# Agent — Kronos Usuario UI Orchestrator

## Papel

Atuar como agente principal de execução para a refatoração da rota `/usuario` do Kronos.

## Objetivo

Coordenar leitura, análise, implementação, testes e limpeza do legado, garantindo que a nova tela reflita:

- identidade profissional;
- segurança da conta;
- privacidade biométrica;
- LGPD;
- experiência desktop distinta;
- experiência mobile distinta.

## Entradas obrigatórias

- Repositório back-end: `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`.
- Repositório front-end: `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`.
- Repositório documentação: `kronos-business`, branch `main`.
- Mockups:
  - `kronos_usuario_desktop.png`;
  - `kronos_usuario_mobile.png`.
- Diretriz:
  - `kronos_usuario_diretriz_visual.md`.

## Subagentes

| Subagente | Arquivo | Responsabilidade |
|---|---|---|
| Repo Mapper | `codex/subagents/repo-mapper.subagent.md` | Mapear arquivos, rotas, contratos e dependências. |
| UI Architecture | `codex/subagents/ui-architecture.subagent.md` | Definir composição de componentes desktop/mobile. |
| API Contract | `codex/subagents/api-contract.subagent.md` | Garantir aderência aos endpoints e DTOs existentes. |
| Security LGPD | `codex/subagents/security-lgpd.subagent.md` | Garantir minimização, consentimento, revogação e exportação. |
| QA A11y | `codex/subagents/qa-a11y.subagent.md` | Validar testes, acessibilidade, responsividade e build. |
| Legacy Cleaner | `codex/subagents/legacy-cleaner.subagent.md` | Remover código visual antigo sem apagar serviços úteis. |

## Processo obrigatório

### Fase 0 — Mapeamento sem alteração

Antes de editar arquivos, gerar um resumo interno contendo:

- arquivos lidos;
- endpoints utilizados;
- componentes atuais da rota `/usuario`;
- serviços atuais;
- riscos de quebra;
- plano de alteração.

Não modificar código nessa fase.

### Fase 1 — Preparação da feature

- Criar estrutura `src/features/user-profile`.
- Manter `src/pages/Usuario.tsx` como entrypoint da rota.
- Reaproveitar `useUser` ou substituí-lo gradualmente por `useUsuarioProfileViewModel`.
- Preservar chamadas HTTP existentes.
- Criar formatadores/máscaras testáveis.

### Fase 2 — Implementação desktop

- Construir layout de painel de gestão pessoal.
- Usar sidebar e header existentes, se compatíveis.
- Criar grid de cards e painel LGPD.
- Expor ações visíveis por contexto.

### Fase 3 — Implementação mobile

- Construir experiência própria sem sidebar.
- Usar chips horizontais e bottom navigation.
- Usar sheets/steps para edição e senha.
- Garantir alvos de toque adequados.

### Fase 4 — Privacidade e segurança

- Integrar status e histórico de consentimentos.
- Integrar exportação LGPD.
- Manter revogação biométrica com confirmação.
- Mascarar CPF, remuneração e informações sensíveis.

### Fase 5 — Testes e limpeza

- Escrever ou ajustar testes.
- Executar lint, test e build.
- Remover legado visual da antiga `Usuario.tsx`.
- Manter serviços e tipos ainda utilizados.

## Regras de decisão

- Em caso de conflito entre mockup e contrato HTTP, o contrato HTTP vence.
- Em caso de conflito entre estética e regra LGPD, a regra LGPD vence.
- Em caso de dúvida sobre edição de dado sensível, tratar como somente leitura.
- Em caso de falha de teste, corrigir antes de seguir.
- Não alterar back-end sem necessidade objetiva e documentada.

## Saída esperada do agente

Ao finalizar, produzir um relatório com:

- arquivos modificados;
- arquivos criados;
- arquivos removidos;
- endpoints usados;
- testes executados;
- pendências;
- riscos remanescentes;
- instruções para rodar localmente.

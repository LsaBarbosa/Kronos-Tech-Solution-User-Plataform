# Prompt para Codex CLI — Refatorar `/ferias`

Você deve atuar como agente de execução no projeto Kronos.

## Contexto

Repositórios e branches:

- Back-end: `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`
- Front-end: `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`
- Documentação: `kronos-business`, branch `main`

Rota alvo do front-end:

```text
/ferias
```

Objetivo:

Refatorar a tela de aprovação de férias para a nova identidade visual, criando experiências distintas para desktop e mobile.

A tela deve ser uma **mesa de aprovação gerencial de férias**, não uma listagem simples.

## Arquivos de referência deste pacote

Leia obrigatoriamente:

```text
references/docs/kronos_aprovar_ferias_diretriz_visual.md
references/mockups/kronos_aprovar_ferias_desktop.png
references/mockups/kronos_aprovar_ferias_mobile.png
codex/skills/kronos-aprovar-ferias-ui.skill.md
codex/agents/kronos-aprovar-ferias-ui.agent.md
codex/rules/kronos-aprovar-ferias-ui.rules.md
plano-acao-aprovar-ferias-ui.md
checklist-validacao-aprovar-ferias-ui.md
```

## Leitura obrigatória no front-end

No repositório `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`, leia:

1. `package.json`
2. arquivo de rotas:
   - `src/App.tsx`
   - ou equivalente
3. página atual que atende `/ferias`
4. hooks relacionados a férias, vacation, records ou time records
5. services relacionados a:
   - listagem de solicitações de férias;
   - aprovação de férias;
   - rejeição de férias;
6. tipos/interfaces relacionados a vacation requests
7. componentes compartilhados:
   - `Header`
   - `Sidebar`
   - `LoadingState`
   - componentes em `src/components/ui`
8. estilos globais:
   - `src/index.css`
   - `tailwind.config.*`
   - qualquer arquivo de tokens/cores já usado pelo projeto.

## Leitura obrigatória no back-end

No repositório `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`, leia:

1. `ApiPaths.java`
2. `TimeRecordController.java`
3. DTOs relacionados a:
   - listagem de férias;
   - aprovação de férias;
   - rejeição de férias.
4. service/usecase relacionado ao fluxo de vacation request.
5. enums de status de ponto/férias.

Confirme os contratos antes de codar.

## Leitura obrigatória na documentação

No repositório `kronos-business`, branch `main`, leia:

1. documentação de rotas do front;
2. documentação de fluxos de ponto/férias;
3. regras de negócio;
4. permissões por papel;
5. qualquer arquivo que cite `/ferias`, `férias`, `REQUEST_VACATION`, `VACATION`, `VACATION_REJECTED`.

## Regras funcionais

A tela `/ferias` representa o fluxo:

1. colaborador solicita férias em `/solicitar-ferias`;
2. backend cria registros diários com status de solicitação;
3. gestor acessa `/ferias`;
4. gestor lista e filtra solicitações;
5. gestor aprova ou rejeita o lote;
6. aprovação converte registros para férias;
7. rejeição converte registros para férias rejeitadas.

## Experiência desktop obrigatória

Implemente desktop como **mesa de aprovação**:

- sidebar;
- header de contexto;
- hero institucional;
- métricas superiores;
- filtros horizontais;
- inbox/tabela de solicitações;
- detalhe lateral;
- cards de impacto;
- bloco de decisão sensível;
- botões separados:
  - `Rejeitar lote`
  - `Aprovar lote`

Não use apenas cards empilhados no desktop.

## Experiência mobile obrigatória

Implemente mobile como **inbox de decisões**:

- topo compacto;
- métricas curtas;
- busca;
- chips de status;
- cards por solicitação;
- seleção de pedido;
- painel fixo inferior;
- botões grandes:
  - `Rejeitar`
  - `Aprovar férias`

Não use tabela no mobile.

## Status e labels

Mapeie:

```text
REQUEST_VACATION     -> Aguardando aprovação
VACATION             -> Aprovada
VACATION_REJECTED    -> Rejeitada
```

Trate variações se o front legado já usar aliases.

## Confirmação obrigatória

Antes de aprovar ou rejeitar, mostrar confirmação com:

- colaborador;
- período;
- total de registros/dias afetados;
- ação escolhida;
- efeito do status.

## Restrições

- Não alterar o contrato HTTP existente.
- Não alterar back-end sem necessidade comprovada.
- Não remover interceptors/CSRF/cookies.
- Não quebrar rotas existentes.
- Não manter implementação visual antiga após nova versão passar.
- Não usar cor como único indicador.
- Não exibir botões ativos para status finalizados.

## Entrega

Após implementar:

1. Remover legado da página antiga.
2. Rodar:

```bash
npm run lint
npm run build
```

3. Rodar testes existentes se houver.
4. Preencher checklist.
5. Reportar:
   - arquivos alterados;
   - decisões técnicas;
   - contratos confirmados;
   - comandos executados;
   - pendências ou riscos.

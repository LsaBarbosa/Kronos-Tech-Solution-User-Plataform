# Skill — Kronos Avisos UI

## Nome

`kronos-avisos-ui`

## Missão

Implementar a nova experiência visual e funcional da central de avisos do Kronos, preservando contratos HTTP e regras de permissão existentes.

## Contexto obrigatório

Repositórios e branches:

- Back-end: `LsaBarbosa/Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`
- Front-end: `LsaBarbosa/Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`
- Documentação: `LsaBarbosa/kronos-business`, branch `main`

Arquivos locais de referência:

- `references/docs/kronos_avisos_diretriz_visual.md`
- `references/mockups/kronos_avisos_desktop.png`
- `references/mockups/kronos_avisos_mobile.png`

## Problema de negócio

A tela atual de avisos é uma listagem simples. A nova tela deve comunicar:

- comunicação interna organizada;
- prioridade clara dos avisos;
- segmentação por destinatário;
- diferença de permissões por ROLE;
- ações administrativas seguras;
- leitura simples para usuários comuns.

## Rota e contrato

O pedido menciona `/aviso`, mas o produto e a diretriz usam `/avisos`.

Tarefa:

1. Confirmar a rota no workspace em `src/config/app-routes.ts` e `src/App.tsx`.
2. Refatorar a tela real do produto.
3. Preservar o recurso back-end `/messages`.

Contratos:

- `GET /messages?page=&size=` — lista avisos visíveis.
- `POST /messages` — cria aviso. Disponível apenas quando ROLE permitir.
- `DELETE /messages/{messageId}` — remove aviso. Disponível apenas quando ROLE permitir.

## Experiência desktop

Desktop deve ser uma central de leitura e gestão:

- sidebar persistente;
- header com contexto;
- hero institucional;
- métricas: total, alertas, críticos, direcionados;
- busca por título/conteúdo;
- filtros: Todos, Normal, Alerta, Crítico;
- lista à esquerda;
- detalhe do aviso selecionado à direita;
- CTA `Novo aviso` para `CTO` e `MANAGER`, conforme regra real do backend/front;
- ação `Deletar aviso` com confirmação;
- paginação clara.

## Experiência mobile

Mobile deve ser experiência de leitura rápida:

- sem tabela;
- topo compacto;
- métricas resumidas;
- busca destacada;
- chips horizontais por prioridade;
- cards empilhados;
- detalhe em modal, drawer ou tela dedicada;
- rodapé fixo com permissão atual;
- para `PARTNER`, deixar claro que é somente leitura;
- botões com alvo mínimo de 44px.

## Dados e estados obrigatórios

- `NORMAL` como aviso informativo/neutro.
- `ALERT` como alerta amarelo.
- `CRITICAL` como crítico vermelho.
- Mensagem direcionada: chip textual.
- Sem destinatário: chip `Visível apenas para o remetente`.
- Loading com skeleton ou estado acessível.
- Erro com card explícito.
- Estado vazio: `Tudo tranquilo por aqui`.
- Exclusão com confirmação destrutiva.
- Paginação preservada.

## Restrições

- Não mudar contrato HTTP.
- Não criar endpoints.
- Não expor dados inexistentes.
- Não quebrar `CriarAviso`.
- Não deixar botão administrativo visível para `PARTNER`.
- Não manter o legado visual em paralelo após a implementação.
- Não duplicar telas para mobile/desktop; usar componentes separados e renderização responsiva planejada.

## Critério de aceite

A implementação só está completa se:

1. `/avisos` funciona para `PARTNER`, `MANAGER` e `CTO`.
2. Mobile e desktop têm estruturas diferentes.
3. Filtros e busca funcionam em client-side sem quebrar paginação.
4. Detalhe lateral aparece no desktop.
5. Detalhe em modal/drawer aparece no mobile.
6. `Novo aviso` e `Deletar aviso` respeitam permissão.
7. Build, lint e testes existentes passam.

# Skill — Kronos Auditoria Fiscal UI

## Missão

Refatorar a rota `/auditoria` para representar uma **central de arquivos legais e fiscais**, orientada a conformidade de jornada, respeitando contratos existentes do back-end e a diretriz visual de negócio.

## Entradas obrigatórias

Antes de implementar, ler:

1. `references/docs/kronos_auditoria_fiscal_diretriz_visual.md`
2. `references/mockups/kronos_auditoria_fiscal_desktop.png`
3. `references/mockups/kronos_auditoria_fiscal_mobile.png`
4. Front-end:
   - `src/pages/AuditoriaFiscal.tsx`
   - `src/service/fiscal.service.ts`
   - `src/config/api-routes.ts`
   - `src/config/app-routes.ts`
   - `src/App.tsx`
   - `src/context/AuthContext.tsx`
   - `src/components/PageShell.tsx`
5. Back-end:
   - `src/main/java/com/kts/kronos/adapter/in/web/http/LegalController.java`
   - `src/main/java/com/kts/kronos/constants/ApiPaths.java`

## Regras de implementação

- Não alterar contratos HTTP.
- Não criar mock API.
- Não remover autorização de rota.
- Não trocar `/auditoria`.
- Não transformar mobile em mera redução do desktop.
- Remover a implementação visual legada ao final.
- Preservar `FiscalService.downloadAej`, `FiscalService.downloadAfd` e `FiscalService.downloadTechnicalCertificate`.
- Manter mensagens administrativas para erro e loading.
- Criar componentes auxiliares apenas se reduzirem complexidade de `AuditoriaFiscal.tsx`.

## Experiência desktop

Implementar como console fiscal:

- Sidebar/Header existentes.
- Hero com título: `Arquivos legais para fiscalização e conformidade`.
- Cards de arquivo:
  - `AEJ` — Arquivo Eletrônico de Jornada — mensal/período — `.p7s`.
  - `AFD` — Arquivo Fonte de Dados — sem filtro mensal obrigatório — `.txt`.
  - `ATESTADO` — Atestado Técnico — estático — `.p7s`.
- Mês de referência visível quando aplicável.
- Painel lateral:
  - nome previsto do arquivo;
  - finalidade;
  - período;
  - formato;
  - regra operacional.
- CTA principal contextual:
  - `Baixar AEJ`
  - `Baixar AFD`
  - `Baixar ATESTADO`

## Experiência mobile

Implementar como fluxo guiado:

- Topo compacto.
- Métricas/atalhos `AEJ`, `AFD`, `P7S`.
- Etapa 1: tipo de arquivo.
- Etapa 2: referência.
- Etapa 3: prévia.
- CTA fixo inferior.
- Sem tabela.
- Botões com área mínima de toque.

## Estados obrigatórios

- Tipo selecionado.
- AEJ sem data: alerta ou CTA desabilitado.
- Atestado selecionado: aviso `arquivo estático`.
- Gerando: loading no painel e no CTA.
- Sucesso: feedback verde.
- Erro: mensagem vermelha administrativa.
- Card selecionado: borda azul.

## Aceite

A tarefa só está concluída quando:

- `npm run lint` passa.
- `npm run build` passa.
- `/auditoria` funciona em desktop e mobile.
- As três opções baixam pelos métodos existentes do `FiscalService`.
- O código legado visual foi removido ou isolado sem uso.

# Prompt para Codex CLI — Refatorar `/auditoria`

Você é o agente de implementação do Kronos para a rota `/auditoria`.

## Contexto obrigatório

Repositórios e branchs:

```text
Back-end:
repo: Kronos-Tech-Solutions-KTS
branch: PROD_HOSTINGER_V2

Front-end:
repo: Kronos-Tech-Solution-User-Plataform
branch: feature/lgpd-compliance-new-ui

Documentação:
repo: kronos-business
branch: main
```

## Objetivo

Refatorar a tela `auditoria` atualmente na rota `/auditoria`, transformando-a em uma **central de arquivos legais e fiscais** com identidade visual nova.

A tela deve gerar/baixar:

- `AEJ`
- `AFD`
- `ATESTADO`

A experiência desktop e mobile deve ser distinta, não apenas redimensionada.

## Referências visuais obrigatórias

Leia antes de alterar código:

```text
references/docs/kronos_auditoria_fiscal_diretriz_visual.md
references/mockups/kronos_auditoria_fiscal_desktop.png
references/mockups/kronos_auditoria_fiscal_mobile.png
```

## Arquivos que você deve ler no front-end

```text
src/pages/AuditoriaFiscal.tsx
src/service/fiscal.service.ts
src/config/api-routes.ts
src/config/app-routes.ts
src/App.tsx
src/context/AuthContext.tsx
src/components/PageShell.tsx
src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/alert.tsx
src/components/ui/calendar.tsx
src/components/ui/popover.tsx
```

## Arquivos que você deve ler no back-end

```text
src/main/java/com/kts/kronos/constants/ApiPaths.java
src/main/java/com/kts/kronos/adapter/in/web/http/LegalController.java
src/main/java/com/kts/kronos/application/port/in/usecase/AdfUseCase.java
src/main/java/com/kts/kronos/application/port/in/usecase/AejUseCase.java
src/main/java/com/kts/kronos/application/service/TechnicalCertificatePdfService.java
```

## Contratos que não podem quebrar

```text
GET /legal/technical-certificate
GET /legal/afd
GET /legal/aej?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

Preserve o uso do `FiscalService` atual.

## Regras de negócio

- `/auditoria` é uma rota de conformidade legal/fiscal.
- A rota é permitida para `MANAGER` e `CTO`.
- `AEJ` usa período/mês e retorna `.p7s`.
- `AFD` não depende do mês na tela atual e retorna `.txt`.
- `ATESTADO` é estático e retorna `.p7s`.
- Loading deve impedir múltiplas solicitações.
- Erros devem ser mostrados com linguagem administrativa.
- Não crie endpoints novos.
- Não altere o back-end sem necessidade.

## Implementação desejada — Desktop

Criar uma experiência de **Fiscal Compliance Console**:

- Header/Sidebar existentes.
- Hero institucional com:
  - título: `Arquivos legais para fiscalização e conformidade`
  - subtítulo sobre AEJ, AFD e Atestado Técnico.
- Cards grandes:
  - `AEJ` — Arquivo Eletrônico de Jornada — mensal/período — `.p7s`.
  - `AFD` — Arquivo Fonte de Dados — sem filtro mensal obrigatório — `.txt`.
  - `ATESTADO` — Atestado Técnico — estático — `.p7s`.
- Card selecionado com borda azul e botão/estado `Selecionado`.
- Seletor de mês para AEJ.
- Painel lateral de conformidade com:
  - arquivo previsto;
  - finalidade;
  - período;
  - formato;
  - regra operacional.
- CTA contextual:
  - `Baixar AEJ`
  - `Baixar AFD`
  - `Baixar Atestado`

## Implementação desejada — Mobile

Criar uma experiência guiada:

- Topo compacto.
- Bloco de atalhos `AEJ`, `AFD`, `P7S`.
- Etapa 1: tipo de arquivo.
- Etapa 2: referência.
- Etapa 3: prévia.
- Rodapé fixo:
  - tipo selecionado;
  - referência;
  - CTA `Baixar arquivo fiscal`.
- Não usar tabela.
- Não comprimir o desktop.

## Limpeza obrigatória

Após implementar e validar:

- remover layout antigo de card único;
- remover imports não usados;
- remover estados/funções mortos;
- deixar apenas a nova implementação.

## Validação obrigatória

Executar:

```bash
npm run lint
npm run build
```

Se existirem testes:

```bash
npm test
```

## Resposta final esperada do Codex

Retorne:

1. arquivos alterados;
2. contratos preservados;
3. comandos executados;
4. status de lint/build;
5. observações ou riscos.

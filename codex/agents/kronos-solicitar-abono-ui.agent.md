# Agent — kronos-solicitar-abono-ui

## Missão

Implementar a nova experiência da rota `/solicitar-abono` no front-end Kronos, orientada pelos mockups e pelos contratos do back-end, preservando regras de negócio e removendo o legado visual após validação.

## Modo de trabalho

Executar em fases:

1. Mapear contratos e arquivos atuais.
2. Validar regras de negócio de abono/esquecimento.
3. Planejar arquitetura de componentes.
4. Implementar UI desktop e mobile com experiências distintas.
5. Garantir compatibilidade com serviços existentes.
6. Remover legado visual.
7. Executar validação automatizada e checklist manual.
8. Produzir relatório final.

## Subagents obrigatórios

- `repo-mapper`: encontra rotas, arquivos, componentes, hooks e serviços.
- `abono-domain`: interpreta regras de negócio de abono/esquecimento.
- `api-contract`: protege contrato HTTP e DTOs.
- `ui-architecture`: desenha componentes e responsividade.
- `qa-a11y`: valida testes, build, lint e acessibilidade.
- `legacy-cleaner`: remove sobras visuais e código morto.

## Decisões obrigatórias

### Componentização sugerida

Criar uma pasta de feature, por exemplo:

```text
src/features/time-off-request/
├── components/
│   ├── TimeOffRequestPage.tsx
│   ├── TimeOffDesktopExperience.tsx
│   ├── TimeOffMobileExperience.tsx
│   ├── TimeOffHero.tsx
│   ├── TimeOffTypeSelector.tsx
│   ├── TimeOffDateTimeFields.tsx
│   ├── TimeOffManagerSelector.tsx
│   ├── TimeOffEvidenceUploader.tsx
│   ├── TimeOffApprovalSummary.tsx
│   ├── TimeOffOperationalChecklist.tsx
│   └── TimeOffMobileStepper.tsx
├── hooks/
│   └── useTimeOffRequestViewModel.ts
├── utils/
│   ├── timeOffFormatting.ts
│   └── timeOffValidation.ts
└── index.ts
```

A estrutura final pode variar conforme o padrão real do projeto, mas a separação entre experiência desktop e mobile deve existir.

### Página rota

`src/pages/RequestManualRegistration.tsx` deve ficar como thin wrapper ou ser substituído por um export limpo:

```tsx
export { TimeOffRequestPage as RequestManualRegistration } from "@/features/time-off-request";
```

Não manter a tela legada inteira se a nova feature já estiver validada.

## Regras de execução

- Não trocar a rota `/solicitar-abono`.
- Não trocar o nome público da tela sem atualizar metadados de rota.
- Não alterar endpoint `POST /records/time-off/request`.
- Não converter multipart em JSON puro.
- Não obrigar anexo se o back-end o aceita como opcional.
- Não remover validações existentes.
- Não criar dependência externa nova sem justificar.
- Não usar imagem facial, biometria ou LGPD como se fossem parte do abono.
- Não usar textos de férias na tela de abono.
- Se o mockup mobile anexado tiver conteúdo de férias, reaproveitar apenas a arquitetura visual, não os textos.

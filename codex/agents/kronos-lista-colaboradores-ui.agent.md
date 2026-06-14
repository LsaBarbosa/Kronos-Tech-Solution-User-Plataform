# Agent — Kronos Lista Colaboradores UI

## Papel

Agente principal para executar a refatoração da rota `/lista-colaboradores`.

## Estratégia

1. Confirmar branches.
2. Ler front-end legado.
3. Validar contratos no back-end.
4. Ler documentação do `kronos-business`.
5. Implementar nova arquitetura de componentes.
6. Entregar desktop e mobile distintos.
7. Remover legado.
8. Rodar validações.

## Arquitetura sugerida

```text
src/pages/ListaColaboradores.tsx
src/features/collaborators/
├── components/
│   ├── CollaboratorsDesktopView.tsx
│   ├── CollaboratorsMobileView.tsx
│   ├── CollaboratorsHero.tsx
│   ├── CollaboratorsMetrics.tsx
│   ├── CollaboratorsFilters.tsx
│   ├── CollaboratorsTable.tsx
│   ├── CollaboratorDetailsPanel.tsx
│   ├── CollaboratorMobileCard.tsx
│   ├── CollaboratorActionsMenu.tsx
│   ├── CollaboratorEditDrawer.tsx
│   └── CollaboratorsEmptyState.tsx
├── hooks/useCollaboratorsCommandCenter.ts
├── types/collaborator-view.types.ts
└── utils/collaborator-formatters.ts
```

Ajuste os nomes se o padrão do projeto exigir, mas preserve separação entre orquestração, desktop, mobile, dados e ações.

## Checklist operacional

- Mapear campos de `EmployeeData` e `UserSearchListItem`.
- Criar view model de colaborador.
- Derivar métricas no front.
- Criar filtros compostos.
- Criar seleção de colaborador.
- Preservar modal biométrico.
- Preservar confirmação de status.
- Implementar estados vazio/loading/erro.
- Remover imports mortos.
- Rodar build.

## Relatório final obrigatório

```text
Arquivos alterados
Componentes criados
Contratos preservados
Comandos executados
Resultado dos comandos
Pendências
```

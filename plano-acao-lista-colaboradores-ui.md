# Plano de ação — `/lista-colaboradores`

## Épico 01 — Preparação

### Task 01.01 — Confirmar branches

```bash
cd <front>; git branch --show-current
cd <back>; git branch --show-current
cd <docs>; git branch --show-current
```

Aceite: front em `feature/lgpd-compliance-new-ui`, back em `PROD_HOSTINGER_V2`, docs em `main`.

### Task 01.02 — Ler diretriz e mockups

Ler:

```text
references/docs/kronos_lista_colaboradores_diretriz_visual.md
references/mockups/kronos_lista_colaboradores_desktop.png
references/mockups/kronos_lista_colaboradores_mobile.png
```

Aceite: resumo das diferenças desktop/mobile antes de codar.

### Task 01.03 — Ler documentação de negócio

Ler `04-mapa-modulos-telas.md`, `08-rotas-guards-permissoes.md`, `03-atores-permissoes.md`, `04-fluxos-aplicacao.md`.

Aceite: confirmar `/lista-colaboradores` como rota de gestão do tenant para `MANAGER`.

## Épico 02 — Mapeamento técnico

### Task 02.01 — Mapear front-end legado

Ler `ListaColaboradores.tsx`, `useCollaboratorList.ts`, serviços e tipos.

Aceite: lista de dados, filtros e ações preservadas.

### Task 02.02 — Mapear back-end

Ler `ApiPaths.java`, `EmployeeController.java`, `UserController.java` e DTOs.

Aceite: confirmar endpoints e permissões sem alterar contrato.

## Épico 03 — Arquitetura

### Task 03.01 — Criar estrutura de componentes

Criar feature de colaboradores ou estrutura equivalente.

Aceite: `ListaColaboradores.tsx` vira orquestrador e não carrega toda a UI.

### Task 03.02 — Criar view model

Normalizar dados de colaborador + usuário.

Aceite: UI tem fallbacks para sem usuário, sem telefone, jornada incompleta e biometria desconhecida.

## Épico 04 — Desktop

- Hero com texto institucional.
- Métricas no topo.
- Filtros horizontais.
- Tabela operacional.
- Painel lateral de detalhes.
- Ações sensíveis com confirmação.

Aceite: desktop permite comparar colaboradores sem abrir múltiplas telas.

## Épico 05 — Mobile

- Topo compacto.
- Métricas rápidas.
- Busca grande.
- Chips de filtro.
- Cards de colaboradores.
- Menu contextual.
- Bottom sheet de detalhes.
- Rodapé com novo colaborador e limpar filtros.

Aceite: mobile não renderiza tabela.

## Épico 06 — Ações

- Editar cadastro.
- Salvar/cancelar edição.
- Ativar/desativar com confirmação.
- Cadastrar/atualizar biometria em modal separado.
- Novo colaborador.
- Limpar filtros.

Aceite: serviços atuais continuam usados.

## Épico 07 — Estados e acessibilidade

- Loading desktop/mobile.
- Estado vazio.
- Sem resultado.
- Erro com mensagem clara.
- Botões acessíveis.
- Status por texto.
- Foco visível.

## Épico 08 — Remoção do legado

Remover UI antiga, imports mortos e estados não usados.

## Épico 09 — Validação

```bash
npm run lint
npm run build
npm test # se existir
```

Entregar relatório final.

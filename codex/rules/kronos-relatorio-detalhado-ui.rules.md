# Rules — Kronos `/relatorio-detalhado`

## 1. Escopo

Refatorar apenas a experiência da rota `/relatorio-detalhado` no front-end, mantendo o contrato HTTP e regras de negócio atuais do back-end.

## 2. Proibições

- Não alterar endpoints do back-end.
- Não alterar DTOs do back-end.
- Não mudar `POST /records/report`.
- Não remover CSRF/preload antes de requisições mutáveis ou sensíveis.
- Não permitir que `PARTNER` selecione outro colaborador.
- Não habilitar PDF/CSV antes de existir resultado.
- Não apagar componentes compartilhados sem confirmar uso por outras telas.
- Não transformar mobile em tabela reduzida.
- Não transformar desktop em cards empilhados de mobile.

## 3. Regras funcionais

- `reference` deve aceitar somente `HH:mm`.
- Sem data selecionada, CTA de gerar relatório fica desabilitado e deve explicar o motivo.
- `status` deve ser multi-seleção por chips/checkboxes.
- `active` deve continuar existindo no payload.
- `employeeId` deve ser omitido quando o usuário puder consultar todos e não selecionou um colaborador.
- `employeeId` deve ser travado para `PARTNER` com base na sessão.
- Resultados devem continuar aceitando edição de registro quando o fluxo legado já permitir.
- Exportação PDF/CSV deve continuar usando dados já retornados.

## 4. Regras por ROLE

### CTO

- Exibir card de escopo administrativo ampliado.
- Comunicar que pode ter visão mais ampla.
- Se a seleção de empresa ainda não existir no produto, não inventar contrato; exibir somente a governança prevista.

### MANAGER

- Exibir escopo gerencial.
- Permitir seleção de colaborador conforme lista atual do serviço.
- Respeitar filtro de ativo/inativo.

### PARTNER

- Exibir escopo individual.
- Bloquear troca de colaborador.
- Mostrar texto claro: `Colaborador bloqueado pela sessão`.

## 5. UI/UX obrigatória

### Desktop

- Sidebar e header preservados.
- Hero institucional semelhante ao mockup.
- Layout em duas colunas.
- Construtor de relatório à esquerda.
- Governança e prévia à direita.
- Cards de ROLE visíveis.
- Área de datas selecionadas visível.
- CTA `Gerar relatório` e `Limpar filtros` separados.
- `Baixar PDF` e `Ver resultados` no painel de prévia, habilitados apenas após busca.

### Mobile

- Topo compacto.
- Card de escopo atual.
- Etapas verticais: datas, referência/status, visibilidade por ROLE.
- Rodapé fixo com resumo e CTA.
- Alvos de toque com pelo menos 44px.
- Sem tabela na montagem dos filtros.

## 6. Acessibilidade

- Campos com labels explícitos.
- Botões com texto visível.
- Estados e status com texto, não apenas cor.
- Erros próximos ao campo responsável.
- Loading anunciado por texto.
- Confirmações ou ações sensíveis acessíveis por teclado.

## 7. Remoção do legado

Após implementar e testar:

1. Localizar imports e referências de `RelatorioFiltros`.
2. Se for usado por `StatusRegistro` ou outra rota, não deletar o arquivo inteiro.
3. Remover apenas uso legado da rota `/relatorio-detalhado`.
4. Apagar componentes criados e depois abandonados.
5. Rodar build/lint para confirmar ausência de imports mortos.

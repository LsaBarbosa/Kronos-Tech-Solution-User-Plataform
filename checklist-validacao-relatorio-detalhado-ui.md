# Checklist de validação — `/relatorio-detalhado`

## Contrato e dados

- [ ] `POST /records/report` continua sendo usado.
- [ ] `employeeId` continua sendo query param opcional.
- [ ] Body contém `reference`, `active`, `dates` e `statuses` quando houver status.
- [ ] `reference` é validado como `HH:mm`.
- [ ] Ao menos uma data é obrigatória.
- [ ] `dates` mantém padrão aceito pelo back-end.
- [ ] `fetchDetailedReport` não foi quebrado.
- [ ] Exportação PDF usa `reportData` já carregado.
- [ ] CSV, se mantido, usa `reportData` já carregado.

## ROLE

- [ ] `PARTNER` vê escopo individual.
- [ ] `PARTNER` não consegue trocar colaborador.
- [ ] `PARTNER` envia apenas o próprio colaborador ou segue a regra atual de sessão.
- [ ] `MANAGER` consegue selecionar colaborador permitido.
- [ ] `MANAGER` vê filtro ativo/inativo.
- [ ] `CTO` recebe comunicação visual de escopo administrativo.
- [ ] Nenhuma ROLE visualiza ação que o contrato não suporta.

## Desktop

- [ ] Hero igual em intenção ao mockup desktop.
- [ ] Layout em duas colunas.
- [ ] Construtor de relatório à esquerda.
- [ ] Governança/prévia à direita.
- [ ] Cards `CTO`, `MANAGER`, `PARTNER` visíveis.
- [ ] Datas selecionadas aparecem como chips ou área dedicada.
- [ ] `Gerar relatório` e `Limpar filtros` separados.
- [ ] `Baixar PDF` desabilitado sem resultado.
- [ ] `Ver resultados` desabilitado sem resultado.

## Mobile

- [ ] Não usa tabela para filtros.
- [ ] Topo compacto conforme mockup.
- [ ] Card `Escopo atual` visível.
- [ ] Etapa 1: datas.
- [ ] Etapa 2: referência/status.
- [ ] Etapa 3: visibilidade por ROLE.
- [ ] Rodapé fixo com resumo e CTA.
- [ ] Botões têm área mínima de 44px.
- [ ] Conteúdo não fica escondido atrás do rodapé.

## Estados

- [ ] Sem datas: CTA bloqueado e explicação visível.
- [ ] Referência inválida: erro próximo ao campo.
- [ ] Loading: botão mostra carregamento.
- [ ] Sem resultado: estado vazio claro.
- [ ] Com resultado: área de resultado visível.
- [ ] Exportando PDF: feedback/local loading ou toast.
- [ ] Erro de busca: mensagem clara e não técnica.

## Acessibilidade

- [ ] Inputs têm labels.
- [ ] Chips têm texto.
- [ ] Status não depende apenas de cor.
- [ ] Foco visível nos controles.
- [ ] Botões têm texto ou `aria-label`.
- [ ] Erros são textuais.
- [ ] Loading é textual.

## Limpeza

- [ ] `RelatorioDetalhado.tsx` não mantém layout legado extenso.
- [ ] `RelatorioFiltros` não foi apagado se ainda usado por `StatusRegistro`.
- [ ] Imports mortos removidos.
- [ ] Componentes abandonados removidos.
- [ ] `npm run lint` passa.
- [ ] `npm run build` passa.

# Rules — Kronos `/aprovacoes-abono`

## Regras obrigatórias

1. Não alterar contratos HTTP.
2. Não alterar método, path ou payload dos endpoints de abono.
3. Não remover download de evidência/anexo.
4. Não permitir aprovação/rejeição sem confirmação.
5. Não exibir ação de aprovar/rejeitar para status finalizado.
6. Não usar tabela no mobile.
7. Não transformar desktop e mobile em simples redimensionamento.
8. Não deixar o legado renderizando em paralelo no resultado final.
9. Não mascarar erros com mensagens genéricas quando houver retorno de erro administrativo já tratado.
10. Não introduzir dependências externas sem necessidade e sem validar o impacto no bundle.

## Regras de domínio

- `PENDING` representa filtro de pendências.
- Solicitações pendentes podem corresponder a `TIME_OFF_REQUEST` e `WORK_TIME_REQUEST`.
- Aprovação usa `approveTimeOff(timeRecordId)`.
- Rejeição usa `rejectTimeOff(timeRecordId)`.
- Listagem usa `listTimeOffRequests({ page, size, employeeName, status })`.
- Evidência deve usar `resolveDocumentId(record)` e `downloadDocument(...)` quando aplicável.

## Regras visuais

- Pendência: amarelo.
- Aprovação: verde.
- Rejeição: vermelho.
- Evidência/anexo: roxo.
- Seleção: borda azul e destaque não dependente apenas de cor.
- Botões de decisão devem ter texto visível.

## Regras de acessibilidade

- Botões devem ter texto ou `aria-label` claro.
- Cards selecionáveis devem ser acionáveis por teclado quando usados como botão.
- Status deve ser textual, não apenas visual.
- Modal/dialog de confirmação deve aceitar teclado.
- O foco deve retornar para o elemento de origem após fechar confirmação.
- Áreas de toque mobile devem ter pelo menos 44px.

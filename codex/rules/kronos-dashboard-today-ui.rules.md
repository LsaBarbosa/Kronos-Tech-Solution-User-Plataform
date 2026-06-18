# Rules — Kronos Dashboard Today UI

## Regras obrigatórias

1. Usar `/records/me/today` como fonte principal da área de ponto do dia.
2. Preservar o fluxo atual de check-in.
3. Não recriar a dashboard do zero.
4. Não remover cards de perfil, avisos, pendências ou atalhos existentes.
5. Desktop e mobile devem ser diferentes, não apenas responsivos por tamanho.
6. Não inventar campos fora do DTO do back-end.
7. Não usar valores hardcoded de status, horário, source ou timezone em produção.
8. Não registrar resposta completa do endpoint em `console.log`.
9. Tratar loading, erro e vazio.
10. Criar testes para mapeamento de status, nextAction, timeline e resumo.
11. Rodar validações ao final.

## Regras de UI

- `nextAction` controla CTA principal.
- `status` deve ser textual e colorido.
- `lastRecordAt` e `lastRecordType` devem ficar próximos da próxima ação.
- `records[]` deve ser exibido como linha do tempo.
- `source` e `timezone` devem aparecer como metadados de confiança.
- Registro pendente: amarelo.
- Registro criado/concluído: verde.
- Inconsistência/erro: vermelho.
- Metadados/source/cache: roxo ou teal.

## Regras de segurança/LGPD

- Não persistir dados do ponto em localStorage/sessionStorage.
- Não expor dados em query string desnecessária.
- Preservar `withCredentials`/CSRF atuais.
- Não alterar cookies.
- Não ignorar guardas biométricos existentes.

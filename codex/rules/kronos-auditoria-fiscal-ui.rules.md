# Rules — Kronos Auditoria Fiscal UI

## Regras funcionais

1. Preservar a rota `/auditoria`.
2. Preservar acesso restrito a `MANAGER` e `CTO`.
3. Preservar:
   - `downloadAej(startDate, endDate)`
   - `downloadAfd()`
   - `downloadTechnicalCertificate()`
4. `AEJ` deve exigir período/mês.
5. `AFD` não deve exigir mês.
6. `ATESTADO` não deve exigir mês.
7. Loading deve impedir dupla geração.
8. O nome/descrição prevista do arquivo deve refletir o tipo selecionado.
9. Erro deve ser exibido com linguagem administrativa.
10. Não exibir opções que pareçam alterar dados fiscais; a tela apenas gera/baixa.

## Regras visuais

1. Desktop e mobile devem ter navegação diferente.
2. Desktop deve usar console em duas colunas.
3. Mobile deve usar fluxo guiado e CTA fixo.
4. Usar paleta da diretriz:
   - `#0B1220`, `#101A33`, `#2563EB`, `#0D9488`, `#7C3AED`.
5. Card selecionado deve ter destaque visual.
6. CTA deve mostrar o tipo selecionado.
7. Atestado deve exibir aviso de arquivo estático.
8. AFD deve deixar claro que não usa filtro mensal obrigatório.
9. AEJ deve comunicar que usa período/mês.
10. Não usar tabela no mobile.

## Regras de segurança e conformidade

1. Não registrar dados sensíveis em console.
2. Não expor token, cookie ou headers sensíveis.
3. Não alterar políticas CSRF/JWT.
4. Não criar bypass de autorização no front.
5. Não alterar endpoints sem necessidade.

## Regras de limpeza

1. Remover layout legado centralizado antigo.
2. Remover imports não usados.
3. Remover funções mortas.
4. Não manter dois componentes concorrentes para a mesma tela.
5. Atualizar nomes sem quebrar lazy imports.

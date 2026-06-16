# Rules — Kronos LGPD Admin Request Details UI

## Regras obrigatórias

### Contratos e segurança

1. Preserve a rota real `/lgpd/admin/requests/:requestId`.
2. Preserve o uso de `requestId` vindo de `useParams`.
3. Preserve `getAdminRequestDetails`.
4. Preserve `transitionRequestStatus`.
5. Preserve `requestComplementFromDataSubject`.
6. Preserve `cancelLgpdRequest`.
7. Preserve `exportApprovedLgpdRequestData`.
8. Preserve `getAnonymizationResult`.
9. Preserve `AdminAnonymizationWorkflow` para `ANONYMIZATION` e `DELETION`, salvo se for refatorado com equivalência funcional.
10. Não execute exportação sem:
    - fundamento legal;
    - motivo operacional;
    - notas do revisor.
11. Não aprove exportação sem justificativa e escopo.
12. Não rejeite solicitação sem motivo e nota pública.
13. Não cancele sem motivo e somente permita cancelamento para `CTO`, se esta já for a regra atual.
14. Não grave dados LGPD em `localStorage` ou `sessionStorage`.
15. Não logue payloads de exportação, descrição, notas ou dados pessoais.

### UI/UX

16. Desktop deve ter layout de sala de controle.
17. Mobile deve ter fluxo por cartões e barra inferior de próxima decisão.
18. Mobile não deve usar tabela.
19. Status deve ser textual e colorido.
20. Histórico deve permanecer visível no desktop.
21. Histórico no mobile deve ser acessível sem ocupar a tela inteira.
22. Próxima ação deve ser evidente.
23. Ações avançadas devem ter menor destaque.
24. Estados de loading, erro e não encontrado são obrigatórios.
25. O botão de voltar deve levar para `/lgpd/admin/requests`.

### Acessibilidade

26. Todo botão de ícone precisa de `aria-label`.
27. Inputs com erro precisam de `aria-invalid` e `aria-describedby`.
28. Erros devem usar `role="alert"` quando aplicável.
29. Elementos clicáveis não nativos precisam de `tabIndex` e teclado.
30. Não depender apenas de cor para status.

### Qualidade

31. Rodar `npm run lint`.
32. Rodar `npx tsc --noEmit`.
33. Rodar `npm run build`.
34. Rodar `npx vitest run`.
35. Corrigir regressões causadas pela refatoração.
36. Remover imports, helpers e componentes antigos sem uso.
37. Não deixar código duplicado de desktop/mobile para regras críticas; extraia helpers.

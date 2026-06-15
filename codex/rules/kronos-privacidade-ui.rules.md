# Rules — Kronos `/privacidade` UI

## Regras globais

1. A rota oficial é `/privacidade`.
2. A página alvo é `src/pages/PrivacyCenter.tsx`.
3. A refatoração é visual/experiencial; não alterar contrato HTTP.
4. Desktop e mobile devem ter composições de navegação diferentes.
5. O mobile não pode ser só uma versão encolhida do desktop.
6. A UI deve seguir os mockups e a diretriz visual.
7. Após validação, remover o legado visual antigo ativo na rota.

## Regras LGPD

1. Exportação de dados pessoais exige confirmação.
2. Solicitações LGPD devem ter status textual.
3. Consentimento biométrico deve indicar estado atual.
4. Revogação precisa explicar consequência.
5. Catálogo de tratamento precisa comunicar finalidade, base legal, retenção e sensibilidade.
6. DPO deve estar claramente disponível.
7. Histórico de consentimentos deve continuar acessível.

## Regras de segurança visual

1. Não exibir material biométrico.
2. Não mostrar CPF, salário ou dados sensíveis fora do escopo da tela.
3. Exportação JSON deve ser descrita como ação sensível.
4. Revogação de consentimento deve ser visualmente separada de ações comuns.
5. Ações destrutivas ou sensíveis exigem confirmação.

## Regras de responsividade

### Desktop

- Usar painel com hero, grid, ações e governança lateral.
- Exibir mais densidade informacional.
- Permitir leitura simultânea de ações, solicitações recentes e governança.

### Mobile

- Usar cards verticais.
- Usar CTA fixo inferior.
- Usar fluxo de toque com alvos mínimos de 44px.
- Abrir formulário/confirmar exportação em modal, sheet ou etapa dedicada.

## Regras de teste

Executar no mínimo:

```bash
npm run lint
npm run build
```

Se houver testes configurados:

```bash
npm test
```

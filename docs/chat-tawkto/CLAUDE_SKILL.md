# Claude Skill — TAWK.to + Front-end Kronos

## Objetivo

Orientar o Claude Code na implementação do suporte por chat com TAWK.to modo free no front-end Kronos.

## Branches

- Front-end: `chat`, criada a partir de `homolog`.
- Back-end: `chat`, criada a partir de `homolog`.
- Documentação: `kronos-business`, branch `main` como fonte de negócio.

## Leitura inicial obrigatória

- `package.json`
- `.env.example`
- `.env.production.example`
- `src/App.tsx`
- `src/config/api.ts`
- `src/config/api-routes.ts`
- `src/context/AuthContext.tsx`
- `src/components/faq/FaqBottomSheet.tsx`
- `src/components/faq/FaqContextualBlock.tsx`
- `src/components/faq/FaqSearchDialog.tsx`
- `src/components/faq/faqPathMapping.ts`
- `src/constants/faqScreenKeys.ts`
- `src/components/ui/RESPONSIVE_DESIGN_GUIDE.md`
- `src/components/ui/ACCESSIBILITY_GUIDE.md`

## Entregáveis

1. Serviço isolado para TAWK.to.
2. Bootstrap consultando o back-end.
3. Identificação do usuário logado com dados permitidos.
4. FAQ contextual antes do atendimento.
5. Experiência desktop própria.
6. Experiência mobile própria.
7. Eventos de uso enviados ao back-end.
8. Limpeza da sessão no logout.
9. Feature flag por ambiente.
10. Testes e documentação.

## Desktop

Criar painel ou entrada contextual com FAQ, status de atendimento, contexto da tela e botão para abrir chat.

## Mobile

Criar bottom sheet ou ação flutuante compacta, com cards de FAQ e botão principal para abrir atendimento.

## Validação

Executar:

- `npm run lint`
- `npm run test`
- `npm run build`

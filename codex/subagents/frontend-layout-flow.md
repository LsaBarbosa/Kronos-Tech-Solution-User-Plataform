# Subagent — Layout e Fluxo da Tela

## Foco

Criar a experiência visual do terminal isolado de ponto.

## Arquivos prováveis

- `src/App.tsx`
- `src/config/app-routes.ts`
- `src/pages/CheckinTerminal.tsx`
- `src/features/checkin-terminal/**`
- `src/components/ui/**`

## Tasks

1. Criar rota `/checkin` fora das rotas protegidas.
2. Criar página própria sem menu lateral e sem dashboard.
3. Criar estados visuais: inicial, captura, envio, sucesso e erro.
4. Adicionar botão `Registrar ponto`.
5. Adicionar botão `Sair`.
6. Adicionar botão de reinício do dispositivo de captura.
7. Mobile: layout vertical com CTA grande.
8. Desktop: painel central ou split view com status lateral.
9. Garantir acessibilidade básica em botões, mensagens e estados.

## Testes

- render inicial;
- transição para etapa de captura;
- sucesso com timer;
- botão sair;
- mensagem de erro.

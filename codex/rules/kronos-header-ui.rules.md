# Rules — Kronos Header UI

## Regras obrigatórias

1. O `Header` deve ser fixo no topo das rotas autenticadas.
2. O `Header` deve ter versão desktop e mobile com estrutura distinta.
3. O botão `Registrar ponto` deve usar o fluxo existente de `CheckinContext`.
4. A role deve estar sempre visível em contexto autenticado.
5. O status de sessão deve aparecer como informação de confiança.
6. O indicador LGPD/consentimento deve ser visual, sem excesso de texto.
7. O menu lateral deve permanecer acessível.
8. Avisos devem aparecer por ícone/badge.
9. Logout deve ficar em menu de conta, não como ação acidental.
10. A autorização final continua no back-end.

## Regras de preservação

- Não quebrar `AuthContext`.
- Não quebrar `CheckinContext`.
- Não quebrar `Sidebar`.
- Não quebrar `CheckinModal`.
- Não alterar endpoints.
- Não alterar `APP_PATHS` sem necessidade.
- Não alterar `RoleRoute` sem necessidade.
- Não remover rotas públicas de LGPD.
- Não expor salário ou dado sensível no header.

## Regras visuais

- Usar a paleta da diretriz.
- Usar bordas arredondadas, cards/chips e visual premium.
- O desktop pode ter densidade informacional.
- O mobile deve ser compacto e priorizar ação.
- Altura do header deve ser previsível.
- O conteúdo principal deve manter espaçamento superior suficiente.
- Não sobrepor modais, sidebar ou check-in.

## Regras de acessibilidade

- Todo botão só com ícone deve ter `aria-label`.
- Menu de conta deve ser operável por teclado.
- Badges precisam ter texto acessível.
- Foco visível em todos os controles.
- Contraste mínimo aceitável.
- Área de toque mobile mínima de 44px.

## Regras de cleanup

- Remover código morto do header legado.
- Remover estilos antigos não utilizados.
- Não manter dois headers concorrentes.
- Não duplicar lógica de role/sessão em várias páginas.
- Atualizar testes quando necessário.

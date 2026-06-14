# Checklist de validação — `/criar-colaborador`

## Rota e permissão

- [ ] `/criar-colaborador` renderiza a nova tela.
- [ ] A rota continua permitida apenas para `MANAGER`.
- [ ] `ProtectedRoute` e `RoleRoute` seguem funcionando.
- [ ] Não há rota duplicada conflitante.

## Desktop

- [ ] Possui sidebar.
- [ ] Possui header contextual.
- [ ] Possui hero institucional.
- [ ] Possui cards de progresso.
- [ ] Possui painel de ficha do colaborador.
- [ ] Possui painel lateral de vínculo de acesso.
- [ ] Possui resumo de escala.
- [ ] Possui resumo de jornada.
- [ ] Botões principais estão próximos do contexto.
- [ ] A tela não parece um formulário longo sem hierarquia.

## Mobile

- [ ] Possui topo compacto.
- [ ] Possui stepper.
- [ ] Usa cards verticais.
- [ ] Usa CTA fixo inferior.
- [ ] Não replica tabela/grade desktop.
- [ ] Reduz campos simultâneos.
- [ ] Alvos de toque têm pelo menos 44px.
- [ ] Próximo passo fica claro.

## Fluxo de CPF

- [ ] CPF vazio bloqueia avanço.
- [ ] CPF incompleto bloqueia verificação.
- [ ] CPF indisponível mostra erro.
- [ ] CPF disponível mostra selo verde.
- [ ] Criação do colaborador exige CPF disponível.

## Fluxo de colaborador

- [ ] `POST /employee` recebe o mesmo payload funcional.
- [ ] `preloadCsrfToken` permanece antes da mutação.
- [ ] Loading aparece no CTA.
- [ ] Sucesso do passo 1 mostra confirmação.
- [ ] `employeeId` é preservado para o passo 2.
- [ ] Passo 1 concluído bloqueia edição acidental.

## Escala e jornada

- [ ] `TRADITIONAL_5X2` mostra dias fixos.
- [ ] `SIX_BY_ONE_FIXED` mostra configuração aplicável.
- [ ] `ROTATING_12X36` mostra data de ciclo.
- [ ] `ROTATING_24X72` mostra data de ciclo.
- [ ] `SIX_BY_ONE_TWO_WEEKENDS` mostra folga aplicável.
- [ ] `SIX_BY_ONE_ONE_WEEKEND` mostra índice de final de semana.
- [ ] Jornada exibe entrada, intervalo e saída.
- [ ] Home office `false` comunica geolocalização obrigatória.
- [ ] Home office `true` comunica dispensa de geolocalização.

## Fluxo de usuário

- [ ] Passo de acesso fica bloqueado antes do colaborador salvo.
- [ ] Username incompleto bloqueia verificação.
- [ ] Username indisponível mostra erro.
- [ ] Username disponível mostra selo verde.
- [ ] Role permite apenas `MANAGER` e `PARTNER`.
- [ ] `POST /users` recebe `username`, `role`, `employeeId`.
- [ ] Conclusão reseta o fluxo.

## Estados e erros

- [ ] Estado carregando no CPF.
- [ ] Estado carregando no username.
- [ ] Estado salvando colaborador.
- [ ] Estado criando usuário.
- [ ] Erro de API exibido sem mensagem técnica excessiva.
- [ ] Erro fica perto do contexto afetado.
- [ ] Estado final de sucesso claro.

## Segurança e privacidade

- [ ] CPF não aparece em logs.
- [ ] Payload sensível não aparece em `console.log`.
- [ ] Dados salariais não são destacados de forma indevida.
- [ ] Botões sensíveis possuem confirmação visual quando aplicável.
- [ ] Não há alteração de contrato back-end.

## Build

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Teste manual no desktop.
- [ ] Teste manual no mobile.
- [ ] Remoção do legado confirmada.

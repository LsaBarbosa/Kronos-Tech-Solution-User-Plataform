# Subagent — qa-a11y

## Objetivo

Validar build, lint, comportamento e acessibilidade.

## Checklist técnico

- `npm install` somente se necessário.
- `npm run lint`
- `npm run build`
- testes existentes, se houver.
- verificar erros TypeScript.
- verificar imports não usados.
- verificar regressão de rota.
- verificar responsividade com largura mobile e desktop.

## Checklist funcional

- Selecionar `TIME_OFF_REQUEST`.
- Selecionar `FORGOTTEN_REGISTRATION`.
- Preencher datas e horários válidos.
- Escolher gestor.
- Enviar sem anexo.
- Enviar com anexo permitido.
- Tentar arquivo inválido.
- Tentar fim antes do início.
- Tentar mesmo dia com hora final menor.
- Tentar enviar duas vezes durante loading.

## Checklist acessibilidade

- Labels em todos os campos.
- Foco visível.
- `aria-label` em botões de ícone.
- Mensagens de erro legíveis.
- Contraste adequado.
- Navegação por teclado.
- Alvos mínimos de 44px no mobile.

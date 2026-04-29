# Biometric Liveness Plan

## Situação atual

O front envia `livenessPassed` no payload de `POST /auth/login-face`, mas a validacao ainda e apenas contratual.

## Risco

Sem liveness real, a captura pode aceitar imagens estaticas e abrir margem para spoofing.

## Estrategia futura

- Capturar multiplos frames.
- Exigir desafio de movimento.
- Validar piscada ou microexpressao.
- Enviar evidencias adicionais para validacao no backend.
- Avaliar um servico especializado se a precisao interna nao for suficiente.

## Critérios de aceite

- O liveness nao pode depender de um literal fixo.
- O backend deve conseguir validar a evidencia recebida.
- A UI deve explicar claramente quando a validacao e apenas parcial.


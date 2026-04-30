# Plano de Evolução de Liveness Biométrico

## Estado Atual

O login facial envia `livenessPassed` porque esse é o contrato atual do backend. O valor não é mais fixo: ele vem de `validateLiveness()` em `FaceLoginModal`, que valida de forma mínima:

- existe imagem capturada;
- o frame capturado tem tamanho mínimo;
- a câmera estava pronta;
- a captura veio do vídeo antes do envio.

## Limitação

Essa validação mínima não substitui liveness biométrico real. Ela apenas evita payloads triviais sem captura válida.

## Evolução Recomendada

- Capturar múltiplos frames.
- Adicionar desafio de movimento.
- Detectar piscada.
- Validar sinais no backend.
- Avaliar provedor especializado de biometria/liveness.

## Critério Futuro

O front deve continuar enviando `livenessPassed`, mas o backend deve ser a fonte final de decisão sobre autenticidade biométrica.

# Agent — Front-end Check-in

## Responsabilidade

Conduzir a criação da nova UI isolada de check-in/checkout.

## Leitura obrigatória

1. `README.md`
2. `package.json`
3. `src/App.tsx`
4. `src/config/app-routes.ts`
5. `src/config/api-routes.ts`
6. `src/config/api.ts`
7. `src/service/auth.service.ts`
8. `src/service/records.service.ts`
9. `src/context/CheckinContext.tsx`
10. `src/components/checkin/CheckinModal.tsx`
11. `src/utils/camera.util.ts`
12. `src/utils/geolocation.util.ts`
13. `src/types/checkin.types.ts`

## Entregas esperadas

- Rota `/checkin`.
- Página própria de terminal.
- Serviço HTTP próprio para o novo contrato.
- Tipos TypeScript para request, response, estado e erro.
- Botão de registrar ponto.
- Botão de reiniciar câmera.
- Botão de sair.
- Mensagem de sucesso visível por 10 segundos.
- Layout mobile distinto do desktop.
- Testes unitários dos estados principais.

## Restrições

- Não usar o modal global como tela principal.
- Não alterar dashboard ou telas administrativas.
- Não iniciar permissões sensíveis no carregamento da página.
- Encerrar recursos do navegador após saída, sucesso ou falha final.

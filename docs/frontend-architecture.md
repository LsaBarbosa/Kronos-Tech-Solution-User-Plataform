# Frontend Architecture

Arquitetura resumida do front-end da Kronos.

## Estrutura

- `src/config`: cliente HTTP e rotas de API.
- `src/service`: integracao com o backend por dominio.
- `src/hooks`: estado e orquestracao de telas.
- `src/pages`: telas de negocio.
- `src/components`: componentes reutilizaveis e guardas de rota.
- `src/test`: testes de contrato, integracao mockada e setup do Vitest.

## Fluxo de dados

1. A UI chama um hook ou pagina.
2. O hook usa um service.
3. O service usa o Axios centralizado em `src/config/api.ts`.
4. Erros HTTP sao normalizados em `ServiceError`.
5. A UI mostra mensagens orientadas por contrato.

## Regras de contrato

- Nao consumir endpoints legados removidos.
- Nao chamar servicos de geolocalizacao direto no navegador.
- Tratar `429` e `503` como comportamento operacional, nao como erro genérico.
- Manter os contratos criticos cobertos por testes de guard.

## Ponto de atencao

- O backend `flag/redis` expoe `/geolocation/resolve`; o front deve consumir esse endpoint em vez de chamar geocoding externo.
- O login facial usa `livenessPassed` a partir de validacao minima local como compatibilidade contratual.
- O espelho de ponto aceita `targetEmployeeId?` para gestores.

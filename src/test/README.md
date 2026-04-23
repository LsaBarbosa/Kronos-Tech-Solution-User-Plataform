# Testes do front-end

Esta pasta concentra a infraestrutura compartilhada dos testes automatizados do front-end.

## Stack

- `Vitest`: runner de testes.
- `React Testing Library`: renderizacao e assercoes focadas no comportamento dos componentes.
- `MSW`: mock de chamadas HTTP sem acoplar testes a um backend real.
- `@testing-library/jest-dom`: matchers de DOM para assercoes mais legiveis.

## Comandos

```bash
npm run test
npm run test:watch
```

## Estrutura

- `src/test/setup.ts`: setup global do Vitest, limpeza do DOM, limpeza do `localStorage` e ciclo de vida do MSW.
- `src/test/mocks/server.ts`: servidor MSW usado pelos testes.
- Testes ficam ao lado do codigo testado com sufixo `.test.ts` ou `.test.tsx`.

## Cobertura inicial

- Helper de normalizacao: `src/service/helpers/__tests__/response-normalizer.helper.test.ts`.
- Rota protegida: `src/components/ProtectedRoute.test.tsx`.
- Client HTTP centralizado: `src/config/api.test.ts`.

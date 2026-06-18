# Kronos User Platform

Front-end corporativo da plataforma Kronos para operações de jornada, documentos, aprovações, privacidade e experiência autenticada do usuário.

## Visão Geral

Este repositório concentra a aplicação web usada pelos públicos operacionais e administrativos da plataforma Kronos. A interface foi construída para suportar rotinas críticas de RH, ponto, documentos e conformidade sem duplicar regras de negócio que pertencem ao back-end.

O front-end consome contratos HTTP do ecossistema Kronos, preserva autenticação baseada em sessão/cookie e organiza a experiência em módulos responsivos para desktop e mobile.

## Responsabilidades do Repositório

- autenticação, sessão e navegação protegida;
- dashboard operacional;
- registro e acompanhamento de ponto;
- espelho de ponto e relatórios;
- avisos, pendências e atalhos operacionais;
- gestão de documentos e assinaturas;
- fluxos de férias, abonos e aprovações;
- centro de privacidade e fluxos LGPD;
- integração visual com contratos publicados pelo back-end.

## Stack Principal

| Camada | Tecnologia |
|---|---|
| Framework | React 18 |
| Build | Vite |
| Linguagem | TypeScript |
| Roteamento | React Router DOM |
| HTTP | Axios |
| Estado assíncrono | TanStack React Query |
| Formulários | React Hook Form + Zod |
| UI base | Tailwind CSS + Radix UI + componentes compartilhados |
| Gráficos | Recharts |
| Testes unitários | Vitest + Testing Library + MSW |
| Testes E2E | Playwright |

## Arquitetura da Aplicação

O código está organizado para separar shell, páginas, componentes compartilhados, features e integrações HTTP:

```text
src/
  components/   componentes reutilizáveis e blocos de interface
  config/       rotas, navegação e configuração de cliente
  context/      sessão, check-in e providers globais
  features/     módulos de negócio orientados por domínio
  hooks/        hooks de composição e acesso a dados
  pages/        páginas roteadas
  service/      consumo de API e normalização de payloads
  test/         setup e utilitários de teste
  types/        contratos tipados do front-end
  utils/        helpers de apoio
```

## Integração com o Ecossistema Kronos

Este repositório depende de dois pares principais:

- `Kronos-Tech-Solutions-KTS`: API principal, autenticação, regras de negócio, persistência e integrações externas;
- `kronos-business`: documentação funcional, arquitetura e contratos de referência.

O front-end não deve inventar endpoints, DTOs ou regras que não existam nesses repositórios de origem.

## Execução Local

### Pré-requisitos

- Node.js instalado em versão LTS compatível com Vite;
- npm disponível no ambiente;
- back-end Kronos acessível localmente ou em ambiente de homologação;
- arquivo de ambiente configurado a partir de `.env.example`.

### Variáveis de ambiente

Base disponível em [`.env.example`](/home/kronos/Documentos/Codigin/kronos/Kronos-Tech-Solution-User-Plataform/.env.example).

Principais chaves:

- `VITE_API_BASE_URL`
- `VITE_BIOMETRIC_LIVENESS_REQUIRED`
- `VITE_OBSERVABILITY_ENABLED`
- `VITE_OBSERVABILITY_ENDPOINT`
- `VITE_GOOGLE_MAPS_API_KEY`

### Subida do projeto

```bash
npm install
npm run dev
```

Em produção, a aplicação pode consumir a API pelo mesmo domínio da SPA. Se `VITE_API_BASE_URL` não for definida no build, o front usa `window.location.origin`.

## Qualidade e Validação

Comandos principais:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

Comandos auxiliares:

```bash
npm run test:coverage
npm run test:watch
npm run generate:api-types
npm run analyze
npm run preview
```

## Convenções Operacionais

- a fonte de verdade de rotas e navegação deve permanecer centralizada na configuração da aplicação;
- contratos devem ser normalizados na camada `service`, não dispersos em componentes;
- estado de carregamento, vazio e erro deve ser explícito;
- dados sensíveis não devem ser expostos em logs, mocks persistentes ou mensagens de erro;
- alterações visuais devem preservar responsividade e o padrão UX do shell existente.

## Documentação Relacionada

Materiais complementares do próprio repositório:

- `docs/openapi/`
- `docs/contracts/`
- `docs/architecture/`
- `docs/security/`
- `docs/testing/`
- `docs/deploy/`
- `docs/flag-redis-adherence.md`
- `docs/api-contract-map.md`

## Fluxo de Colaboração

1. alinhar a mudança com o contrato da API e com a documentação de negócio;
2. implementar preservando serviços, rotas e guards existentes;
3. validar lint, testes e build;
4. revisar impacto em desktop e mobile;
5. registrar ajustes relevantes na documentação quando necessário.

## Repositórios Relacionados

- Back-end: `../Kronos-Tech-Solutions-KTS`
- Documentação: `../kronos-business`

## Licença e Uso

Uso interno do ecossistema Kronos. Distribuição, publicação externa ou reaproveitamento fora do contexto autorizado do projeto deve seguir a governança da organização.

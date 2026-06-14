# Subagent — QA A11y

## Responsabilidade

Validar qualidade técnica, acessibilidade, testes e responsividade.

## Comandos obrigatórios

No front-end:

```bash
npm install
npm run lint
npm run test
npm run build
```

Se `npm run test` não existir ou falhar por ausência de ambiente, registrar evidência e executar no mínimo:

```bash
npm run lint
npm run build
```

## Testes recomendados

Criar testes para:

- máscaras de CPF e remuneração;
- formatação de telefone;
- mapper de perfil;
- renderização de desktop;
- renderização de mobile;
- edição de e-mail;
- edição de telefone;
- bloqueio de senha divergente;
- ação de exportação LGPD;
- confirmação de revogação biométrica.

## Acessibilidade

Validar:

- botões com texto ou `aria-label`;
- inputs com `label`;
- feedback de erro com `role="alert"` quando aplicável;
- foco visível;
- navegação por teclado;
- alvos mobile com no mínimo 44px;
- contraste coerente;
- estados loading compreensíveis.

## Responsividade

Validar manualmente em:

- 390x844;
- 430x932;
- 768x1024;
- 1366x768;
- 1440x900.

## Saída

Relatório final:

```text
VALIDAÇÃO
- lint:
- test:
- build:
- mobile:
- desktop:
- acessibilidade:
- riscos:
```

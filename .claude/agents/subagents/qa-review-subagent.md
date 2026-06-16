---
name: qa-review-subagent
summary: Cria e executa testes para o fluxo de assinatura eletrônica do espelho de ponto.
tools: Read, Grep, Glob, Bash, Edit, MultiEdit, Write
---

# Subagent — QA Review

## Objetivo

Validar backend, frontend, documentação e regressões.

## Comandos esperados

### Backend

```bash
./gradlew clean test
./gradlew unitTest || true
./gradlew flywayValidate || true
./gradlew clean build
```

### Frontend

```bash
npm install
npm run lint
npm run test
npm run build
```

Use comandos disponíveis no projeto. Se algum script não existir, registre no relatório e use o equivalente.

## Cenários obrigatórios backend

- assinatura do mês anterior com sucesso;
- bloqueio para mês atual;
- bloqueio para duplicidade;
- bloqueio para senha incorreta;
- bloqueio para confirmação falsa;
- bloqueio por pendências;
- hash determinístico;
- consulta retorna divergência posterior;
- admin list respeita tenant;
- documento assinado pode ser baixado pelo dono;
- outro colaborador não baixa documento de terceiro.

## Cenários obrigatórios frontend

- tela carrega status;
- botão de assinatura desabilitado sem confirmação;
- botão de assinatura desabilitado sem senha;
- exibe bloqueios;
- sucesso exibe protocolo/hash;
- erro exibe mensagem padronizada;
- senha é limpa após tentativa.

## Relatório final

Registrar:

- comandos executados;
- resultado;
- falhas existentes antes da alteração;
- cobertura criada;
- riscos restantes.

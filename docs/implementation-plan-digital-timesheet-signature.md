# Plano de Ação — Assinatura Digital do Ponto Mensal

## 1. Escopo

Implementar assinatura eletrônica do espelho de ponto do mês anterior no Kronos.

Repos/branches alvo:

| Camada | Repositório | Branch |
|---|---|---|
| Backend | `LsaBarbosa/Kronos-Tech-Solutions-KTS` | `PROD_HOSTINGER_V2` |
| Frontend | `LsaBarbosa/Kronos-Tech-Solution-User-Plataform` | `PROD_HOSTINGER_v2` |
| Documentação | `LsaBarbosa/kronos-business` | `main` |

## 2. Decisão funcional

O colaborador autenticado deve conseguir assinar eletronicamente o espelho de ponto do mês imediatamente anterior.

A assinatura deve representar **ciência/conferência**, não renúncia de direito.

A primeira versão deve ser uma assinatura eletrônica interna com evidência robusta:

- autenticação via sessão existente;
- reautenticação por senha;
- confirmação expressa;
- hash do PDF do espelho;
- hash do snapshot dos registros;
- IP, User-Agent e timestamp do servidor;
- documento assinado/evidência armazenado;
- auditoria;
- retenção trabalhista/fiscal.

## 3. Épicos, histórias e tasks

## Épico 01 — Análise e desenho técnico

### História 01.01 — Confirmar arquitetura atual

Tasks:

1. Conferir branches corretas.
2. Ler documentação técnica do backend.
3. Ler documentação do front em `kronos-business`.
4. Localizar services/controllers de ponto, espelho, documentos, autenticação, auditoria e LGPD.
5. Registrar mapa de impacto.

Entregável:

- nota técnica curta com arquivos impactados.

### História 01.02 — Definir contrato da funcionalidade

Tasks:

1. Definir estados da assinatura.
2. Definir endpoints.
3. Definir DTOs.
4. Definir regras de bloqueio.
5. Definir formato de evidência.
6. Definir texto de declaração v1.

Entregável:

- contrato backend/frontend antes de codar.

## Épico 02 — Backend: domínio e persistência

### História 02.01 — Criar modelo de domínio

Tasks:

1. Criar `TimesheetSignature`.
2. Criar enums de status, tipo e método.
3. Criar DTOs de request/response.
4. Criar UseCase.

### História 02.02 — Criar migration e provider

Tasks:

1. Criar `tb_timesheet_signature`.
2. Criar índice único para assinatura ativa por colaborador/período.
3. Criar entity/repository/mapper/provider.
4. Testar persistência.

## Épico 03 — Backend: regra de assinatura

### História 03.01 — Calcular mês anterior no backend

Tasks:

1. Usar `America/Sao_Paulo`.
2. Calcular primeiro e último dia do mês anterior.
3. Impedir período enviado pelo cliente.
4. Criar testes para virada de ano.

### História 03.02 — Validar pendências do período

Tasks:

1. Buscar registros do período.
2. Bloquear registro aberto indevido.
3. Bloquear aprovações pendentes.
4. Bloquear abonos/esquecimentos pendentes.
5. Bloquear férias pendentes.
6. Retornar lista de bloqueios amigável.

### História 03.03 — Gerar hash canônico

Tasks:

1. Criar serialização determinística.
2. Ordenar registros.
3. Normalizar datas.
4. Calcular SHA-256.
5. Criar testes para estabilidade do hash.

### História 03.04 — Gerar e armazenar documento assinado

Tasks:

1. Reutilizar `PointMirrorPdfService`.
2. Calcular hash do PDF.
3. Adicionar página/rodapé de assinatura se viável.
4. Salvar via DocumentService/provider.
5. Adicionar `DocumentType.TIMESHEET_MIRROR_SIGNED` se necessário.

### História 03.05 — Assinar com reautenticação

Tasks:

1. Validar senha atual com `PasswordEncoder`.
2. Validar confirmação e declaração.
3. Resolver IP/User-Agent no backend.
4. Persistir assinatura.
5. Registrar auditoria.
6. Retornar protocolo.

## Épico 04 — Backend: endpoints

### História 04.01 — Status e preview

Tasks:

1. `GET /records/timesheet-signatures/previous-month/status`.
2. `GET /records/timesheet-signatures/previous-month/preview`.
3. Status deve indicar assinado, pendente, bloqueado ou divergente.

### História 04.02 — Assinatura

Tasks:

1. `POST /records/timesheet-signatures/previous-month/sign`.
2. Exigir `confirmed = true`.
3. Exigir senha.
4. Exigir hash compatível quando aplicável.
5. Rejeitar duplicidade.

### História 04.03 — Download e administração

Tasks:

1. `GET /records/timesheet-signatures/{signatureId}/document`.
2. `GET /records/timesheet-signatures/admin`.
3. Validar dono ou gestor do tenant.

## Épico 05 — Frontend

### História 05.01 — Service HTTP e types

Tasks:

1. Criar `timesheetSignatureService.ts`.
2. Criar types.
3. Usar cliente Axios existente com CSRF/cookies.

### História 05.02 — Tela do colaborador

Tasks:

1. Criar `AssinaturaPonto.tsx` ou integrar em `EspelhoPonto`.
2. Exibir status do mês anterior.
3. Exibir bloqueios.
4. Exibir declaração.
5. Capturar senha.
6. Submeter assinatura.
7. Exibir protocolo/hash.

### História 05.03 — Rotas/menu

Tasks:

1. Atualizar `APP_PATHS`.
2. Atualizar `APP_ROUTE_META`.
3. Atualizar `App.tsx`.
4. Garantir rota protegida para qualquer colaborador autenticado.

## Épico 06 — Documentação

### História 06.01 — Atualizar contratos e fluxos

Tasks:

1. Atualizar contratos API.
2. Atualizar mapa de telas.
3. Atualizar fluxos front.
4. Atualizar models/DTOs.

### História 06.02 — Atualizar LGPD e ADR

Tasks:

1. Atualizar segurança/LGPD front.
2. Criar ADR da assinatura eletrônica.
3. Atualizar changelog.

## Épico 07 — Testes e revisão

### História 07.01 — Testes backend

Tasks:

1. Unitários de service.
2. Testes de controller.
3. Testes de provider/migration quando viável.
4. Testes de autorização.

### História 07.02 — Testes frontend

Tasks:

1. Testar estados da tela.
2. Testar submit.
3. Testar bloqueios.
4. Testar sucesso/erro.

### História 07.03 — Revisão final

Tasks:

1. Rodar build backend.
2. Rodar build frontend.
3. Verificar logs.
4. Verificar LGPD.
5. Verificar que AFD/AEJ/NSR não foram alterados.

## 4. Comandos de execução

### Backend

```bash
cd Kronos-Tech-Solutions-KTS
git checkout PROD_HOSTINGER_V2
git pull
./gradlew clean test
./gradlew clean build
```

### Frontend

```bash
cd Kronos-Tech-Solution-User-Plataform
git checkout PROD_HOSTINGER_v2
git pull
npm install
npm run lint
npm run test
npm run build
```

### Documentação

```bash
cd kronos-business
git checkout main
git pull
grep -R "espelho\|ponto\|contratos\|LGPD" -n .
```

## 5. Riscos e observações

| Risco | Tratamento |
|---|---|
| Assinatura interna ser confundida com ICP-Brasil | Nomear como `INTERNAL_ADVANCED`; documentar limitação. |
| Alteração posterior de ponto assinado | Detectar divergência por hash e exibir status específico. |
| Assinatura com pendências | Bloquear até resolver. |
| Vazamento de dado pessoal em log | Revisão com `security-lgpd-subagent`. |
| Duplicidade | Índice único + validação transacional. |
| Contestação trabalhista | Texto não pode renunciar direitos; manter canal de correção. |

## 6. Definition of Done

- Colaborador assina o mês anterior.
- Gestor não assina por colaborador.
- Evidência salva.
- Documento assinado disponível.
- Auditoria registrada.
- Testes relevantes passando.
- Documentação atualizada.

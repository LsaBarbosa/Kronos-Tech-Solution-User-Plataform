# Checklist de validação — Dashboard Today

## Branches

- [ ] Back-end em `prod-redis`.
- [ ] Front-end em `feature/lgpd-compliance-new-ui`.
- [ ] Documentação em `main`.

## Contrato

- [ ] `GET /records/me/today` confirmado no back-end.
- [ ] `TodayTimeRecordStatusResponse` lido.
- [ ] `TodayTimeRecordItemResponse` lido.
- [ ] Service front-end criado e tipado.
- [ ] Endpoint usa autenticação/cookie/CSRF já existentes via `api`.

## Integração dashboard

- [ ] `Dashboard.tsx` preservado com `PageShell`.
- [ ] `DashboardDesktop` preservado e enriquecido.
- [ ] `DashboardMobile` preservado e enriquecido.
- [ ] Áreas de avisos, perfil e pendências continuam visíveis.
- [ ] Novo painel substitui/enriquece o card de ponto sem duplicar CTA.

## Desktop

- [ ] Mostra data.
- [ ] Mostra timezone.
- [ ] Mostra source.
- [ ] Mostra status.
- [ ] Mostra nextAction.
- [ ] Mostra último registro.
- [ ] Mostra timeline.
- [ ] Mostra resumo/consistência.
- [ ] CTA principal abre check-in.
- [ ] CTA secundário navega para relatório/espelho quando aplicável.

## Mobile

- [ ] Experiência não é tabela.
- [ ] Próxima ação aparece em destaque.
- [ ] Status atual aparece em destaque.
- [ ] Timeline aparece em cards.
- [ ] Resumo rápido aparece.
- [ ] Source/timezone aparecem como metadados.
- [ ] CTA principal está acessível com uma mão.
- [ ] Bottom nav não cobre conteúdo.

## Estados

- [ ] Loading.
- [ ] Erro + tentar novamente.
- [ ] Sem registro hoje.
- [ ] Entrada registrada.
- [ ] Almoço iniciado.
- [ ] Almoço finalizado.
- [ ] Dia completo.
- [ ] Registro pendente.
- [ ] Sequência inconsistente.

## Segurança/LGPD

- [ ] Nenhum dado de ponto persistido em localStorage/sessionStorage.
- [ ] Nenhum payload sensível em console.
- [ ] Check-in biométrico/geolocalização preservado.
- [ ] Sem alteração em cookies/CSRF/AuthContext.
- [ ] Source/timezone exibidos sem expor dados sensíveis.

## Testes e comandos

- [ ] Testes de formatadores.
- [ ] Testes de renderização.
- [ ] Teste do CTA `openCheckin`.
- [ ] `npm run lint`
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] `npx vitest run`

## Validação visual

- [ ] Mobile 390x844.
- [ ] Mobile 430x932.
- [ ] Desktop 1366x768.
- [ ] Desktop 1536x864.
- [ ] Desktop 1920x1080.

# Checklist de validação — `/solicitar-ferias`

## 1. Ambiente

- [ ] Back-end em `PROD_HOSTINGER_V2`.
- [ ] Front-end em `feature/lgpd-compliance-new-ui`.
- [ ] Documentação em `main`.
- [ ] `npm install` executado.
- [ ] Baseline de `lint` registrado.
- [ ] Baseline de `build` registrado.

## 2. Arquivos visuais

- [ ] `kronos_solicitar_ferias_diretriz_visual.md` encontrado.
- [ ] `kronos_solicitar_ferias_desktop.png` encontrado.
- [ ] `kronos_solicitar_ferias_mobile.png` encontrado.
- [ ] Diretriz visual lida.
- [ ] Mockup desktop usado.
- [ ] Mockup mobile usado.

## 3. Contrato backend

- [ ] `POST /records/vacation-request` confirmado.
- [ ] Payload `startDate`, `endDate`, `managerId` confirmado.
- [ ] Datas enviadas como `yyyy-MM-dd`.
- [ ] Retorno `List<Long>`/`number[]` preservado.
- [ ] Permissão `ANY_EMPLOYEE` para solicitar confirmada.
- [ ] Permissão `MANAGER` para aprovar/rejeitar confirmada.

## 4. Front-end legado

- [ ] `src/pages/RequestVacation.tsx` lido.
- [ ] `src/hooks/useVacationRequest.ts` lido.
- [ ] `src/service/records.service.ts` lido.
- [ ] `src/types/vacation.ts` lido.
- [ ] Rota `/solicitar-ferias` preservada.
- [ ] Legado removido após nova implementação.

## 5. Nova arquitetura

- [ ] `src/features/vacation-request` criado.
- [ ] `VacationRequestShell` criado.
- [ ] `VacationRequestDesktop` criado.
- [ ] `VacationRequestMobile` criado.
- [ ] `useVacationRequestViewModel` criado/refatorado.
- [ ] Utilitários de data criados.
- [ ] Testes unitários criados.

## 6. Desktop

- [ ] Experiência de painel, não formulário simples.
- [ ] Sidebar persistente.
- [ ] Header superior.
- [ ] Hero da tela.
- [ ] Grid informativo.
- [ ] Seleção de período.
- [ ] Seleção de manager.
- [ ] Painel de revisão.
- [ ] Regras/próximos passos visíveis.
- [ ] CTA contextual.
- [ ] Estado de sucesso.
- [ ] Estado de erro.
- [ ] Estado de loading.

## 7. Mobile

- [ ] Experiência em etapas.
- [ ] Sem sidebar persistente.
- [ ] Header compacto.
- [ ] Stepper/chips.
- [ ] Etapa de período.
- [ ] Etapa de manager.
- [ ] Etapa de revisão.
- [ ] CTA fixo no rodapé.
- [ ] Alvos de toque >= 44px.
- [ ] Safe area respeitada.
- [ ] Sem overflow horizontal.

## 8. Validações

- [ ] `startDate` obrigatório.
- [ ] `endDate` obrigatório.
- [ ] `managerId` obrigatório.
- [ ] Data inicial não pode ser passada.
- [ ] Data final não pode ser passada.
- [ ] Data final não pode ser anterior à inicial.
- [ ] Botão desabilitado quando inválido.
- [ ] Mensagem de erro próxima ao contexto.
- [ ] Toast não é a única forma de erro crítico.

## 9. Acessibilidade

- [ ] Labels explícitos.
- [ ] `aria-label` nos botões iconográficos.
- [ ] Foco visível.
- [ ] Contraste adequado.
- [ ] Erro não depende só de cor.
- [ ] Loading acessível.
- [ ] Botões têm texto claro.

## 10. Testes e build

- [ ] `npm run lint` executado.
- [ ] `npm run build` executado.
- [ ] `npm run test` executado.
- [ ] Testes novos passam.
- [ ] Falhas pré-existentes documentadas, se houver.

## 11. Resultado final

- [ ] Arquivos criados listados.
- [ ] Arquivos alterados listados.
- [ ] Arquivos removidos listados.
- [ ] Contratos preservados listados.
- [ ] Diferenças desktop/mobile descritas.
- [ ] Pendências registradas.

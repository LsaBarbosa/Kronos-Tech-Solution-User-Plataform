# Skill — Kronos `/solicitar-abono` UI Refactor

## Objetivo

Executar a refatoração completa da rota `/solicitar-abono` no front-end Kronos, convertendo a tela legada `RequestManualRegistration` em uma experiência moderna, segura e responsiva para solicitação de:

- `TIME_OFF_REQUEST`: abono de horas, justificativa médica, folga acordada ou ausência justificada;
- `FORGOTTEN_REGISTRATION`: esquecimento de ponto, quando a marcação não foi registrada.

A skill deve preservar o contrato HTTP existente e alterar apenas a arquitetura visual, composição de componentes, experiência de uso, validação de interface e limpeza do legado.

## Repositórios obrigatórios

### Back-end

- Repo: `Kronos-Tech-Solutions-KTS`
- Branch: `PROD_HOSTINGER_V2`

Ler obrigatoriamente:

- `src/main/java/com/kts/kronos/adapter/in/web/http/TimeRecordController.java`
- `src/main/java/com/kts/kronos/adapter/in/web/dto/timerecord/RequestTimeOffRequest.java`
- `src/main/java/com/kts/kronos/domain/model/enuns/RequestType.java`
- `src/main/java/com/kts/kronos/constants/ApiPaths.java`
- `src/main/java/com/kts/kronos/application/service/TimeRecordService.java`
- testes WebMvc relacionados a `time-off/request`, se existirem.

### Front-end

- Repo: `Kronos-Tech-Solution-User-Plataform`
- Branch: `feature/lgpd-compliance-new-ui`

Ler obrigatoriamente:

- `src/App.tsx`
- `src/config/app-routes.ts`
- `src/pages/RequestManualRegistration.tsx`
- `src/hooks/useManualRegister.ts`
- `src/service/records.service.ts`
- `src/types/vacation.ts`
- `src/types/recordApproval.ts`
- `src/types/document.ts`
- `src/components/PageShell.tsx`
- `src/components/Header.tsx`
- `src/components/Sidebar.tsx`
- `src/components/ui/*` usados pela tela
- `package.json`

### Documentação

- Repo: `kronos-business`
- Branch: `main`

Ler obrigatoriamente:

- `04-mapa-modulos-telas.md`
- `05-entradas-saidas-fluxos.md`
- `08-rotas-guards-permissoes.md`
- `03-atores-permissoes.md`
- `15-testes.md`, se existir.

### Diretrizes visuais e mockups

Procurar no workspace:

- `kronos_solicitar_abono_desktop.png`
- `kronos_solicitar_abono_mobile.png`
- `kronos_solicitar_abono_diretriz_visual.md`

Se a diretriz específica de abono não existir, usar:

1. os mockups como fonte principal de layout;
2. a diretriz de `/usuario` apenas como referência de identidade visual geral;
3. documentação `kronos-business` como fonte de regras de negócio.

## Princípios de implementação

### Não alterar contrato HTTP

Manter o envio via multipart:

- part `request`: JSON
- part `document`: arquivo opcional

O JSON deve manter:

```ts
{
  startDate: string;
  endDate: string;
  startHour: string;
  endHour: string;
  managerId: string;
  type: "TIME_OFF_REQUEST" | "FORGOTTEN_REGISTRATION";
}
```

### Não criar regra de negócio nova no front-end

O front-end pode:

- orientar preenchimento;
- validar campos obrigatórios;
- impedir inconsistências evidentes;
- explicar impacto do tipo selecionado;
- exibir resumo operacional.

O front-end não deve:

- aprovar solicitação;
- alterar status de ponto diretamente;
- simular regras de banco;
- inventar cálculo trabalhista definitivo;
- alterar endpoint do back-end;
- enviar dados fora do DTO aceito.

### UX desktop

A experiência desktop deve funcionar como **painel operacional de composição e revisão**:

- sidebar/rail persistente;
- header com breadcrumb `Kronos / Jornada / Solicitar abono`;
- hero institucional com gradiente;
- card principal de composição;
- card lateral de resumo para aprovação;
- checklist operacional;
- seção de política de anexo;
- botão principal visível próximo ao resumo.

### UX mobile

A experiência mobile deve funcionar como **fluxo guiado por etapas**:

- sem sidebar;
- header compacto;
- stepper horizontal;
- etapas: `Tipo`, `Período`, `Gestor`, `Evidência`, `Revisão`;
- cards empilhados;
- bottom action fixa com resumo e CTA;
- seletores amigáveis ao toque;
- alvos mínimos de 44px;
- upload simplificado;
- resumo antes do envio.

### Acessibilidade

Garantir:

- labels associados aos campos;
- `aria-label` em botões icon-only;
- foco visível;
- mensagens de erro semanticamente claras;
- contraste adequado;
- navegação por teclado;
- loading anunciável;
- preview de arquivo com nome, tipo e tamanho;
- ação de remover anexo com label textual ou `aria-label`.

### Segurança e LGPD

- Não exibir dados sensíveis desnecessários.
- Não logar conteúdo de documento.
- Não persistir arquivo em estado além do necessário.
- Não exibir caminho local do arquivo.
- Validar tipo e tamanho no front-end antes do envio.
- Explicar que a evidência é protegida e será usada apenas no fluxo de análise.
- Não permitir envio duplo durante loading.

## Critérios de aceite

1. `/solicitar-abono` renderiza a nova tela.
2. A tela usa o mesmo hook/serviço ou uma evolução compatível.
3. O payload enviado ao back-end permanece compatível.
4. `TIME_OFF_REQUEST` e `FORGOTTEN_REGISTRATION` são opções explícitas.
5. A tela desktop não é apenas mobile esticado.
6. A tela mobile não é apenas desktop comprimido.
7. O legado visual é removido após a nova implementação passar nos testes.
8. `npm run build` passa.
9. `npm run lint` passa ou o agente registra claramente o motivo técnico de falha preexistente.
10. Testes manuais de envio com e sem anexo são documentados.

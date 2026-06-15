# Plano de ação — Refatoração `/auditoria`

## Fase 0 — Preparação

### Task 0.1 — Confirmar branchs
- Back-end: `PROD_HOSTINGER_V2`
- Front-end: `feature/lgpd-compliance-new-ui`
- Documentação: `main`

### Task 0.2 — Ler referências visuais
- `references/docs/kronos_auditoria_fiscal_diretriz_visual.md`
- `references/mockups/kronos_auditoria_fiscal_desktop.png`
- `references/mockups/kronos_auditoria_fiscal_mobile.png`

### Task 0.3 — Mapear arquivos atuais
Ler:
- `src/pages/AuditoriaFiscal.tsx`
- `src/service/fiscal.service.ts`
- `src/config/api-routes.ts`
- `src/config/app-routes.ts`
- `src/App.tsx`
- `src/context/AuthContext.tsx`

## Fase 1 — Contrato e domínio

### Task 1.1 — Confirmar rotas front-end
Validar que:
- `/auditoria` existe em `APP_PATHS`.
- A rota renderiza `AuditoriaFiscal`.
- A rota está protegida para `MANAGER` e `CTO`.

### Task 1.2 — Confirmar contratos back-end
Validar:
- `GET /legal/technical-certificate`
- `GET /legal/afd`
- `GET /legal/aej?startDate=&endDate=`

### Task 1.3 — Confirmar regras de geração
- `AEJ` exige mês/período.
- `AFD` não exige mês.
- `ATESTADO` é estático.

## Fase 2 — Arquitetura visual

### Task 2.1 — Definir estado mínimo
Manter estado para:
- tipo selecionado: `AEJ | AFD | ATESTADO`;
- mês selecionado;
- loading;
- feedback;
- abertura do calendário, se usado.

### Task 2.2 — Criar layout desktop
Implementar:
- hero institucional;
- cards de arquivos;
- seleção de mês;
- painel lateral de conformidade;
- CTA contextual.

### Task 2.3 — Criar layout mobile
Implementar:
- header compacto;
- seleção de tipo compacta;
- etapa de referência;
- etapa de prévia;
- CTA fixo.

### Task 2.4 — Aplicar paleta
Usar tokens/classes compatíveis com Tailwind e projeto atual, mantendo a paleta da diretriz.

## Fase 3 — Integração

### Task 3.1 — Preservar downloads
Manter chamadas:
- `FiscalService.downloadAej(startDate, endDate)`
- `FiscalService.downloadAfd()`
- `FiscalService.downloadTechnicalCertificate()`

### Task 3.2 — Ajustar validações
- Bloquear AEJ sem data.
- Não bloquear AFD por ausência de data.
- Não bloquear ATESTADO por ausência de data.

### Task 3.3 — Feedback
- Loading por tipo.
- Toast de sucesso.
- Erro administrativo.

## Fase 4 — Limpeza do legado

### Task 4.1 — Remover layout antigo
Remover card único antigo e radio group antigo, se substituídos.

### Task 4.2 — Remover imports mortos
Eliminar ícones, componentes e helpers não usados.

### Task 4.3 — Garantir uma única tela ativa
Não manter duas versões paralelas da rota.

## Fase 5 — Qualidade

### Task 5.1 — Build e lint
Executar:
```bash
npm run lint
npm run build
```

### Task 5.2 — Teste manual desktop
Validar:
- AEJ selecionado com mês baixa arquivo.
- AFD baixa sem mês obrigatório.
- ATESTADO baixa sem mês obrigatório.
- Loading impede clique duplo.
- Painel lateral atualiza conforme tipo.

### Task 5.3 — Teste manual mobile
Validar:
- Não há tabela.
- CTA fixo visível.
- Toque confortável.
- Fluxo guiado compreensível.

### Task 5.4 — Entrega
Registrar:
- arquivos alterados;
- comandos executados;
- riscos;
- decisões.

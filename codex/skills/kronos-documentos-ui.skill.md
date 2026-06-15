# Skill — Kronos `/documentos` UI Refactor

## Objetivo

Refatorar a rota `/documentos` do front-end `Kronos-Tech-Solution-User-Plataform` na branch `feature/lgpd-compliance-new-ui`, transformando a tela atual de busca documental em uma **central de busca documental segura**.

A nova tela deve seguir a diretriz visual:

- `references/docs/kronos_documentos_diretriz_visual.md`

E os mockups:

- `references/mockups/kronos_documentos_desktop.png`
- `references/mockups/kronos_documentos_mobile.png`

## Escopo da implementação

A refatoração deve atuar prioritariamente sobre a tela:

- `src/pages/Documentos.tsx`

E sobre lógica de apoio quando necessário:

- `src/hooks/useDocumentsPage.ts`
- `src/service/document.service.ts`
- `src/types/document.ts`
- componentes UI reutilizados em `src/components`
- rotas e metadados quando houver impacto em labels, breadcrumbs ou navegação

## Contratos obrigatórios preservados

Não alterar contrato HTTP sem necessidade. A UI deve continuar usando:

- `GET /documents?employeeId=&date=&type=`
- `GET /documents/{documentId}?employeeId=`
- `DELETE /documents/{documentId}?employeeId=`
- `GET /employee?active=`

A refatoração é de experiência, composição visual, estados e organização. O backend `PROD_HOSTINGER_V2` deve ser tratado como contrato já existente.

## Experiência esperada

### Desktop

Implementar experiência de **console documental**:

- sidebar persistente;
- header com contexto da rota e role atual;
- hero institucional com cards de escopo `CTO`, `MANAGER`, `PARTNER`;
- construtor de filtros em grade;
- chips/taxonomia de tipos documentais;
- painel lateral de resultados;
- ações de download e exclusão;
- bloco de governança documental;
- filtros e resultados visíveis lado a lado.

### Mobile

Implementar experiência de **busca guiada**:

- topo compacto sem reproduzir a tabela/console desktop;
- card de escopo atual;
- etapas verticais:
  1. Tipo de documento;
  2. Filtros;
  3. Resultados;
- lista de documentos em cards;
- CTA fixo inferior;
- explicação de permissão no rodapé;
- área mínima de toque de 44px.

## Regras de negócio da tela

1. `PARTNER` não deve selecionar outro colaborador.
2. `PARTNER` deve buscar apenas documentos próprios.
3. `CTO` deve ter comunicação visual de escopo amplo.
4. `MANAGER` deve selecionar colaboradores permitidos.
5. Tipo documental é obrigatório.
6. Data é filtro opcional.
7. Download é ação primária do resultado.
8. Exclusão é ação destrutiva e exige confirmação explícita.
9. Documentos devem ser tratados visualmente como dados sensíveis.
10. Desktop e mobile devem ser experiências diferentes, não apenas redimensionamentos.

## Tipos documentais obrigatórios

A UI deve contemplar:

| Enum | Label |
|---|---|
| `PAYSLIP` | Contracheque |
| `TIME_OFF` | Abono de Horas |
| `DOCUMENTS` | Documentos |
| `EMPLOYEE_DOCUMENTS` | Documentos Pessoais |
| `POINT_RECORD_RECEIPT` | Comprovante de Ponto |
| `BIOMETRIC_CONSENT_TERM` | Termo de Consentimento Biométrico |
| `SERVICE_CONTRACT_TERMS` | Termo de Contrato de Serviço |

## Estados obrigatórios

- Sem funcionário selecionado: CTA desabilitado para `CTO/MANAGER`.
- `PARTNER`: colaborador bloqueado pela sessão.
- Sem tipo documental: CTA desabilitado.
- Buscando: loading localizado no CTA e skeleton/lista de resultados.
- Sem documentos: estado vazio com sugestão de alterar filtros.
- Com documentos: lista com nome, tipo, data, download e exclusão quando permitida.
- Download: feedback de início.
- Exclusão: confirmação destrutiva com nome do arquivo.

## Paleta

Usar a paleta da diretriz, sem introduzir outra identidade visual principal:

- `#0B1220` azul noite;
- `#101A33` azul meia-noite;
- `#2563EB` azul principal;
- `#22D3EE` ciano técnico;
- `#16A34A` sucesso;
- `#F59E0B` atenção;
- `#DC2626` erro/exclusão;
- `#7C3AED` CTO;
- `#0D9488` PARTNER;
- `#F8FAFC` fundo;
- `#FFFFFF` superfície;
- `#E2E8F0` borda.

## Restrições

- Não remover validações existentes.
- Não quebrar `useDocumentsPage`.
- Não alterar `document.service.ts` sem necessidade real.
- Não criar mocks estáticos em produção substituindo dados reais.
- Não exibir seleção de funcionário para `PARTNER`.
- Não deixar exclusão sem confirmação.
- Não deixar PDF/download parecendo ação antes da busca.
- Não manter componentes legados duplicados após a refatoração.

## Critério de conclusão

A tarefa só termina quando:

- `/documentos` funciona para `CTO`, `MANAGER` e `PARTNER`;
- `/meus-documentos`, caso reutilize `Documentos`, continua coerente;
- mobile e desktop têm estruturas diferentes;
- build e lint passam;
- legado visual da tela anterior foi removido;
- a documentação do pacote foi seguida.

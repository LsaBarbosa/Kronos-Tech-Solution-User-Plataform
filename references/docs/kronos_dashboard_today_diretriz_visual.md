# Kronos — Diretriz visual de negócio para a Dashboard orientada a `/records/me/today`

## 1. Objetivo da refatoração

A Dashboard deve passar a priorizar a resposta do endpoint `/records/me/today`.

O objetivo é transformar a tela inicial em um painel operacional do dia, mostrando de forma clara:

- data atual do registro;
- status do ponto do dia;
- próxima ação esperada;
- último registro realizado;
- tipo do último registro;
- marcações já feitas no dia;
- origem dos dados;
- timezone;
- estado de consistência da sequência de ponto.

---

## 2. Dados de negócio usados

A resposta de `/records/me/today` deve ser tratada como fonte principal da área de ponto do dia.

Campos esperados:

| Campo | Uso visual |
|---|---|
| `date` | Competência diária exibida no topo. |
| `status` | Estado operacional do ponto. |
| `nextAction` | CTA principal da dashboard. |
| `lastRecordAt` | Última marcação do usuário. |
| `lastRecordType` | Tipo da última marcação. |
| `records[]` | Linha do tempo do dia. |
| `records[].actionType` | Tipo de cada evento. |
| `records[].recordedAt` | Horário de cada evento. |
| `records[].status` | Situação do registro. |
| `records[].source` | Origem da marcação. |
| `source` | Origem consolidada da resposta. |
| `timezone` | Contexto temporal usado pela aplicação. |

---

## 3. Conceito visual

### Nome conceitual

**Today Workday Command Center**

A dashboard deixa de ser apenas uma página genérica e passa a responder:

> “Como está meu ponto hoje e qual é a próxima ação correta?”

---

## 4. Experiência desktop

No desktop, a dashboard deve usar:

1. **Hero diário**
   - data;
   - timezone;
   - origem;
   - status do dia.

2. **Card principal**
   - status atual;
   - próxima ação;
   - último registro;
   - botão de registrar próxima ação;
   - botão para espelho/relatório.

3. **Linha do tempo**
   - marcações do dia;
   - tipo de ação;
   - horário;
   - status;
   - origem.

4. **Cards de apoio**
   - saldo parcial;
   - consistência da sequência;
   - pendências de sincronização;
   - origem/cache.

---

## 5. Experiência mobile

No mobile, a dashboard deve ser orientada ao uso com uma mão:

- topo compacto;
- próxima ação em destaque;
- card principal de status;
- linha do tempo em cards;
- resumo rápido;
- CTA fixo inferior.

Mobile não deve ser uma versão reduzida do desktop.  
Mobile deve responder rapidamente: **“o que faço agora?”**

---

## 6. Regras de UX

- `nextAction` deve controlar o CTA principal.
- `status` deve ser textual e colorido.
- `lastRecordAt` deve aparecer próximo da próxima ação.
- `records[]` deve virar linha do tempo.
- `timezone` deve ser visível para reduzir dúvidas de horário.
- `source` deve aparecer como metadado de confiança.
- Registro pendente/sincronização offline deve usar amarelo.
- Erro ou inconsistência de sequência deve usar vermelho.
- Registros criados com sucesso devem usar verde.
- O botão de ponto deve ser a ação mais forte da tela.

---

## 7. Estados obrigatórios

| Estado | Como deve aparecer |
|---|---|
| Sem registro hoje | CTA de primeira entrada. |
| Entrada registrada | CTA para saída de almoço ou saída conforme regra. |
| Almoço iniciado | CTA para retorno de almoço. |
| Almoço finalizado | CTA para saída final. |
| Dia completo | CTA desabilitado ou “jornada concluída”. |
| Registro pendente | Selo amarelo. |
| Sequência inconsistente | Alerta vermelho. |
| Carregando endpoint | Skeleton nos cards. |
| Falha no endpoint | Estado de erro e tentar novamente. |

---

## 8. Paleta de cores

| Papel | Hexadecimal | RGB | Uso |
|---|---:|---:|---|
| Azul noite | `#0B1220` | `rgb(11, 18, 32)` | Sidebar e topo institucional. |
| Azul meia-noite | `#101A33` | `rgb(16, 26, 51)` | Gradientes. |
| Azul profundo | `#1E3A8A` | `rgb(30, 58, 138)` | Texto institucional. |
| Azul principal | `#2563EB` | `rgb(37, 99, 235)` | CTA principal e seleção. |
| Ciano técnico | `#22D3EE` | `rgb(34, 211, 238)` | Navegação ativa e tecnologia. |
| Verde sucesso | `#16A34A` | `rgb(22, 163, 74)` | Registros criados e sequência OK. |
| Verde suave | `#DCFCE7` | `rgb(220, 252, 231)` | Fundo positivo. |
| Amarelo pendência | `#F59E0B` | `rgb(245, 158, 11)` | Status aberto, pendência ou sincronização. |
| Amarelo suave | `#FEF3C7` | `rgb(254, 243, 199)` | Fundo de pendência. |
| Vermelho erro | `#DC2626` | `rgb(220, 38, 38)` | Erro, sequência inconsistente ou conflito. |
| Vermelho suave | `#FEE2E2` | `rgb(254, 226, 226)` | Fundo de erro. |
| Roxo metadados | `#7C3AED` | `rgb(124, 58, 237)` | Source, cache e rastreabilidade. |
| Roxo suave | `#EDE9FE` | `rgb(237, 233, 254)` | Fundo de metadados. |
| Teal confiança | `#0D9488` | `rgb(13, 148, 136)` | Último registro, origem validada e LGPD. |
| Teal suave | `#CCFBF1` | `rgb(204, 251, 241)` | Fundo de confiança. |
| Fundo claro | `#F8FAFC` | `rgb(248, 250, 252)` | Fundo principal. |
| Superfície | `#FFFFFF` | `rgb(255, 255, 255)` | Cards e painéis. |
| Borda | `#E2E8F0` | `rgb(226, 232, 240)` | Contornos e separadores. |
| Texto principal | `#0F172A` | `rgb(15, 23, 42)` | Títulos. |
| Texto secundário | `#64748B` | `rgb(100, 116, 139)` | Descrições. |
| Texto terciário | `#94A3B8` | `rgb(148, 163, 184)` | Labels auxiliares. |

---

## 9. Resultado esperado

A dashboard refatorada deve transmitir:

- estado atual do ponto do dia;
- próxima ação sem ambiguidade;
- rastreabilidade dos registros;
- confiança no timezone e na origem;
- experiência distinta entre desktop e mobile;
- melhor usabilidade para o colaborador registrar ponto.

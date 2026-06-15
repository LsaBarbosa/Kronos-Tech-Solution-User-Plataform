# Kronos — Diretriz visual de negócio para `/auditoria`

## 1. Objetivo da tela

A rota `/auditoria` deve ser uma **central de arquivos legais e fiscais**, voltada à conformidade de jornada.

A experiência precisa permitir:

- escolher o tipo de arquivo fiscal;
- gerar `AEJ`;
- gerar `AFD`;
- gerar `ATESTADO` técnico;
- selecionar mês de referência quando aplicável;
- iniciar download;
- comunicar finalidade fiscal e trabalhista.

---

## 2. Arquivos disponíveis

| Arquivo | Descrição | Filtro |
|---|---|---|
| `AEJ` | Arquivo Eletrônico de Jornada | Usa mês/período. |
| `AFD` | Arquivo Fonte de Dados | Não depende do mês na tela atual. |
| `ATESTADO` | Atestado Técnico | Documento estático. |

---

## 3. Conceito visual

### Nome conceitual

**Fiscal Compliance Console**

A tela deve transmitir conformidade, documentação legal, segurança e prontidão para fiscalização.

---

## 4. Desktop e mobile

### Desktop

O desktop deve usar:

- cards grandes para cada arquivo;
- seleção de mês;
- painel lateral de conformidade;
- prévia de nome de arquivo;
- CTA de download;
- explicação operacional.

### Mobile

O mobile deve usar:

- fluxo guiado;
- seleção por cards compactos;
- referência mensal;
- prévia do arquivo;
- CTA fixo.

---

## 5. Paleta de cores

| Papel | Hexadecimal | RGB | Uso |
|---|---:|---:|---|
| Azul noite | `#0B1220` | `rgb(11, 18, 32)` | Sidebar e topo. |
| Azul meia-noite | `#101A33` | `rgb(16, 26, 51)` | Gradientes. |
| Azul profundo | `#1E3A8A` | `rgb(30, 58, 138)` | Texto institucional. |
| Azul principal | `#2563EB` | `rgb(37, 99, 235)` | CTA e seleção. |
| Ciano técnico | `#22D3EE` | `rgb(34, 211, 238)` | Navegação ativa. |
| Verde conformidade | `#16A34A` | `rgb(22, 163, 74)` | Sucesso de geração. |
| Verde suave | `#DCFCE7` | `rgb(220, 252, 231)` | Fundo de sucesso. |
| Amarelo atenção | `#F59E0B` | `rgb(245, 158, 11)` | Aviso operacional. |
| Amarelo suave | `#FEF3C7` | `rgb(254, 243, 199)` | Fundo de aviso. |
| Vermelho erro | `#DC2626` | `rgb(220, 38, 38)` | Erro de geração. |
| Vermelho suave | `#FEE2E2` | `rgb(254, 226, 226)` | Fundo de erro. |
| Roxo assinatura | `#7C3AED` | `rgb(124, 58, 237)` | Arquivos `.p7s` e atestado. |
| Roxo suave | `#EDE9FE` | `rgb(237, 233, 254)` | Fundo de assinatura. |
| Teal dados fonte | `#0D9488` | `rgb(13, 148, 136)` | AFD. |
| Teal suave | `#CCFBF1` | `rgb(204, 251, 241)` | Fundo AFD. |
| Fundo claro | `#F8FAFC` | `rgb(248, 250, 252)` | Fundo principal. |
| Superfície | `#FFFFFF` | `rgb(255, 255, 255)` | Cards. |
| Borda | `#E2E8F0` | `rgb(226, 232, 240)` | Contornos. |
| Texto principal | `#0F172A` | `rgb(15, 23, 42)` | Títulos. |
| Texto secundário | `#64748B` | `rgb(100, 116, 139)` | Metadados. |
| Texto terciário | `#94A3B8` | `rgb(148, 163, 184)` | Labels. |

---

## 6. Regras de UX

- `AEJ` exige período/mês.
- `AFD` não deve sugerir filtro mensal obrigatório.
- `ATESTADO` deve indicar arquivo estático.
- CTA deve mostrar o tipo selecionado.
- Loading deve impedir solicitações duplicadas.
- Erros devem ser exibidos em linguagem administrativa.
- Mobile não deve esconder a diferença entre AEJ, AFD e Atestado.

---

## 7. Estados obrigatórios

| Estado | Como deve aparecer |
|---|---|
| Sem data para AEJ | CTA desabilitado ou alerta. |
| Atestado selecionado | Aviso “arquivo estático”. |
| Gerando | Loading no painel e CTA. |
| Sucesso | Confirmação verde de download. |
| Erro | Mensagem vermelha. |
| Tipo selecionado | Card com borda azul. |

---

## 8. Resultado esperado

A tela deve transmitir:

- conformidade legal;
- segurança documental;
- geração fiscal clara;
- distinção entre formatos;
- prontidão para auditoria e fiscalização.

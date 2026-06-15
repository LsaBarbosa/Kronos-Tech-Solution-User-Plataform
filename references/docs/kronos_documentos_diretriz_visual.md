# Kronos — Diretriz visual de negócio para `/documentos`

## 1. Objetivo da tela

A rota `/documentos` deve ser uma **central de busca documental segura**, não apenas um formulário de seleção.

A experiência precisa permitir:

- buscar documentos por colaborador quando a ROLE permitir;
- bloquear o colaborador no caso de `PARTNER`;
- selecionar tipo documental;
- filtrar por data;
- listar documentos encontrados;
- baixar documentos;
- excluir documentos quando permitido pela regra da aplicação;
- comunicar que documentos trabalhistas e pessoais são dados sensíveis.

---

## 2. Comportamento por ROLE

### CTO

O `CTO` deve receber comunicação visual de escopo administrativo ampliado.

Pode visualizar:

- busca por colaborador;
- status ativo/inativo;
- tipo de documento;
- data;
- download;
- exclusão, quando autorizada pela regra.

### MANAGER

O `MANAGER` deve receber visão gerencial do tenant/equipe.

Pode visualizar:

- status do colaborador;
- seleção de funcionário;
- tipo de documento;
- resultados;
- download;
- exclusão, quando autorizada.

### PARTNER

O `PARTNER` deve ter experiência individual.

Deve visualizar:

- acervo próprio;
- colaborador bloqueado pela sessão;
- tipo de documento;
- data opcional;
- download dos documentos disponíveis.

Não deve visualizar seleção de outro colaborador.

---

## 3. Conceito visual

### Nome conceitual

**Secure Document Vault**

A tela deve parecer um cofre documental corporativo, com busca clara e forte percepção de segurança.

### Mensagem visual

> “Documentos trabalhistas, pessoais e legais devem ser acessados com escopo, rastreabilidade e permissão.”

---

## 4. Diferença entre desktop e mobile

## 4.1 Desktop

O desktop deve funcionar como console documental:

- cards de escopo por ROLE;
- filtros em grade;
- taxonomia de documentos;
- painel lateral de resultados;
- ações de download/exclusão;
- bloco de governança.

## 4.2 Mobile

O mobile deve funcionar como busca guiada:

- topo compacto;
- card de escopo atual;
- etapas por tipo, filtros e resultados;
- CTA fixo;
- cards de documentos;
- explicação de permissão no rodapé.

---

## 5. Paleta de cores

| Papel | Hexadecimal | RGB | Uso |
|---|---:|---:|---|
| Azul noite | `#0B1220` | `rgb(11, 18, 32)` | Sidebar, topo mobile e fundo institucional. |
| Azul meia-noite | `#101A33` | `rgb(16, 26, 51)` | Gradientes escuros. |
| Azul profundo | `#1E3A8A` | `rgb(30, 58, 138)` | Texto institucional e hover. |
| Azul principal | `#2563EB` | `rgb(37, 99, 235)` | CTA, seleção ativa e foco. |
| Ciano técnico | `#22D3EE` | `rgb(34, 211, 238)` | Realce de navegação. |
| Verde sucesso | `#16A34A` | `rgb(22, 163, 74)` | Documento encontrado, operação bem-sucedida. |
| Verde suave | `#DCFCE7` | `rgb(220, 252, 231)` | Fundo positivo. |
| Amarelo atenção | `#F59E0B` | `rgb(245, 158, 11)` | Termos sensíveis e atenção. |
| Amarelo suave | `#FEF3C7` | `rgb(254, 243, 199)` | Fundo de atenção. |
| Vermelho erro | `#DC2626` | `rgb(220, 38, 38)` | Exclusão e erro. |
| Vermelho suave | `#FEE2E2` | `rgb(254, 226, 226)` | Fundo de erro. |
| Roxo administrativo | `#7C3AED` | `rgb(124, 58, 237)` | Escopo CTO. |
| Roxo suave | `#EDE9FE` | `rgb(237, 233, 254)` | Fundo CTO. |
| Teal individual | `#0D9488` | `rgb(13, 148, 136)` | Escopo PARTNER. |
| Teal suave | `#CCFBF1` | `rgb(204, 251, 241)` | Fundo PARTNER. |
| Fundo claro | `#F8FAFC` | `rgb(248, 250, 252)` | Fundo principal. |
| Fundo secundário | `#F1F5F9` | `rgb(241, 245, 249)` | Campos e cards neutros. |
| Superfície | `#FFFFFF` | `rgb(255, 255, 255)` | Cards e painéis. |
| Borda | `#E2E8F0` | `rgb(226, 232, 240)` | Contornos. |
| Texto principal | `#0F172A` | `rgb(15, 23, 42)` | Títulos e nomes de arquivos. |
| Texto secundário | `#64748B` | `rgb(100, 116, 139)` | Metadados. |
| Texto terciário | `#94A3B8` | `rgb(148, 163, 184)` | Labels auxiliares. |

---

## 6. Tipos documentais

A interface deve contemplar:

- `PAYSLIP` — Contracheque;
- `TIME_OFF` — Abono de Horas;
- `DOCUMENTS` — Documentos;
- `EMPLOYEE_DOCUMENTS` — Documentos Pessoais;
- `POINT_RECORD_RECEIPT` — Comprovante de Ponto;
- `BIOMETRIC_CONSENT_TERM` — Termo de Consentimento Biométrico;
- `SERVICE_CONTRACT_TERMS` — Termo de Contrato de Serviço.

---

## 7. Estados obrigatórios

| Estado | Como deve aparecer |
|---|---|
| Sem funcionário | CTA desabilitado para CTO/MANAGER. |
| PARTNER | Funcionário bloqueado pela sessão. |
| Sem tipo | CTA desabilitado. |
| Buscando | Loading no CTA e skeleton de resultados. |
| Sem documentos | Estado vazio com sugestão de mudar filtros. |
| Com documentos | Lista com nome, tipo, data, download e exclusão quando permitida. |
| Exclusão | Confirmação explícita. |
| Download | Feedback de início do download. |

---

## 8. Regras de UX

1. `PARTNER` não deve selecionar outro colaborador.
2. `CTO` deve ter comunicação visual de escopo amplo.
3. `MANAGER` deve selecionar colaboradores permitidos.
4. Tipo documental deve ser obrigatório.
5. Data deve ser filtro opcional.
6. Download deve ser ação primária no resultado.
7. Exclusão deve ser ação destrutiva e confirmada.
8. Documentos sensíveis devem ter visual de segurança.
9. Mobile não deve usar tabela.
10. Desktop deve permitir filtros e resultados lado a lado.

---

## 9. Resultado esperado

A tela deve transmitir que o Kronos oferece:

- busca documental segura;
- controle por perfil;
- acesso a documentos legais e trabalhistas;
- download rastreável;
- exclusão controlada;
- clareza para colaborador, gestor e CTO.

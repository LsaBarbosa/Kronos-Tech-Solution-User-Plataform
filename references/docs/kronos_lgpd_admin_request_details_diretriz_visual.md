# Kronos — Diretriz visual de negócio para `/lgpd/admin/requests/{id}`

## 1. Objetivo da tela

A rota `/lgpd/admin/requests/{id}` deve ser a tela de **tratamento completo de uma solicitação LGPD administrativa**.

Ela deve permitir que CTO/MANAGER analisem uma solicitação específica, entendam o histórico, avancem o fluxo, registrem justificativas e executem ações sensíveis com rastreabilidade.

---

## 2. Conceito visual

### Nome conceitual

**LGPD Case Control Room**

A tela deve transmitir:

- governança;
- responsabilidade jurídica;
- rastreabilidade;
- proteção de dados pessoais;
- controle de status;
- decisão formal da empresa controladora.

---

## 3. Informações principais

A tela deve exibir:

- ID da solicitação;
- titular dos dados;
- empresa;
- tipo de solicitação;
- status atual;
- data de criação;
- última atualização;
- descrição pública;
- notas de resolução;
- responsável quando aplicável;
- histórico de mudanças;
- resultado de anonimização quando existir.

---

## 4. Fluxo de tratamento

A interface deve representar visualmente o progresso:

1. Aberta;
2. Em análise;
3. Revisão do controlador;
4. Revisão legal;
5. Aprovada para exportação;
6. Concluída ou parcialmente concluída.

Para solicitações não exportáveis, o fluxo pode ser simplificado.

---

## 5. Ações administrativas

A tela deve permitir, conforme status e papel:

- iniciar análise;
- enviar para revisão do controlador;
- enviar para revisão legal;
- aprovar exportação;
- exportar dados revisados;
- concluir solicitação;
- solicitar complemento ao titular;
- rejeitar solicitação;
- cancelar solicitação;
- avançar análise manualmente;
- executar ou consultar anonimização.

---

## 6. Desktop e mobile

### Desktop

O desktop deve funcionar como uma sala de controle:

- coluna principal com dados do caso;
- fluxo horizontal;
- descrição e histórico;
- painel lateral de ações;
- alertas de SLA e dados sensíveis;
- CTAs administrativos claros.

### Mobile

O mobile deve ser guiado por cartões:

- resumo do titular;
- status/SLA;
- fluxo compacto;
- descrição curta;
- ações disponíveis;
- barra inferior fixa com próxima decisão.

O mobile não deve replicar a densidade do desktop.

---

## 7. Paleta de cores

| Papel | Hexadecimal | RGB | Uso |
|---|---:|---:|---|
| Azul noite | `#0B1220` | `rgb(11, 18, 32)` | Topo, sidebar e contexto premium. |
| Azul meia-noite | `#101A33` | `rgb(16, 26, 51)` | Gradientes escuros. |
| Azul profundo | `#1E3A8A` | `rgb(30, 58, 138)` | Texto institucional. |
| Azul principal | `#2563EB` | `rgb(37, 99, 235)` | CTA principal, seleção e fluxo em análise. |
| Ciano técnico | `#22D3EE` | `rgb(34, 211, 238)` | Destaque de tecnologia e navegação ativa. |
| Verde concluído | `#16A34A` | `rgb(22, 163, 74)` | Etapas concluídas e exportação aprovada. |
| Verde suave | `#DCFCE7` | `rgb(220, 252, 231)` | Fundo de sucesso. |
| Amarelo revisão | `#F59E0B` | `rgb(245, 158, 11)` | Revisão legal, pendência e atenção. |
| Amarelo suave | `#FEF3C7` | `rgb(254, 243, 199)` | Fundo de revisão. |
| Vermelho risco | `#DC2626` | `rgb(220, 38, 38)` | SLA crítico, rejeição, erro ou bloqueio. |
| Vermelho suave | `#FEE2E2` | `rgb(254, 226, 226)` | Fundo de risco. |
| Roxo dados sensíveis | `#7C3AED` | `rgb(124, 58, 237)` | Dados sensíveis, anonimização e biometria. |
| Roxo suave | `#EDE9FE` | `rgb(237, 233, 254)` | Fundo de dados sensíveis. |
| Teal privacidade | `#0D9488` | `rgb(13, 148, 136)` | Privacidade, consentimento e proteção de dados. |
| Teal suave | `#CCFBF1` | `rgb(204, 251, 241)` | Fundo de privacidade. |
| Fundo claro | `#F8FAFC` | `rgb(248, 250, 252)` | Fundo principal. |
| Superfície | `#FFFFFF` | `rgb(255, 255, 255)` | Cards e painéis. |
| Borda | `#E2E8F0` | `rgb(226, 232, 240)` | Contornos. |
| Texto principal | `#0F172A` | `rgb(15, 23, 42)` | Títulos. |
| Texto secundário | `#64748B` | `rgb(100, 116, 139)` | Metadados. |
| Texto terciário | `#94A3B8` | `rgb(148, 163, 184)` | Labels auxiliares. |

---

## 8. Regras de UX

- Nenhuma ação sensível deve ser executada sem justificativa quando exigida.
- Exportação deve exigir fundamento legal, motivo operacional e notas do revisor.
- Rejeição deve exigir motivo e nota pública.
- Cancelamento deve ser restrito e justificado.
- Solicitações de anonimização/eliminação devem destacar risco e resultado.
- Histórico deve ficar visível para auditoria.
- O status deve ser textual e colorido.
- A próxima ação deve ser evidente.
- Ações avançadas devem ter menor destaque visual.

---

## 9. Estados obrigatórios

| Estado | Como deve aparecer |
|---|---|
| Carregando | Loading central. |
| Erro ou não encontrado | Estado vermelho com voltar para lista. |
| Aberta | Selo azul. |
| Em análise | Selo azul forte. |
| Aguardando controlador | Selo azul profundo. |
| Aguardando revisão legal | Selo amarelo/neutro. |
| Aprovada para exportação | Selo verde. |
| Concluída | Selo verde. |
| Rejeitada | Selo vermelho. |
| Cancelada | Selo cinza. |
| Exportando | CTA bloqueado e loading. |

---

## 10. Resultado esperado

A tela deve transmitir:

- controle formal de caso LGPD;
- rastreabilidade completa;
- clareza de decisão;
- proteção de dados sensíveis;
- separação entre análise, exportação, conclusão e rejeição.

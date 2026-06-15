# Kronos — Diretriz visual de negócio para `/enviar-documento-colaborador`

## 1. Objetivo da tela

A rota `/enviar-documento-colaborador` deve ser tratada como um **cofre de envio documental**, não apenas como um input de arquivo.

A experiência precisa comunicar:

- upload seguro;
- destino correto do documento;
- validação de tipo;
- validação de tamanho;
- compressão/otimização de imagem quando aplicável;
- confirmação antes do envio;
- rastreabilidade de documento pessoal.

---

## 2. Comportamento por ROLE

### CTO

O `CTO` deve ter comunicação visual de escopo administrativo.

Pode selecionar colaborador destinatário e enviar documentos dentro do escopo permitido.

### MANAGER

O `MANAGER` deve ter visão operacional.

Pode selecionar colaborador destinatário da lista permitida e enviar documento pessoal para esse colaborador.

### PARTNER

O `PARTNER` deve ter experiência individual.

O destinatário deve ser o próprio colaborador da sessão. A tela deve evitar seleção de outro colaborador.

> Observação de negócio: a implementação atual carrega lista de colaboradores; na nova experiência, a camada visual deve deixar explícita a restrição de escopo por ROLE para evitar envio indevido.

---

## 3. Conceito visual

### Nome conceitual

**Secure Upload Vault**

A tela deve parecer um ambiente de envio seguro, com etapas claras: destinatário, arquivo, validação e envio.

---

## 4. Diferença entre desktop e mobile

## 4.1 Desktop

O desktop deve funcionar como console de upload:

- hero institucional;
- cards por ROLE;
- etapas em lista horizontal/vertical;
- dropzone grande;
- painel lateral de prévia;
- matriz de permissão;
- confirmação de resultado.

## 4.2 Mobile

O mobile deve funcionar como fluxo guiado:

- topo compacto;
- escopo atual;
- etapa de destinatário;
- etapa de arquivo;
- etapa de validação;
- CTA fixo;
- explicação curta de limite e formatos.

---

## 5. Paleta de cores

| Papel | Hexadecimal | RGB | Uso |
|---|---:|---:|---|
| Azul noite | `#0B1220` | `rgb(11, 18, 32)` | Sidebar, topo mobile e fundo institucional. |
| Azul meia-noite | `#101A33` | `rgb(16, 26, 51)` | Gradientes escuros. |
| Azul profundo | `#1E3A8A` | `rgb(30, 58, 138)` | Texto institucional e hover. |
| Azul principal | `#2563EB` | `rgb(37, 99, 235)` | CTA, seleção e foco. |
| Ciano técnico | `#22D3EE` | `rgb(34, 211, 238)` | Realce de navegação. |
| Verde sucesso | `#16A34A` | `rgb(22, 163, 74)` | Validação OK e sucesso. |
| Verde suave | `#DCFCE7` | `rgb(220, 252, 231)` | Fundo de validação positiva. |
| Amarelo atenção | `#F59E0B` | `rgb(245, 158, 11)` | Arquivo em otimização ou alerta. |
| Amarelo suave | `#FEF3C7` | `rgb(254, 243, 199)` | Fundo de alerta. |
| Vermelho erro | `#DC2626` | `rgb(220, 38, 38)` | Tipo inválido, arquivo grande e remoção. |
| Vermelho suave | `#FEE2E2` | `rgb(254, 226, 226)` | Fundo de erro. |
| Roxo administrativo | `#7C3AED` | `rgb(124, 58, 237)` | Escopo CTO e documento selecionado. |
| Roxo suave | `#EDE9FE` | `rgb(237, 233, 254)` | Fundo CTO. |
| Teal individual | `#0D9488` | `rgb(13, 148, 136)` | Escopo PARTNER. |
| Teal suave | `#CCFBF1` | `rgb(204, 251, 241)` | Fundo PARTNER. |
| Fundo claro | `#F8FAFC` | `rgb(248, 250, 252)` | Fundo principal. |
| Superfície | `#FFFFFF` | `rgb(255, 255, 255)` | Cards e painéis. |
| Borda | `#E2E8F0` | `rgb(226, 232, 240)` | Contornos. |
| Texto principal | `#0F172A` | `rgb(15, 23, 42)` | Títulos. |
| Texto secundário | `#64748B` | `rgb(100, 116, 139)` | Metadados. |
| Texto terciário | `#94A3B8` | `rgb(148, 163, 184)` | Labels auxiliares. |

---

## 6. Regras de negócio visuais

- Tipo padrão do envio: `EMPLOYEE_DOCUMENTS`.
- Tamanho máximo: 5MB.
- Formatos aceitos: `.pdf`, `.jpg`, `.jpeg`, `.png`.
- Imagens podem ser comprimidas antes do envio.
- Sem arquivo ou sem destinatário: CTA desabilitado.
- Arquivo inválido: mensagem próxima ao campo.
- Envio em andamento: CTA com loading.
- Sucesso: limpar arquivo e confirmar envio.

---

## 7. Estados obrigatórios

| Estado | Como deve aparecer |
|---|---|
| Sem destinatário | Etapa pendente e CTA desabilitado. |
| Sem arquivo | Dropzone neutra. |
| Arquivo selecionado | Prévia com nome e tamanho. |
| Tipo inválido | Erro vermelho. |
| Arquivo acima de 5MB | Erro vermelho. |
| Otimizando imagem | Aviso amarelo. |
| Enviando | Loading no CTA. |
| Sucesso | Validação verde e mensagem de confirmação. |

---

## 8. Resultado esperado

A tela deve transmitir que o Kronos permite envio documental:

- seguro;
- controlado por perfil;
- validado;
- simples no mobile;
- completo no desktop;
- adequado a documentos pessoais de colaboradores.

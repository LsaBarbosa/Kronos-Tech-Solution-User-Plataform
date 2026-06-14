# Kronos — Diretriz visual de negócio para `/criar-colaborador`

## 1. Objetivo da tela

A rota `/criar-colaborador` deve ser tratada como um **onboarding formal de colaborador**, não apenas como formulário longo.

A experiência precisa orientar:

- cadastro pessoal;
- validação de CPF;
- dados profissionais;
- endereço;
- home office/geolocalização;
- escala;
- jornada;
- criação posterior do usuário de acesso.

---

## 2. Fluxo de negócio

A criação ocorre em duas fases:

1. **Criar colaborador**: salva dados pessoais, profissionais, endereço, escala e jornada.
2. **Criar usuário vinculado**: cria username e perfil `MANAGER` ou `PARTNER` para o colaborador salvo.

O usuário de acesso só deve ser criado depois que o colaborador existir.

---

## 3. Conceito visual

### Nome conceitual

**Employee Onboarding Console**

A tela deve parecer um assistente de implantação de colaborador, com validações visíveis e progressão clara.

---

## 4. Desktop e mobile

### Desktop

O desktop deve usar:

- painel amplo de ficha cadastral;
- painel lateral de vínculo de acesso;
- resumo de escala e jornada;
- stepper de progresso;
- validação visual de CPF e username.

### Mobile

O mobile deve usar:

- onboarding por etapas;
- cards verticais;
- CTA fixo;
- resumo do próximo passo;
- menos campos simultâneos para reduzir erro.

---

## 5. Paleta de cores

| Papel | Hexadecimal | RGB | Uso |
|---|---:|---:|---|
| Azul noite | `#0B1220` | `rgb(11, 18, 32)` | Sidebar, topo mobile e fundo institucional. |
| Azul meia-noite | `#101A33` | `rgb(16, 26, 51)` | Gradientes escuros. |
| Azul profundo | `#1E3A8A` | `rgb(30, 58, 138)` | Texto institucional. |
| Azul principal | `#2563EB` | `rgb(37, 99, 235)` | CTA, progresso e foco. |
| Ciano técnico | `#22D3EE` | `rgb(34, 211, 238)` | Navegação ativa. |
| Verde sucesso | `#16A34A` | `rgb(22, 163, 74)` | CPF/username disponível e etapa concluída. |
| Verde suave | `#DCFCE7` | `rgb(220, 252, 231)` | Fundo de sucesso. |
| Amarelo atenção | `#F59E0B` | `rgb(245, 158, 11)` | Etapa pendente. |
| Amarelo suave | `#FEF3C7` | `rgb(254, 243, 199)` | Fundo de pendência. |
| Vermelho erro | `#DC2626` | `rgb(220, 38, 38)` | Erros de validação. |
| Vermelho suave | `#FEE2E2` | `rgb(254, 226, 226)` | Fundo de erro. |
| Roxo perfil | `#7C3AED` | `rgb(124, 58, 237)` | Perfil de usuário e acesso. |
| Roxo suave | `#EDE9FE` | `rgb(237, 233, 254)` | Fundo do vínculo. |
| Teal operação | `#0D9488` | `rgb(13, 148, 136)` | Home office/geolocalização. |
| Teal suave | `#CCFBF1` | `rgb(204, 251, 241)` | Fundo operacional. |
| Fundo claro | `#F8FAFC` | `rgb(248, 250, 252)` | Fundo principal. |
| Superfície | `#FFFFFF` | `rgb(255, 255, 255)` | Cards. |
| Borda | `#E2E8F0` | `rgb(226, 232, 240)` | Contornos. |
| Texto principal | `#0F172A` | `rgb(15, 23, 42)` | Títulos. |
| Texto secundário | `#64748B` | `rgb(100, 116, 139)` | Metadados. |
| Texto terciário | `#94A3B8` | `rgb(148, 163, 184)` | Labels auxiliares. |

---

## 6. Regras visuais de negócio

- CPF deve ser verificado antes de concluir o passo 1.
- Username deve ser verificado antes de concluir o passo 2.
- Perfil de usuário deve permitir `MANAGER` ou `PARTNER`.
- Escalas previstas: `TRADITIONAL_5X2`, `SIX_BY_ONE_FIXED`, `ROTATING_12X36`, `ROTATING_24X72`, `SIX_BY_ONE_TWO_WEEKENDS`, `SIX_BY_ONE_ONE_WEEKEND`.
- Home office `false` indica exigência de geolocalização.
- Jornada deve mostrar entrada, intervalo e saída.
- O passo 2 fica bloqueado até o colaborador ser salvo.

---

## 7. Estados obrigatórios

| Estado | Como deve aparecer |
|---|---|
| CPF não verificado | CTA bloqueado ou alerta. |
| CPF disponível | Selo verde. |
| CPF indisponível | Erro vermelho. |
| Passo 1 concluído | Card com sucesso e bloqueio de edição acidental. |
| Username não verificado | Alerta. |
| Username disponível | Selo verde. |
| Enviando | Loading no CTA. |
| Cadastro concluído | Confirmação final e reset do fluxo. |

---

## 8. Resultado esperado

A tela deve transmitir:

- segurança cadastral;
- clareza trabalhista;
- controle de jornada;
- vínculo de acesso rastreável;
- experiência guiada para reduzir erro.

# Kronos — Diretriz visual de negócio para o `Header`

## 1. Objetivo do elemento

O `Header` deve ser o elemento global de orientação, sessão e ação rápida da plataforma Kronos.

Ele deve estar presente nas telas autenticadas e comunicar:

- localização atual do usuário;
- papel da sessão;
- estado de sessão protegida;
- ação operacional de registrar ponto;
- acesso ao menu lateral;
- avisos/notificações;
- perfil e encerramento de sessão.

---

## 2. Conceito visual

### Nome conceitual

**Kronos Secure Command Header**

O header deve parecer uma barra corporativa premium, tecnológica e segura, conectando identidade visual, controle de jornada, LGPD e navegação.

---

## 3. Funções obrigatórias

| Função | Desktop | Mobile |
|---|---|---|
| Abrir menu lateral | Sim | Sim, com maior destaque |
| Exibir marca Kronos | Sim | Sim, compacta |
| Mostrar rota/contexto atual | Sim | Sim, resumido |
| Registrar ponto | Sim, CTA textual | Sim, CTA destacado |
| Mostrar role | Sim | Sim, como chip |
| Mostrar status de sessão | Sim | Sim, resumido |
| Mostrar avisos | Sim | Sim, por badge |
| Acessar perfil | Sim | Preferencialmente via menu/perfil compacto |
| Logout | Sim | Preferencialmente no menu/perfil |

---

## 4. Experiência desktop

No desktop, o header deve usar uma estrutura horizontal completa:

1. **Esquerda**
   - botão de menu;
   - marca Kronos;
   - rota ou módulo atual;
   - role do usuário.

2. **Centro**
   - estado de sessão;
   - indicador de segurança/LGPD;
   - contexto operacional.

3. **Direita**
   - CTA “Registrar ponto”;
   - avisos;
   - avatar/perfil;
   - logout ou menu de conta.

---

## 5. Experiência mobile

No mobile, o header deve ser compacto:

- menu lateral visível;
- marca curta;
- rota atual resumida;
- role em chip pequeno;
- notificações por badge;
- ação de ponto como CTA prioritário;
- sem excesso de texto.

O mobile não deve tentar replicar o desktop. Ele deve funcionar como barra de ação rápida.

---

## 6. Regras por papel

### PARTNER

O header deve priorizar:

- registrar ponto;
- documentos próprios;
- avisos;
- privacidade;
- solicitações próprias.

### MANAGER

O header deve priorizar:

- registrar ponto;
- pendências operacionais;
- avisos;
- equipe;
- aprovações.

### CTO

O header deve priorizar:

- visão administrativa;
- empresas;
- auditoria;
- inventário LGPD;
- governança.

---

## 7. Paleta de cores

| Papel | Hexadecimal | RGB | Uso |
|---|---:|---:|---|
| Azul noite | `#0B1220` | `rgb(11, 18, 32)` | Header escuro, modo premium e áreas institucionais. |
| Azul meia-noite | `#101A33` | `rgb(16, 26, 51)` | Gradientes e fundo de menu compacto. |
| Azul profundo | `#1E3A8A` | `rgb(30, 58, 138)` | Texto institucional e hover. |
| Azul principal | `#2563EB` | `rgb(37, 99, 235)` | CTA, foco, botão de ponto e seleção. |
| Ciano técnico | `#22D3EE` | `rgb(34, 211, 238)` | Realce de navegação, item ativo e tecnologia. |
| Verde sessão | `#16A34A` | `rgb(22, 163, 74)` | Sessão ativa, segurança OK. |
| Verde suave | `#DCFCE7` | `rgb(220, 252, 231)` | Fundo de status positivo. |
| Amarelo aviso | `#F59E0B` | `rgb(245, 158, 11)` | Avisos e notificações pendentes. |
| Amarelo suave | `#FEF3C7` | `rgb(254, 243, 199)` | Fundo de alerta. |
| Vermelho crítico | `#DC2626` | `rgb(220, 38, 38)` | Badge crítico, sessão expirada ou erro. |
| Vermelho suave | `#FEE2E2` | `rgb(254, 226, 226)` | Fundo de erro. |
| Roxo perfil | `#7C3AED` | `rgb(124, 58, 237)` | Papel, conta e permissões. |
| Roxo suave | `#EDE9FE` | `rgb(237, 233, 254)` | Fundo de role/perfil. |
| Teal privacidade | `#0D9488` | `rgb(13, 148, 136)` | LGPD, consentimento e segurança de dados. |
| Teal suave | `#CCFBF1` | `rgb(204, 251, 241)` | Fundo de privacidade. |
| Fundo claro | `#F8FAFC` | `rgb(248, 250, 252)` | Header claro e fundo de página. |
| Superfície | `#FFFFFF` | `rgb(255, 255, 255)` | Header claro, cards e menus. |
| Borda | `#E2E8F0` | `rgb(226, 232, 240)` | Separadores e contornos. |
| Texto principal | `#0F172A` | `rgb(15, 23, 42)` | Texto forte. |
| Texto secundário | `#64748B` | `rgb(100, 116, 139)` | Subtítulos e metadados. |
| Texto terciário | `#94A3B8` | `rgb(148, 163, 184)` | Labels auxiliares. |

---

## 8. Regras de UX

- O header deve ser fixo no topo.
- Deve manter altura previsível.
- Não deve competir com o conteúdo principal.
- O botão “Registrar ponto” deve ser sempre claro.
- No desktop, pode exibir mais contexto.
- No mobile, deve reduzir texto e priorizar ação.
- Notificações devem usar badge discreto.
- A role deve estar sempre visível em contexto autenticado.
- Logout não deve ser acidental; deve ficar no menu de conta.
- Segurança/LGPD devem aparecer como confiança visual, não como excesso de texto.

---

## 9. Estados obrigatórios

| Estado | Como deve aparecer |
|---|---|
| Sessão carregando | Skeleton ou chip “verificando sessão”. |
| Sessão autenticada | Chip “online” ou “sessão protegida”. |
| Sessão expirada | Redirecionamento ao login; header não deve permanecer. |
| Sem avisos | Ícone neutro. |
| Com avisos | Badge numérico. |
| Ponto disponível | CTA azul. |
| Fluxo de ponto aberto | CTA com estado ativo. |
| Papel desconhecido | Chip neutro ou “perfil”. |

---

## 10. Resultado esperado

O novo header deve transmitir:

- identidade visual unificada;
- navegação confiável;
- segurança de sessão;
- clareza operacional;
- LGPD como parte da experiência;
- adaptação real entre desktop e mobile.

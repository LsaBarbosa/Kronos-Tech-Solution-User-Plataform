# Auditoria Inicial — Fase 0

**Data:** 15 de Maio de 2026  
**Branch:** PROD_HOSTINGER_V2 ✓ (Validada)  
**Status:** Sem alterações — Apenas leitura e análise

---

## 1. Stack tecnológico detectado

- **Framework:** React 18+ com TypeScript
- **Build:** Vite
- **Estilos:** Tailwind CSS + CSS Modules/Global
- **Componentes UI:** Radix UI (shadcn/ui baseado)
- **Estado global:** React Context (Auth, Theme)
- **Gerenciador de pacotes:** npm / Bun
- **Testes:** Vitest + Playwright
- **Ícones:** Lucide React

---

## 2. Estrutura de diretórios

```
src/
├── components/
│   ├── ui/                    # Componentes shadcn/ui (Button, Card, Input, etc.)
│   ├── Header.tsx             # Header global com ThemeToggle
│   ├── Sidebar.tsx            # Sidebar/Drawer com menu por role
│   ├── PageShell.tsx          # Wrapper de página autenticada
│   ├── ProtectedRoute.tsx     # Guard de autenticação
│   ├── RoleRoute.tsx          # Guard de role-based access
│   ├── ThemeToggle.tsx        # Botão de alternância de tema
│   └── states/                # EmptyState, LoadingState, ErrorState
├── pages/                     # Páginas principais (40+ páginas)
├── context/
│   └── AuthContext.tsx        # Autenticação e roles
├── hooks/
│   ├── useTheme.tsx           # ThemeProvider e hook
│   └── ...outros
├── service/                   # Services de API
├── config/
│   ├── app-routes.ts          # Definição de rotas e roles
│   └── api.ts                 # Configuração do axios
├── utils/                     # Utilitários
├── lib/                       # Bibliotecas auxiliares
├── types/                     # TypeScript types
└── index.css                  # Estilos globais com tokens
```

---

## 3. Framework de tema e cores

### 3.1 Design System Atual

**Tokens base em HSL:**

#### Tema Claro (`:root`)
- `--background: 248 31.1% 98%` (Cinza muito claro)
- `--card: 0 0% 100%` (Branco puro)
- `--primary: 270 100% 47%` (Roxo)
- `--border: 0 0% 90%` (Cinza claro)
- `--foreground: 24 9.8% 10%` (Preto escuro)

#### Tema Escuro (`.dark`)
- `--background: 240 22% 5%` (Preto azulado)
- `--card: 240 13% 13%` (Azul escuro)
- `--primary: 270 100% 59%` (Roxo mais claro)
- `--border: 240 13% 20%` (Cinza escuro)
- `--foreground: 248 31.1% 98%` (Branco puro)

### 3.2 Cores de Identidade Visual

**Paleta consolidada:**

| Cor | Light | Dark | Uso |
|-----|-------|------|-----|
| **Purple** | 270 100% 47% | 270 100% 59% | Primary, Accent |
| **Blue** | 220 100% 47% | 220 100% 59% | Secondary |
| **Lilás** | 264 97.3% 75% | 264 97.3% 85% | Accent |
| **Cyan** | 188.5 100% 59.2% | 188.5 100% 70% | Light Accent |
| **Red** | 359 95% 60% | 359 95% 70% | Alerts/Danger |
| **Green** | 142 76% 36% | 142 76% 50% | Success |

### 3.3 Tema e Persistência

- **Implementação:** `useTheme.tsx` com React Context
- **Armazenamento:** localStorage com chave `kronos-theme`
- **Preferência:** Respeita `prefers-color-scheme` do navegador
- **Aplicação:** Classe `dark` no elemento `<html>`
- **Valores permitidos:** `"light"` ou `"dark"`

---

## 4. Arquitetura de componentes

### 4.1 Componentes UI Base

Já existem (shadcn/ui):
- ✓ Button
- ✓ Card (CardHeader, CardTitle, CardContent, CardFooter)
- ✓ Input
- ✓ Select
- ✓ Textarea
- ✓ Checkbox
- ✓ Switch
- ✓ Badge
- ✓ Modal (Dialog)
- ✓ Toast (Sonner)
- ✓ Table
- ✓ Tabs
- ✓ Accordion
- ✓ Pagination
- ✓ Skeleton

### 4.2 Componentes Customizados

- ✓ Header (com ThemeToggle integrado)
- ✓ Sidebar (drawer em mobile)
- ✓ PageShell (wrapper de página autenticada)
- ✓ ThemeToggle (botão de alternância)
- ✓ EmptyState, LoadingState, ErrorState

---

## 5. Estrutura de Páginas e Rotas

### 5.1 Principais Páginas

**Sem proteção:**
- Login.tsx
- EsqueciSenha.tsx
- ResetPassword.tsx
- TokenRedirect.tsx
- NotFound.tsx

**Com proteção (ProtectedRoute):**
- Dashboard.tsx
- RelatorioDetalhado.tsx
- EspelhoPonto.tsx
- Documentos.tsx
- Usuario.tsx
- Avisos.tsx
- RequestVacation.tsx
- RequestManualRegistration.tsx

**Com proteção + Role (RoleRoute):**
- Empresa.tsx (MANAGER, PARTNER, CTO)
- CriarEmpresa.tsx (MANAGER, PARTNER, CTO)
- ListaColaboradores.tsx (MANAGER, CTO)
- CriarColaborador.tsx (MANAGER, CTO)
- CriarManager.tsx (CTO)
- StatusRegistro.tsx (MANAGER, CTO)
- PendingApprovals.tsx (MANAGER, CTO)
- VacationApprovals.tsx (MANAGER, CTO)
- ManualRegisterApprovals.tsx (MANAGER, CTO)
- AuditoriaFiscal.tsx (CTO)
- E outros...

### 5.2 Roles Detectadas

- **CTO:** Acesso total (todas as rotas)
- **MANAGER:** Acesso a gestão de colaboradores, aprovações, documentos
- **USER:** Acesso apenas a próprio perfil, solicitações pessoais, leitura

---

## 6. AuthContext e Autenticação

### 6.1 Estrutura

```typescript
interface AuthUser {
  account: UserAccountData;
  profile: UserData | null;
  role: string;
}

interface AuthContextValue {
  status: "checking" | "authenticated" | "unauthenticated";
  user: AuthUser | null;
  role: string;
  isAuthenticated: boolean;
  checkSession: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}
```

### 6.2 Fluxos

- **Inicialização:** `checkSession()` no mount do AuthProvider
- **Login:** Realizado via FormLogin (página Login)
- **Logout:** POST `/auth/logout` + limpeza de sessão
- **Expiração:** Handler automático com redirect para /login

---

## 7. CSS Global e Estilos

### 7.1 Arquivo `src/index.css`

- **Início:** Tailwind directives (`@tailwind base, components, utilities`)
- **Tokens:** Variáveis CSS em HSL
- **Dark mode:** Classe `.dark` no `:root`
- **Componentes:** Classes customizadas (`.page-title`, `.card-hover`, etc.)
- **Focus states:** Purple ring para acessibilidade
- **Transições:** `--transition-smooth` definida

### 7.2 Espaçamentos e Layout

- **Padding móvel:** `--mobile-padding: 1rem`
- **Gap móvel:** `--mobile-gap: 0.75rem`
- **Touch target:** `--touch-target: 44px`

---

## 8. Estado atual do Dark Mode

### 8.1 Implementado

✓ Sistema de tema funcional
✓ Tokens em HSL para claro/escuro
✓ ThemeToggle integrado no Header
✓ Persistência em localStorage
✓ Classes `dark:` em alguns componentes

### 8.2 Pendente

⚠ Nem todas as telas completamente aderentes ao dark mode
⚠ Alguns componentes com `dark:` incompleto
⚠ Dashboard parcialmente ajustada para dark
⚠ Consistência visual em tema escuro precisa validação
⚠ Alguns placeholders/textos secundários precisam contraste melhorado

---

## 9. Riscos iniciais identificados

### 9.1 Técnicos

1. **Duplicação de estilos:** Alguns componentes podem ter CSS local redundante
2. **Dark mode incompleto:** Nem todas telas foram migradas para usar tokens
3. **Hardcoded colors:** Possibilidade de cores fixas espalhadas em inline styles
4. **Responsive:** Mobile pode não estar 100% funcional em todas as telas

### 9.2 Funcionais

1. **AuthContext está em uso:** Não alterar sem impacto análise
2. **Roles são críticos:** MANAGER, PARTNER, CTO têm permissões específicas
3. **Contrato de API:** Endpoints e payloads não podem ser alterados
4. **Validações de negócio:** Devem ser preservadas intactas

---

## 10. Pontos de atenção para a refatoração

### 10.1 Escopo Permitido

✅ Alterar CSS/Tailwind classes
✅ Criar/ajustar componentes visuais
✅ Aplicar tokens em componentes
✅ Melhorar dark mode
✅ Reorganizar layout visual
✅ Criar estados (loading, empty, error) padronizados
✅ Melhorar responsividade

### 10.2 Escopo Proibido

❌ Alterar endpoints de API
❌ Alterar nomes de campos de formulário
❌ Alterar AuthContext (autenticação/roles)
❌ Alterar services de API (exceto se visual)
❌ Alterar validações de negócio
❌ Criar permissões novas
❌ Remover ações funcionais

---

## 11. Componentes que precisam revisão visual

### 11.1 Prioridade Alta

1. Dashboard — layout, cards, tones
2. Header — tema, responsividade
3. Sidebar — tema, estados
4. Cards — base visual
5. Inputs/Formulários — validação visual
6. Botões — variantes e estados

### 11.2 Prioridade Média

1. Tabelas — cabeçalho, linhas, ações
2. Modais — confirmação, ações
3. Alertas — mensagens de feedback
4. Badges/Status — cores padronizadas

---

## 12. Checklist de validação

- [x] Branch correta: `PROD_HOSTINGER_V2`
- [x] Stack identificado: React + Vite + Tailwind + Radix UI
- [x] Design system existente: Tokens em HSL com dark mode
- [x] AuthContext funcional: Sem alterações necessárias
- [x] Rotas e roles mapeadas
- [x] Estrutura de CSS identificada
- [x] Temas claro/escuro detectados
- [x] Componentes base encontrados

---

## 13. Próximos passos

**Fase 1 — Base Visual e Tokens**
- [ ] Consolidar tokens em arquivo único (se necessário)
- [ ] Revisar e completar variáveis CSS para dark mode
- [ ] Remover hardcoded colors
- [ ] Validar que não há conflitos de estilos

**Fase 2 — Tema Claro/Escuro**
- [ ] Aplicar tokens em todas as telas
- [ ] Testar dark mode em cada página
- [ ] Ajustar contraste de textos
- [ ] Validar leitura em ambos os temas

**Fase 3 — Layout Autenticado**
- [ ] Revisar Header visual
- [ ] Revisar Sidebar visual
- [ ] Padronizar PageShell
- [ ] Melhorar responsividade

---

## Conclusão da Auditoria

✅ **Projeto está pronto para refatoração visual.**

A estrutura é sólida:
- Design system já existe com tokens
- Dark mode já implementado (parcialmente)
- Componentes base existem
- AuthContext e rotas estão seguras

A refatoração será incremental, começando por consolidar tokens e aplicar dark mode completo em todas as telas, depois melhorando visual e layout.

**Nenhuma alteração foi feita. Apenas leitura e análise.**

---

*Auditoria concluída. Pronto para Fase 1.*

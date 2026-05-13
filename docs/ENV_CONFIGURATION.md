# 🔐 Configuração de Variáveis de Ambiente

## Política de .env

### ❌ Nunca Commitar (Ignorados pelo .gitignore)

```
.env                  ← Arquivo LOCAL de desenvolvimento
.env.local            ← Arquivo LOCAL de desenvolvimento
.env.*.local          ← Arquivo LOCAL de desenvolvimento
```

**Por quê?** Contêm:
- Senhas e tokens locais
- URLs de desenvolvimento pessoal
- Chaves de API secretas
- Credenciais do banco de dados

### ✅ Sempre Commitar (Templates)

```
.env.example          ← Template para novos devs
.env.production       ← Template para produção
```

**Por quê?** São:
- Templates/exemplos
- Sem valores sensíveis
- Instrções para configuração
- Versionamento de esquema

---

## Estrutura Atual

### Arquivos no Git

```bash
$ git ls-files | grep "\.env"
.env.example
.env.production
```

✅ **Correto** - Apenas templates estão versionados

### Arquivos Ignorados

```bash
$ ls -la .env*
-rw-rw-r-- .env.example       ← Commitado
-rw-rw-r-- .env.production    ← Commitado
# .env e .env.local não existem (ignorados)
```

✅ **Correto** - Arquivos sensíveis são ignorados

---

## Como Usar

### Para Desenvolvedores

#### 1. Setup Inicial

```bash
# Clone o repositório
git clone ...

# Copie o template
cp .env.example .env

# Edite com seus valores locais
nano .env
# Altere:
# VITE_API_BASE_URL=http://localhost:8080
# VITE_OBSERVABILITY_ENABLED=false
```

#### 2. Nunca Commita .env

```bash
# ❌ NÃO FAÇA ISSO
git add .env
git commit -m "add env"  # Vai falhar, .env está em .gitignore

# ✅ FAÇA ISSO
git add arquivo-que-voce-mudou.ts
git commit -m "feat: sua mudança"
```

#### 3. Se Acidentalmente Fizer Commit

```bash
# Remover do git sem deletar o arquivo local
git rm --cached .env
git commit -m "remove .env from git"

# Agora .env fica ignorado
```

---

### Para Produção (Render)

#### 1. Render Lê Automaticamente

Render procura por:
1. `.env.production` no repositório (🎯 Nós temos!)
2. Variáveis de ambiente do Dashboard
3. Variáveis de sistema do servidor

#### 2. Ordem de Precedência

```
Render Dashboard (variáveis)
    ↓ sobrescreve
.env.production (arquivo)
    ↓ sobrescreve
Valores padrão no código
```

#### 3. Variáveis Sensíveis em Produção

```bash
# ✅ CERTO - No Render Dashboard (não no git!)
VITE_API_BASE_URL=https://kronos-solutions-service.onrender.com
JWT_SECRET=sua_chave_super_secreta_aqui
DATABASE_PASSWORD=senha_do_banco

# ❌ ERRADO - No git
# Nunca commitar senhas ou tokens
```

---

## .gitignore Configuration

```
# Environment variables (LOCAIS - nunca commitar)
.env
.env.local
.env.*.local

# EXCEÇÕES (templates - sempre commitar)
# .env.example and .env.production are committed as templates
```

---

## Segurança Checklist

- [ ] `.env` local nunca foi commitado
- [ ] `.env.example` está no git (sem valores reais)
- [ ] `.env.production` está no git (sem senhas)
- [ ] Todas as chaves secretas estão em Render Dashboard
- [ ] `.gitignore` contém regras de .env
- [ ] Não há senhas no histórico do git

---

## Se Encontrou uma Senha no Git

### Emergência!

```bash
# 1. Revogue IMEDIATAMENTE a chave comprometida
# (mudar senha, regenerar token, etc)

# 2. Remover do histórico git
git filter-branch --tree-filter 'rm -f .env' HEAD

# 3. Force push (apenas se souber o que está fazendo!)
git push origin --force-with-lease

# 4. Avisar time sobre a comprometimento
```

---

## Exemplo de .env.production (Correto)

```env
# ✅ Correto - Template, sem valores reais
VITE_API_BASE_URL=${VITE_API_BASE_URL:-https://kronos-solutions-service.onrender.com}
VITE_OBSERVABILITY_ENABLED=true
VITE_OBSERVABILITY_ENDPOINT=${VITE_OBSERVABILITY_ENDPOINT:-https://observability.kronos.com}

# ❌ Nunca fazer assim (não commitar!)
# VITE_API_BASE_URL=https://api.com
# SENHAS_SECRETAS=xyz123abc
```

---

## Referências

- [Node.js Best Practices - Env Variables](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)
- [12 Factor App - Config](https://12factor.net/config)
- [Git - Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

# Gitleaks Setup — Kronos Frontend

## Overview

Gitleaks está integrado ao **GitHub Actions (CI/CD)** e detecta automaticamente secrets no histórico Git durante push/PR.

## CI/CD Pipeline

O front-end roda gitleaks automaticamente em:
- **Branches:** homolog (push + pull request)
- **Ferramenta:** Docker (`zricethezav/gitleaks:v8.24.2`)
- **Config:** `.gitleaks.toml`
- **Report:** JSON artifact em caso de detecção

## Configuração (.gitleaks.toml)

Secrets detectados no frontend:

| Secret | Padrão | Severidade |
|--------|--------|-----------|
| JWT_SECRET | `JWT_SECRET=...` | CRITICAL |
| API_KEY | `API_KEY=...` ou `api_key=...` | HIGH |

## Local Setup (Opcional)

Se usar gitleaks localmente:

```bash
# Instalar
sudo snap install gitleaks  # Ubuntu/Debian
# ou
brew install gitleaks  # macOS

# Escanear
gitleaks detect --source . --config .gitleaks.toml --redact

# Escanear apenas staged
gitleaks protect --staged --config .gitleaks.toml
```

## GitHub Actions Artifacts

Quando gitleaks detecta secrets:
1. Build falha
2. Relatório JSON é gerado: `gitleaks-report.json`
3. Artifact disponível em "Actions" tab do PR/commit

## Best Practices

✅ **Do:**
- Usar `.env.example` para valores template
- Não cometer `.env.production` com valores reais
- Revisar `.gitleaks.toml` allowlist

❌ **Don't:**
- Commitar senhas ou chaves no código
- Usar hardcoded tokens em testes
- Contornar gitleaks com obfuscação

---

**Referência:** https://github.com/gitleaks/gitleaks

**Last updated:** 2026-06-21

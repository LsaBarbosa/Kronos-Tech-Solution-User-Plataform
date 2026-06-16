# Subagent — qa-a11y

## Objetivo
Validar experiência de download e regressões de UI.

## Verificações

- Botões PDF e CSV continuam acessíveis no desktop.
- Botões PDF e CSV continuam acessíveis no mobile.
- Botões não disparam download sem `reportData`.
- Toast de erro permanece para ausência de dados.
- Toast de sucesso permanece no CSV.
- PDF não trava UI por exceção não tratada.
- CSV abre em Excel/LibreOffice com colunas corretas.

## Comandos

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```

# Subagent — Legacy Cleaner

## Objetivo

Remover somente legado substituído pelo novo painel.

## Pode remover

- Componentes/fragmentos antigos de check-in dentro da dashboard se ficarem duplicados.
- Utilitários criados exclusivamente para o bloco antigo e sem consumidores.

## Não remover

- `CheckinDashboardCard` se ainda for usado em outra rota ou se o Codex não tiver certeza.
- `CheckinContext`, `CheckinModal`, fluxos de câmera, geolocalização ou biometria.
- Cards de avisos, perfil, pendências e atalhos.

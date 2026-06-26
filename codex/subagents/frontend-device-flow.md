# Subagent — Captura e Localização

## Foco

Organizar os recursos do navegador usados pelo terminal de ponto.

## Arquivos principais

- `src/utils/camera.util.ts`
- `src/utils/geolocation.util.ts`
- `src/types/checkin.types.ts`
- `src/features/checkin-terminal/**`

## Tasks

1. Reaproveitar utilitários existentes quando possível.
2. Iniciar captura somente após ação do usuário.
3. Capturar uma imagem por tentativa.
4. Obter coordenadas durante o fluxo.
5. Montar payload único para o back-end.
6. Encerrar recursos ao sair, finalizar ou reiniciar.
7. Exibir mensagens claras para permissão negada, indisponibilidade e timeout.

## Testes

- permissão negada;
- recurso indisponível;
- timeout;
- sucesso;
- reinício do fluxo.

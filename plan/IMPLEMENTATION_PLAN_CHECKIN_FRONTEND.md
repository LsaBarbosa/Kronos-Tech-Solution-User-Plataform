# Plano de Ação — Front-end Check-in

## 1. Leitura obrigatória

- `README.md`
- `package.json`
- `src/App.tsx`
- `src/config/app-routes.ts`
- `src/config/api-routes.ts`
- `src/config/api.ts`
- `src/service/auth.service.ts`
- `src/service/records.service.ts`
- `src/context/CheckinContext.tsx`
- `src/components/checkin/CheckinModal.tsx`
- `src/utils/camera.util.ts`
- `src/utils/geolocation.util.ts`
- `src/types/checkin.types.ts`

## 2. Tasks

### Task 1 — Rota isolada

- Criar rota `/checkin` fora do bloco protegido.
- Criar `src/pages/CheckinTerminal.tsx` ou feature equivalente.
- Não usar menu, dashboard ou layout autenticado.

### Task 2 — Serviço HTTP

- Criar serviço específico para o endpoint novo do back-end.
- Tipar request e response.
- Normalizar erro para mensagens claras.

### Task 3 — Fluxo de câmera e localização

- Abrir câmera após clique do usuário.
- Capturar uma única foto.
- Obter localização durante o fluxo.
- Enviar payload único para o back-end.
- Adicionar botão `Reiniciar câmera`.

### Task 4 — Sucesso e saída

- Mostrar mensagem de sucesso por 10 segundos.
- Parar câmera após sucesso.
- Encerrar sessão no timer.
- Adicionar botão `Sair`.

### Task 5 — Mobile e desktop

- Mobile: layout vertical, CTA grande, fluxo em etapas.
- Desktop: layout em painel, status lateral e preview amplo.

### Task 6 — Testes

- Testar renderização inicial.
- Testar abertura de câmera por mock.
- Testar erro de permissão.
- Testar sucesso e timer de 10 segundos.
- Testar botão sair.

## 3. Validação

```bash
npm run lint
npm run test
npm run build
```

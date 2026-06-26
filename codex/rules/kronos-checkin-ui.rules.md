# Regras — UI Isolada de Check-in

## Escopo

- Criar rota isolada para terminal de ponto, sugerida como `/checkin`.
- Não depender de dashboard, menu lateral ou modal global.
- Não alterar telas administrativas existentes.
- A tela deve conduzir o colaborador por um fluxo simples de registro.

## Fluxo

1. Acessar URL do terminal.
2. Clicar em `Registrar ponto`.
3. Abrir câmera.
4. Capturar foto.
5. Obter localização durante o fluxo.
6. Enviar os dados ao endpoint novo do back-end.
7. Exibir sucesso por 10 segundos.
8. Encerrar fluxo automaticamente.
9. Permitir encerramento manual pelo botão `Sair`.

## Câmera

- Incluir botão `Reiniciar câmera`.
- Ao reiniciar, parar o stream atual antes de abrir outro.
- Parar a câmera ao sair, finalizar ou falhar.
- Exibir mensagens claras para permissão negada ou câmera indisponível.

## Responsividade

### Mobile

- Layout vertical.
- CTA grande.
- Etapas simples.
- Preview em destaque.

### Desktop

- Layout em painel ou split view.
- Área de status lateral.
- Preview maior.
- Cards de instrução.

## Validação

```bash
npm run lint
npm run test
npm run build
```

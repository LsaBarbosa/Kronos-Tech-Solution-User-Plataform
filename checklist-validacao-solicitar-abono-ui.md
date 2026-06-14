# Checklist de validação — `/solicitar-abono`

## 1. Repositórios

- [ ] Back-end está na branch `PROD_HOSTINGER_V2`.
- [ ] Front-end está na branch `feature/lgpd-compliance-new-ui`.
- [ ] Documentação está na branch `main`.

## 2. Contrato backend

- [ ] `POST /records/time-off/request` preservado.
- [ ] Envio continua como `multipart/form-data`.
- [ ] Part `request` preservado.
- [ ] Part `document` preservado e opcional.
- [ ] Payload contém `startDate`.
- [ ] Payload contém `endDate`.
- [ ] Payload contém `startHour`.
- [ ] Payload contém `endHour`.
- [ ] Payload contém `managerId`.
- [ ] Payload contém `type`.
- [ ] `type` usa `TIME_OFF_REQUEST` ou `FORGOTTEN_REGISTRATION`.

## 3. UX desktop

- [ ] Desktop tem experiência própria.
- [ ] Não é apenas mobile esticado.
- [ ] Header/breadcrumb exibido.
- [ ] Hero exibido.
- [ ] Cards de tipo exibidos.
- [ ] Formulário de composição exibido.
- [ ] Resumo lateral exibido.
- [ ] Checklist operacional exibido.
- [ ] CTA principal visível.
- [ ] Estado de loading claro.
- [ ] Erros aparecem no contexto.

## 4. UX mobile

- [ ] Mobile tem experiência própria.
- [ ] Não é apenas desktop comprimido.
- [ ] Header compacto exibido.
- [ ] Stepper ou navegação por etapas exibido.
- [ ] Bottom action fixa exibida.
- [ ] Cards empilhados.
- [ ] Alvos de toque adequados.
- [ ] Upload simplificado.
- [ ] Resumo antes do envio.

## 5. Fluxo funcional

- [ ] Seleciona `Abono de horas`.
- [ ] Seleciona `Esquecimento de ponto`.
- [ ] Escolhe data inicial.
- [ ] Escolhe data final.
- [ ] Escolhe hora inicial.
- [ ] Escolhe hora final.
- [ ] Escolhe gestor.
- [ ] Envia sem anexo.
- [ ] Envia com anexo.
- [ ] Limpa formulário após sucesso.
- [ ] Toast de sucesso exibido.
- [ ] Toast de erro exibido em falha.

## 6. Upload

- [ ] Aceita arquivo permitido.
- [ ] Rejeita arquivo inválido.
- [ ] Rejeita arquivo acima do limite.
- [ ] Mostra nome do arquivo.
- [ ] Mostra tamanho do arquivo.
- [ ] Permite remover arquivo.
- [ ] Não exibe caminho local do arquivo.
- [ ] Evidência é descrita como protegida.

## 7. Validação

- [ ] Bloqueia envio sem data inicial.
- [ ] Bloqueia envio sem data final.
- [ ] Bloqueia envio sem horário inicial.
- [ ] Bloqueia envio sem horário final.
- [ ] Bloqueia envio sem gestor.
- [ ] Bloqueia fim anterior ao início.
- [ ] Bloqueia mesmo dia com hora fim anterior ou igual.
- [ ] Bloqueia duplo envio durante loading.

## 8. Acessibilidade

- [ ] Campos têm labels.
- [ ] Botões icon-only têm `aria-label`.
- [ ] Foco visível.
- [ ] Navegação por teclado funciona.
- [ ] Contraste adequado.
- [ ] Erros são legíveis.
- [ ] Loading é perceptível.
- [ ] Mobile tem alvos mínimos de 44px.

## 9. Limpeza

- [ ] JSX legado removido.
- [ ] Imports não usados removidos.
- [ ] Comentários antigos removidos.
- [ ] Código duplicado removido.
- [ ] Rota `/solicitar-abono` preservada.
- [ ] Rota `/aprovacoes-abono` não foi alterada.

## 10. Comandos

- [ ] `npm run lint` executado.
- [ ] `npm run build` executado.
- [ ] Erros documentados, se existirem.

# Tasks — Front-end Chat TAWK.to

## Fase 0 — Preparação

- Confirmar branch `chat`.
- Atualizar branch com `homolog` se necessário.
- Ler documentação TAWK.to JavaScript API.
- Ler documentação TAWK.to Webhooks para entender eventos que virão do back-end.
- Ler componentes atuais de FAQ.

## Fase 1 — Contrato com back-end

- Definir DTO de bootstrap no front.
- Definir rota de bootstrap no `api-routes`.
- Definir cliente HTTP tipado.
- Tratar estados enabled, disabled e error.

## Fase 2 — Serviço TAWK.to

- Criar serviço/hook isolado para carregar script.
- Evitar múltiplas inserções do script.
- Executar login no widget após bootstrap.
- Atualizar atributos quando rota/empresa mudar.
- Encerrar sessão no logout.

## Fase 3 — FAQ contextual

- Usar `faqPathMapping.ts`.
- Buscar artigos por screen key.
- Exibir artigos antes do chat.
- Permitir abrir atendimento após FAQ.

## Fase 4 — Desktop

- Criar painel contextual.
- Exibir artigos sugeridos.
- Exibir status do atendimento.
- Botão para abrir chat.
- Manter layout adequado para dashboards e tabelas.

## Fase 5 — Mobile

- Criar bottom sheet ou ação flutuante.
- Exibir cards curtos de FAQ.
- Evitar conflito com navegação inferior.
- Garantir usabilidade com teclado virtual.

## Fase 6 — Eventos

- Registrar abertura do painel.
- Registrar abertura do chat.
- Registrar status do widget.
- Registrar finalização quando disponível.

## Fase 7 — Testes

- Testar feature flag desligada.
- Testar bootstrap com sucesso.
- Testar erro no bootstrap.
- Testar FAQ contextual.
- Testar desktop.
- Testar mobile.
- Testar logout.

## Fase 8 — Validação final

- Rodar `npm run lint`.
- Rodar `npm run test`.
- Rodar `npm run build`.
- Documentar ajustes necessários de CSP/Nginx.

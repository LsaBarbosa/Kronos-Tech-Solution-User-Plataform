# Rules — Kronos `/solicitar-ferias` UI

## Regras absolutas

1. Não alterar backend.
2. Não alterar contrato HTTP.
3. Não remover a rota `/solicitar-ferias`.
4. Não transformar mobile em simples resize do desktop.
5. Não fabricar saldo de férias, férias vencidas, dias disponíveis ou elegibilidade se não houver endpoint real.
6. Não mostrar aprovação automática após envio.
7. Não enviar `Date` bruto ao backend; enviar `yyyy-MM-dd`.
8. Não expor informações sensíveis sem necessidade.
9. Não deixar código legado duplicado após a implementação nova estar validada.
10. Não ignorar falhas de lint/build sem registrar evidência.

## Regras de produto

- A tela representa uma solicitação, não uma aprovação.
- O manager é parte obrigatória do fluxo.
- O período deve ser revisado antes do envio.
- O usuário deve entender o que acontece depois do envio.
- O desktop deve priorizar planejamento e visão completa.
- O mobile deve priorizar agilidade e fluxo guiado.

## Regras técnicas

- Preservar TypeScript estrito conforme configuração do projeto.
- Reutilizar componentes `ui` existentes antes de criar novos wrappers.
- Preferir feature folder isolado.
- Separar lógica em hook/view model e UI em componentes puros.
- Utilitários de data devem ter teste unitário.
- Evitar CSS global desnecessário.
- Evitar inline styles extensos, salvo elementos decorativos muito específicos.
- Usar Tailwind e tokens da feature.
- Preservar aliases `@/`.

## Regras de responsividade

### Desktop

- Sidebar persistente.
- Header superior.
- Grid informativo.
- CTA no painel de revisão.
- Estados visíveis sem navegação adicional.

### Mobile

- Header compacto.
- Etapas/chips.
- CTA fixo no rodapé.
- Bottom sheet ou diálogo para seleção densa.
- Cards empilhados.
- Alvo mínimo de toque de 44px.

## Regras de texto

Preferir:

- "Solicitação enviada para aprovação".
- "Manager responsável pela aprovação".
- "Período solicitado".
- "Revise antes de enviar".
- "Cada dia do período será registrado para análise".

Evitar:

- "Férias aprovadas".
- "Saldo disponível" sem fonte real.
- "Garantido".
- "Concedido automaticamente".

## Definition of Done

- `/solicitar-ferias` renderiza corretamente em desktop e mobile.
- Build passa.
- Lint passa.
- Testes novos passam.
- O legado foi removido.
- O prompt final lista arquivos alterados e comandos executados.

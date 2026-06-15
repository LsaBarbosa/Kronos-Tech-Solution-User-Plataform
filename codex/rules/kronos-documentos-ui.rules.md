# Rules — Kronos `/documentos` UI

## Regra 1 — contrato HTTP

Não alterar os endpoints usados pela tela sem autorização explícita.

Endpoints esperados:

```txt
GET    /documents
GET    /documents/{documentId}
DELETE /documents/{documentId}
GET    /employee?active=
```

## Regra 2 — escopo por role

- `PARTNER`: não seleciona colaborador; usa colaborador da sessão.
- `MANAGER`: seleciona colaborador permitido pelo backend.
- `CTO`: comunicação visual de escopo administrativo, mas sem burlar contrato.

## Regra 3 — tipo documental obrigatório

Não permitir busca sem `type`.

## Regra 4 — data opcional

A data deve funcionar como filtro opcional, não como bloqueio obrigatório.

## Regra 5 — exclusão destrutiva

Toda exclusão precisa de confirmação clara contendo:

- nome do arquivo;
- efeito da ação;
- botão destrutivo separado.

Evitar `window.confirm` se o design system tiver dialog/modal acessível.

## Regra 6 — download como ação primária

Em cada resultado, download deve ser a ação principal e visualmente mais segura que exclusão.

## Regra 7 — dados sensíveis

A tela deve comunicar que documentos trabalhistas/pessoais são sensíveis. Não expor conteúdo de documento no card; mostrar apenas metadados necessários.

## Regra 8 — mobile não é tabela

No mobile, não usar tabela nem grid comprimido. Usar cards e etapas.

## Regra 9 — desktop não é formulário simples

No desktop, não manter apenas um card de filtros seguido de lista. Implementar console em duas áreas: filtros e resultados/governança.

## Regra 10 — acessibilidade

- labels explícitos;
- foco visível;
- botões com texto ou `aria-label`;
- área de toque mínima de 44px;
- status com texto, não apenas cor;
- loading anunciado de forma clara.

## Regra 11 — remoção do legado

Após implementar a nova UI, remover código visual legado da tela anterior. Não deixar duas telas concorrentes ou CSS morto evidente.

## Regra 12 — validação final

Antes de concluir:

```bash
npm run lint
npm run build
```

Executar testes se existirem.

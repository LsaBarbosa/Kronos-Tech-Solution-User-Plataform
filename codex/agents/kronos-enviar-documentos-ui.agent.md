# Agent — kronos-enviar-documentos-ui

## Papel

Você é o agente responsável por implementar a nova UI/UX da rota `/enviar-documento-colaborador` no projeto Kronos.

## Entrada principal

- Mockup desktop: `references/mockups/kronos_enviar_documentos_desktop.png`
- Mockup mobile: `references/mockups/kronos_enviar_documentos_mobile.png`
- Diretriz: `references/docs/kronos_enviar_documentos_diretriz_visual.md`
- Plano: `plano-acao-enviar-documentos-ui.md`
- Rules: `codex/rules/kronos-enviar-documentos-ui.rules.md`

## Procedimento

1. Mapear o estado atual da rota, componente, hook, service e tipos.
2. Confirmar o contrato do back-end antes de alterar o front.
3. Preservar o hook ou evoluí-lo com segurança.
4. Refatorar a página criando componentes menores quando necessário.
5. Criar diferenciação real entre desktop e mobile.
6. Remover legado visual da página antiga.
7. Executar build, lint e testes disponíveis.
8. Entregar resumo técnico e lista de arquivos alterados.

## Proibições

- Não alterar endpoint.
- Não trocar a rota alvo para `/enviar-documentos`.
- Não remover validações de arquivo.
- Não permitir seleção de outro colaborador para `PARTNER`.
- Não deixar CTA ativo sem arquivo ou destinatário.
- Não exibir dados sensíveis desnecessários.

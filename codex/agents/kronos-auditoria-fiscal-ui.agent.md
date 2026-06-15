# Agent — Kronos Auditoria Fiscal UI

## Papel

Você é o agente principal de implementação da nova UI da rota `/auditoria`.

## Objetivo

Transformar `src/pages/AuditoriaFiscal.tsx` em uma tela moderna de auditoria fiscal, orientada a geração de AEJ, AFD e Atestado Técnico, com experiências diferentes para desktop e mobile.

## Sequência obrigatória

1. Ler a diretriz visual e os mockups.
2. Mapear a implementação atual da rota `/auditoria`.
3. Confirmar contratos no front-end e back-end.
4. Implementar a nova arquitetura visual.
5. Preservar os métodos do `FiscalService`.
6. Remover ou substituir o legado visual anterior.
7. Validar responsividade, acessibilidade, build e lint.
8. Produzir resumo final com arquivos alterados e decisões.

## Decisões esperadas

- Preferir componentes locais pequenos se a tela ficar grande.
- Se houver componentes compartilhados úteis (`PageShell`, `Button`, `Card`, `Alert`, `Calendar`, `Popover`), reutilizar.
- Não criar dependências novas sem necessidade.
- Não alterar rotas globais se `/auditoria` já estiver correto.
- Não alterar `LegalController` se os endpoints atuais funcionarem.

## Entrega esperada

- Código implementado.
- Sem duplicidade de telas.
- Sem arquivo legado ativo.
- Resultado visual aderente aos mockups.
- Relatório final com comandos executados.

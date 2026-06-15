# Subagent — Legacy Cleaner

## Objetivo

Remover o legado da tela antiga após a nova implementação estar validada.

## Procurar e remover

- imports mortos em `Avisos.tsx`;
- funções antigas não usadas;
- estados antigos de dialog duplicados;
- cards/listagens antigas;
- CSS/classes obsoletas;
- comentários de correção antigos que não fazem mais sentido;
- componentes temporários.

## Não remover

- `CriarAviso.tsx`, salvo se for refatorado conscientemente.
- `useMessages.ts`, salvo se substituído por hook equivalente.
- Serviços compartilhados.
- Tipos usados por criação de aviso.

## Saída

Listar arquivos removidos/alterados e motivo.

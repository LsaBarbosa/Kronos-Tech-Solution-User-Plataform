# Subagent — document-domain

## Missão

Garantir que a nova UI respeite regras de documentos, permissões e dados sensíveis.

## Pontos obrigatórios

- Documentos são dados trabalhistas/pessoais sensíveis.
- `PARTNER` usa acervo próprio.
- `MANAGER` opera dentro do tenant/equipe.
- `CTO` tem escopo administrativo.
- Tipo documental é obrigatório.
- Data é opcional.
- Download é permitido conforme backend.
- Exclusão depende de permissão e confirmação.
- Não exibir conteúdo do arquivo, apenas metadados.

## Validação

Verificar se:

- a UI não permite seleção de funcionário para `PARTNER`;
- a exclusão tem confirmação;
- o texto de governança aparece;
- o resultado deixa claro tipo, data e nome do documento.

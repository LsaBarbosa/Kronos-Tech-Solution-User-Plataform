# Kronos — Pacote Codex CLI para `/enviar-documento-colaborador`

## Objetivo

Orientar o Codex CLI na refatoração da tela **Enviar documento** na rota `/enviar-documento-colaborador`, transformando a experiência em um **cofre de envio documental seguro**.

A implementação deve usar como referência:

- `references/docs/kronos_enviar_documentos_diretriz_visual.md`
- `references/mockups/kronos_enviar_documentos_desktop.png`
- `references/mockups/kronos_enviar_documentos_mobile.png`

## Repositórios e branches

| Repositório | Branch | Uso |
|---|---|---|
| `LsaBarbosa/Kronos-Tech-Solutions-KTS` | `PROD_HOSTINGER_V2` | Contratos HTTP e regras de upload/documentos |
| `LsaBarbosa/Kronos-Tech-Solution-User-Plataform` | `feature/lgpd-compliance-new-ui` | Implementação da tela |
| `LsaBarbosa/kronos-business` | `main` | Norteador funcional e documentação de produto |

## Arquivo-alvo principal

```text
src/pages/DocumentoColaborador.tsx
```

## Arquivos de apoio

```text
src/hooks/useCollaboratorDocumentUpload.ts
src/service/document.service.ts
src/types/document.ts
src/config/app-routes.ts
src/App.tsx
src/components/Header.tsx
src/components/Sidebar.tsx
src/components/ui/*
```

## Observação sobre rotas

O front-end possui duas rotas relacionadas:

```text
/enviar-documentos               -> EnviarDocumentos
/enviar-documento-colaborador    -> DocumentoColaborador
```

O pedido atual é para `/enviar-documento-colaborador`. Portanto, a refatoração principal deve ocorrer em `DocumentoColaborador.tsx`. Não migrar a tela errada.

## Resultado esperado

- Desktop: console de upload com hero, cards de ROLE, etapas, dropzone, prévia e governança lateral.
- Mobile: fluxo guiado com escopo atual, etapas empilhadas, validações e CTA fixo.
- Contrato HTTP preservado.
- Legado visual removido após teste.
- Validações de arquivo, tipo, tamanho e destino visíveis e acessíveis.

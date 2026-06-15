# Checklist de validação — `/auditoria`

## Contrato

- [ ] `/auditoria` continua existindo.
- [ ] Rota continua restrita a `MANAGER` e `CTO`.
- [ ] `GET /legal/technical-certificate` preservado.
- [ ] `GET /legal/afd` preservado.
- [ ] `GET /legal/aej?startDate=&endDate=` preservado.
- [ ] `FiscalService` continua centralizando downloads.
- [ ] `responseType: "blob"` preservado.

## Desktop

- [ ] Hero institucional implementado.
- [ ] Cards de `AEJ`, `AFD` e `ATESTADO`.
- [ ] Card selecionado tem borda/estado visual.
- [ ] AEJ mostra referência mensal/período.
- [ ] AFD informa que não depende de mês obrigatório.
- [ ] Atestado informa que é estático.
- [ ] Painel lateral mostra arquivo, finalidade, período, formato e regra.
- [ ] CTA muda conforme tipo selecionado.

## Mobile

- [ ] Experiência não usa tabela.
- [ ] Fluxo guiado em etapas.
- [ ] CTA fixo.
- [ ] Área de toque adequada.
- [ ] Tipo selecionado visível.
- [ ] Referência visível.
- [ ] Prévia visível.

## Estados

- [ ] AEJ sem data bloqueia ou avisa.
- [ ] AFD baixa sem data obrigatória.
- [ ] Atestado baixa sem data obrigatória.
- [ ] Loading impede clique duplo.
- [ ] Erro é exibido com texto administrativo.
- [ ] Sucesso é exibido.

## Código

- [ ] Layout legado removido.
- [ ] Imports não usados removidos.
- [ ] Sem console de debug.
- [ ] Sem mock de API.
- [ ] Sem dependência nova desnecessária.
- [ ] `npm run lint` passou.
- [ ] `npm run build` passou.

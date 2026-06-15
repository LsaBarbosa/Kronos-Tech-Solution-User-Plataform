# Skill — Kronos Aprovação de Férias UI

## Identidade da skill

Você é uma skill especializada em refatorar a rota `/ferias` do Kronos para uma experiência gerencial de aprovação de férias.

A tela deve ser implementada como **Vacation Approval Command Desk**.

## Objetivo

Transformar a tela atual de aprovação/listagem de férias em uma experiência com:

- desktop orientado a análise simultânea;
- mobile orientado a inbox de decisões;
- preservação dos contratos HTTP existentes;
- ações sensíveis com confirmação;
- leitura clara de impacto operacional.

## Contexto de negócio

A rota `/ferias` representa a gestão de solicitações criadas em `/solicitar-ferias`.

Fluxo esperado:

1. colaborador solicita férias;
2. backend cria registros diários;
3. gestor acessa `/ferias`;
4. gestor filtra pedidos;
5. gestor seleciona solicitação ou lote;
6. gestor aprova ou rejeita;
7. backend converte os registros para status final.

## Fontes obrigatórias

Leia antes de implementar:

### Front-end

- `package.json`
- `src/App.tsx` ou arquivo equivalente de rotas
- página atual da rota `/ferias`
- hooks relacionados a férias
- services relacionados a time record/férias
- tipos usados por férias
- componentes compartilhados `Header`, `Sidebar`, `LoadingState`
- componentes em `src/components/ui`

### Back-end

No repositório `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`:

- `ApiPaths.java`
- `TimeRecordController.java`
- DTOs de férias:
  - request de listagem;
  - request de aprovação/rejeição;
  - response paginado/lista de férias.
- services/usecases relacionados a férias.

### Documentação

No repositório `kronos-business`, branch `main`:

- documentação de rotas;
- regras de negócio de ponto;
- documentação de férias;
- documentação de permissões e papéis.

### Referências visuais

- `references/docs/kronos_aprovar_ferias_diretriz_visual.md`
- `references/mockups/kronos_aprovar_ferias_desktop.png`
- `references/mockups/kronos_aprovar_ferias_mobile.png`

## Regras de implementação

### Não alterar contrato HTTP

Não altere endpoints, payloads ou semântica do backend, exceto se houver bug comprovado e documentado.

### Não misturar experiências

Não faça apenas um layout responsivo com resize.

Use:

- desktop: tabela/inbox + detalhe lateral + métricas;
- mobile: cards + chips + painel inferior fixo.

### Separar decisões

Aprovar e rejeitar devem ser ações distintas:

- verde para aprovação;
- vermelho para rejeição;
- ambas com confirmação;
- bloqueadas quando status finalizado.

### Status

Mapeie status de domínio para linguagem de UI:

| Domínio | UI |
|---|---|
| `REQUEST_VACATION` | Aguardando aprovação |
| `VACATION` | Aprovada |
| `VACATION_REJECTED` | Rejeitada |

Também trate aliases/valores legados se o front atual já fizer isso.

### Segurança visual

- Não dependa apenas de cor.
- Use textos explícitos.
- Mostre impacto antes de decisão.
- Mostre loading localizado em ações.
- Evite múltiplos submits.

## Entrega esperada

A entrega deve conter:

- nova tela `/ferias`;
- componentes extraídos quando necessário;
- hooks/normalizadores claros;
- legado removido após integração;
- build/lint/testes executados;
- checklist preenchido.

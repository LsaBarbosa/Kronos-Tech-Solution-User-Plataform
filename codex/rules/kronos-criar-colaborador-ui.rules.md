# Rules — Kronos `/criar-colaborador`

## Regras absolutas

1. Não alterar back-end.
2. Não alterar URLs de API.
3. Não alterar os nomes dos campos enviados para a API.
4. Não permitir criação de usuário antes de salvar colaborador.
5. Não permitir criação de colaborador sem CPF verificado.
6. Não permitir criação de usuário sem username verificado.
7. Não expor CPF completo em logs.
8. Não usar `console.log` com payload sensível.
9. Não criar dependências novas sem necessidade.
10. Não manter UI legada depois da refatoração aprovada.

## Regras de rota

- Rota real: `/criar-colaborador`.
- Componente atual: `src/pages/CriarColaborador.tsx`.
- Hook atual: `src/hooks/useCreateCollaborator.ts`.
- Serviço atual: `src/service/collaborator-management.service.ts`.
- A rota é protegida por `RoleRoute`.
- Role permitida: `MANAGER`.

## Regras visuais

### Desktop

- Usar painel amplo.
- Mostrar hero com proposta da tela.
- Mostrar stepper/indicadores de fases.
- Mostrar ficha do colaborador à esquerda.
- Mostrar vínculo de acesso à direita.
- Mostrar resumo de escala e jornada.
- Mostrar validações de CPF e username.

### Mobile

- Não usar a mesma grade do desktop comprimida.
- Usar etapas verticais.
- Usar CTA fixo no rodapé.
- Mostrar resumo do próximo passo.
- Reduzir campos simultâneos por bloco.
- Alvos de toque mínimos de 44px.

## Regras de estados

| Estado | Exigência |
|---|---|
| CPF não verificado | Mostrar alerta e bloquear avanço. |
| CPF disponível | Mostrar selo verde. |
| CPF indisponível | Mostrar erro vermelho. |
| Passo 1 concluído | Mostrar card de sucesso e bloquear edição acidental. |
| Username não verificado | Mostrar pendência. |
| Username disponível | Mostrar selo verde. |
| Username indisponível | Mostrar erro. |
| Enviando | Loading localizado no CTA. |
| Concluído | Mensagem de sucesso e reset do fluxo. |

## Regras de negócio

- `TRADITIONAL_5X2` deve mostrar dias fixos.
- Escalas 12x36/24x72/6x1 devem permitir data inicial quando aplicável.
- 6x1 deve permitir folga preferencial.
- `SIX_BY_ONE_ONE_WEEKEND` deve permitir índice de final de semana.
- `homeOffice=false` deve indicar geolocalização obrigatória.
- `homeOffice=true` deve indicar dispensa de geolocalização.
- Jornada deve ser exibida como entrada, intervalo e saída.

## Regras de acessibilidade

- Todo input precisa de label.
- Botões de validação precisam de texto ou `aria-label`.
- Estado não pode depender só de cor.
- Erros devem aparecer junto ao campo.
- CTA desabilitado deve ter motivo visual.
- Foco deve ser visível.

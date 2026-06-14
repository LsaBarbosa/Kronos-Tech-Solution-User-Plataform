# Plano de ação — Refatoração `/criar-colaborador`

## Épico 01 — Descoberta técnica e funcional

### História 01.01 — Confirmar rota e escopo

**Objetivo:** garantir que a implementação atingirá a rota correta.

Tasks:

1. Abrir `src/config/app-routes.ts`.
2. Confirmar `APP_PATHS.criarColaborador = "/criar-colaborador"`.
3. Confirmar `APP_ROUTE_META.criarColaborador.allowedRoles = ["MANAGER"]`.
4. Abrir `src/App.tsx`.
5. Confirmar lazy import de `CriarColaborador`.
6. Confirmar renderização por `RoleRoute`.

Critério de aceite:

- Rota e permissão confirmadas.
- Nenhuma alteração feita nesta fase.

### História 01.02 — Mapear implementação legada

Tasks:

1. Abrir `src/pages/CriarColaborador.tsx`.
2. Mapear campos renderizados.
3. Mapear estados usados do hook.
4. Mapear dependência de `PageShell`.
5. Marcar trechos visuais que serão substituídos.
6. Identificar imports removíveis após refatoração.

Critério de aceite:

- Arquivos de UI afetados identificados.
- Nenhum contrato alterado.

---

## Épico 02 — Contrato e domínio

### História 02.01 — Validar contratos do front-end

Tasks:

1. Abrir `src/hooks/useCreateCollaborator.ts`.
2. Confirmar schemas `employeeSchema` e `userSchema`.
3. Confirmar fluxo `handleCreateEmployee`.
4. Confirmar fluxo `handleCreateUser`.
5. Confirmar `preloadCsrfToken`.
6. Confirmar `onSubmit` alternando por `stepCompleted`.

Critério de aceite:

- Fluxo de duas fases preservado.
- Regras de CPF e username documentadas.

### História 02.02 — Validar contratos do back-end

Tasks:

1. Abrir `ApiPaths.java`.
2. Confirmar `/employee`, `/employee/check-cpf`, `/users`, `/users/check-username`.
3. Abrir `EmployeeController.java`.
4. Confirmar `POST /employee`.
5. Confirmar `GET /employee/check-cpf`.
6. Abrir `UserController.java`.
7. Confirmar `POST /users`.
8. Confirmar `GET /users/check-username`.
9. Abrir `CreateEmployeeRequest.java`.
10. Abrir `CreateUserRequest.java`.
11. Abrir `WorkScheduleType.java`.

Critério de aceite:

- Payloads e regras de enum confirmados.
- Sem necessidade de alteração no back-end.

---

## Épico 03 — Arquitetura visual

### História 03.01 — Projetar experiência desktop

Tasks:

1. Criar layout com `PageShell`.
2. Implementar hero institucional.
3. Criar cards de progresso: Dados, Escala, Jornada, Acesso.
4. Criar painel `Ficha do colaborador`.
5. Criar painel `Vínculo de acesso`.
6. Exibir resumo de escala e jornada.
7. Exibir CPF e username com estados claros.
8. Exibir botões `Salvar dados` e `Criar acesso`.

Critério de aceite:

- Desktop permite leitura simultânea de cadastro e vínculo.
- Não parece formulário longo.

### História 03.02 — Projetar experiência mobile

Tasks:

1. Criar topo compacto.
2. Criar stepper: Dados, Escala, Acesso.
3. Agrupar campos em cards.
4. Implementar CTA fixo inferior.
5. Exibir banner de CPF verificado.
6. Exibir próximo passo.
7. Evitar tabela ou grid desktop comprimido.

Critério de aceite:

- Mobile funciona como onboarding guiado.
- Toque mínimo preservado.

---

## Épico 04 — Integração funcional

### História 04.01 — Preservar validação de CPF

Tasks:

1. Manter `handleCheckCPF`.
2. Manter regra de CPF com 11 dígitos.
3. Exibir estados:
   - não verificado;
   - verificando;
   - disponível;
   - indisponível.
4. Bloquear avanço sem CPF disponível.

Critério de aceite:

- Usuário entende por que não pode avançar.

### História 04.02 — Preservar criação do colaborador

Tasks:

1. Manter `createCollaborator`.
2. Manter payload atual.
3. Exibir loading no CTA.
4. Exibir sucesso do passo 1.
5. Bloquear edição acidental do passo 1 após sucesso.
6. Armazenar `savedEmployeeId`.

Critério de aceite:

- `employeeId` recebido desbloqueia o vínculo de acesso.

### História 04.03 — Preservar validação de username

Tasks:

1. Manter `handleCheckUsername`.
2. Bloquear checagem antes do passo 1.
3. Exibir estados:
   - não verificado;
   - verificando;
   - disponível;
   - indisponível.
4. Bloquear conclusão sem username disponível.

Critério de aceite:

- Usuário só cria acesso validado.

### História 04.04 — Preservar criação do usuário

Tasks:

1. Manter `createUser`.
2. Enviar `username`, `role` e `employeeId`.
3. Restringir role a `MANAGER` e `PARTNER`.
4. Exibir sucesso final.
5. Resetar fluxo após conclusão.

Critério de aceite:

- Colaborador e acesso são criados em sequência correta.

---

## Épico 05 — Estados, erros e acessibilidade

### História 05.01 — Estados obrigatórios

Tasks:

1. CPF não verificado.
2. CPF disponível.
3. CPF indisponível.
4. Colaborador criado.
5. Username não verificado.
6. Username disponível.
7. Username indisponível.
8. Enviando.
9. Cadastro concluído.
10. Erro de rede.

Critério de aceite:

- Nenhum estado depende apenas de cor.

### História 05.02 — Acessibilidade

Tasks:

1. Verificar labels.
2. Verificar foco.
3. Verificar botões com texto.
4. Verificar `aria-label` em botões icônicos, se houver.
5. Verificar contraste.
6. Verificar mobile com toque mínimo.

Critério de aceite:

- Tela navegável por teclado e compreensível por leitor de tela.

---

## Épico 06 — Limpeza do legado e validação

### História 06.01 — Remover legado

Tasks:

1. Remover JSX antigo substituído.
2. Remover imports mortos.
3. Remover estilos não usados.
4. Garantir que apenas a nova UI renderiza.
5. Não remover hook/service úteis.

Critério de aceite:

- Código sem duplicidade de tela.

### História 06.02 — Build e revisão

Tasks:

1. Rodar `npm run lint`.
2. Rodar `npm run build`.
3. Testar fluxo manual.
4. Registrar arquivos alterados.
5. Registrar riscos remanescentes.

Critério de aceite:

- Build passa.
- Lint passa ou aponta apenas problemas preexistentes claramente documentados.

# Plano de ação — Refatoração `/ferias`

## Objetivo

Implementar a nova experiência da rota `/ferias` como **mesa de aprovação gerencial de férias**, com desktop e mobile realmente distintos.

---

## Épico 01 — Preparação e diagnóstico

### Task 01.01 — Validar branch e estado do workspace

**Ações**

```bash
git status
git branch --show-current
```

**Aceite**

- Branch atual é `feature/lgpd-compliance-new-ui`.
- Workspace está limpo ou alterações existentes foram identificadas.

---

### Task 01.02 — Mapear rota `/ferias`

**Ações**

- Ler `src/App.tsx` ou arquivo equivalente.
- Confirmar componente renderizado por `/ferias`.
- Confirmar proteção por papel/rota autenticada.

**Aceite**

- Arquivo da página identificado.
- Rota e guardas conhecidos.

---

### Task 01.03 — Mapear implementação legada

**Ações**

- Ler página atual de férias.
- Identificar:
  - estado local;
  - hook usado;
  - services;
  - tipos;
  - componentes auxiliares.

**Aceite**

- Lista de arquivos impactados criada.
- Pontos de remoção de legado identificados.

---

## Épico 02 — Contrato e domínio

### Task 02.01 — Confirmar endpoints no backend

**Ações**

No backend `PROD_HOSTINGER_V2`, ler:

- `ApiPaths.java`;
- `TimeRecordController.java`;
- DTOs de férias;
- service/usecase de férias.

**Aceite**

- Endpoint de listagem confirmado.
- Endpoint de aprovação confirmado.
- Endpoint de rejeição confirmado.
- Payload de lote confirmado.

---

### Task 02.02 — Normalizar status e view-model

**Ações**

Criar normalizador para:

- status pendente;
- status aprovado;
- status rejeitado;
- status desconhecido.

**Aceite**

- UI não depende diretamente de strings cruas.
- Status finalizado bloqueia ações.
- Status tem texto e estilo explícitos.

---

### Task 02.03 — Calcular impacto do período

**Ações**

Criar utilitários para:

- dias corridos;
- dias úteis estimados;
- finais de semana;
- intervalo formatado;
- iniciais do colaborador.

**Aceite**

- Painel lateral e painel mobile exibem impacto coerente.
- Cálculos não quebram com datas ausentes.

---

## Épico 03 — Desktop

### Task 03.01 — Criar shell desktop

**Ações**

- Implementar layout com sidebar, header e área principal.
- Aplicar fundo, hero e grid conforme mockup.

**Aceite**

- Desktop não se comporta como mobile ampliado.
- Sidebar/header existentes permanecem funcionais.

---

### Task 03.02 — Implementar hero e métricas

**Ações**

- Criar hero `Fila de aprovação`.
- Exibir métricas:
  - pendentes;
  - aprovadas;
  - rejeitadas;
  - em análise, se aplicável.

**Aceite**

- Métricas derivadas da lista real ou response.
- Estados vazios retornam zero.

---

### Task 03.03 — Implementar filtros

**Ações**

- Busca por colaborador.
- Chips por status:
  - pendentes;
  - aprovadas;
  - rejeitadas;
  - todos.
- Botão limpar filtros.

**Aceite**

- Filtros visíveis.
- Filtro ativo destacado.
- Sem resultado exibe mensagem clara.

---

### Task 03.04 — Implementar inbox/tabela

**Ações**

Criar lista/tabela com:

- colaborador;
- período;
- dias;
- status;
- ações rápidas.

**Aceite**

- Linha selecionada tem destaque azul.
- Ações rápidas respeitam status.
- Loading localizado quando aprova/rejeita.

---

### Task 03.05 — Implementar painel lateral

**Ações**

Exibir:

- colaborador;
- cargo, se disponível;
- dias corridos;
- úteis estimados;
- finais de semana;
- período;
- status atual;
- efeito de aprovação;
- efeito de rejeição;
- aviso de decisão sensível.

**Aceite**

- Painel atualiza ao selecionar outra solicitação.
- Sem seleção mostra orientação ou seleciona primeiro item.

---

### Task 03.06 — Implementar confirmação de decisão

**Ações**

Antes de aprovar/rejeitar, abrir diálogo com:

- nome;
- período;
- total de registros;
- ação escolhida;
- texto claro de impacto.

**Aceite**

- Confirmação obrigatória.
- Rejeição usa linguagem de risco.
- Botões bloqueiam durante mutação.

---

## Épico 04 — Mobile

### Task 04.01 — Criar experiência mobile dedicada

**Ações**

- Header compacto.
- Métricas.
- Busca.
- Chips.
- Lista por cards.
- Painel inferior fixo.

**Aceite**

- Não há tabela no mobile.
- Cards têm área de toque adequada.
- Painel inferior mostra seleção atual.

---

### Task 04.02 — Implementar cards mobile

**Ações**

Cada card deve mostrar:

- iniciais;
- nome;
- subtítulo;
- período;
- dias;
- status;
- indicador de seleção.

**Aceite**

- Card selecionado tem borda azul.
- Status é textual e colorido.
- Toque seleciona o pedido.

---

### Task 04.03 — Implementar painel inferior

**Ações**

Painel fixo mostra:

- colaborador selecionado;
- período;
- dias;
- status;
- botões rejeitar/aprovar.

**Aceite**

- Botões grandes.
- Finalizados não exibem decisão ativa.
- Confirmação preservada.

---

## Épico 05 — Estados e feedback

### Task 05.01 — Loading

**Aceite**

- Skeleton desktop.
- Skeleton mobile.
- Mutação com loading local.

### Task 05.02 — Estado vazio

**Aceite**

- Sem solicitações mostra explicação.
- Sem resultado mostra botão limpar filtros.

### Task 05.03 — Erros

**Aceite**

- Erro de listagem tem retry.
- Erro de mutação mantém seleção.
- Toast ou feedback visual existente é preservado.

---

## Épico 06 — Limpeza e validação

### Task 06.01 — Remover legado

**Aceite**

- Implementação antiga removida.
- Imports mortos removidos.
- CSS morto removido quando local e seguro.

### Task 06.02 — Rodar qualidade

```bash
npm run lint
npm run build
```

Executar testes existentes se houver.

### Task 06.03 — Revisar responsividade

Validar:

- 360x800;
- 430x932;
- 768x1024;
- 1366x768;
- 1440x900.

### Task 06.04 — Preencher checklist

Usar `checklist-validacao-aprovar-ferias-ui.md`.

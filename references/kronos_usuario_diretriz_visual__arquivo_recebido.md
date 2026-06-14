# Kronos — Diretriz visual da rota `/usuario`

## 1. Objetivo da tela

A rota `/usuario` deve deixar de parecer apenas uma página cadastral e passar a funcionar como **central de identidade, segurança e privacidade do usuário autenticado**.

A tela deve comunicar três mensagens de negócio:

1. **Identidade profissional**: quem é o usuário dentro do tenant, qual seu papel e qual vínculo funcional ele possui.
2. **Segurança da conta**: status da sessão, troca de senha e proteção por autenticação segura.
3. **Privacidade e conformidade**: consentimento biométrico, LGPD, histórico de evidências e exportação de dados.

A proposta não exige mudança de contrato HTTP. Ela reorganiza a experiência visual consumindo os mesmos dados de perfil, usuário, senha, termo biométrico e LGPD já disponíveis.

---

## 2. Premissas de negócio usadas

- A rota `/usuario` representa **perfil, conta e troca de senha**.
- O usuário autenticado pode consultar dados de colaborador e conta.
- O próprio usuário pode alterar apenas dados pessoais autorizados: e-mail, telefone e endereço.
- O próprio usuário não deve alterar por essa rota: empresa, papel, salário, escala, status ativo ou biometria administrativa.
- Troca de senha é ação sensível e deve encerrar a sessão atual.
- Consentimento biométrico deve ser apresentado como evidência versionada, não como simples booleano visual.
- Informações sensíveis devem ser minimizadas: CPF mascarado, remuneração protegida e biometria sem exibição de material facial.

---

## 3. Arquitetura de experiência

### 3.1 Desktop

A experiência desktop deve ser **painel de gestão pessoal**.

Características:

- Sidebar persistente à esquerda.
- Header superior com rota, busca e status da sessão.
- Área principal em grid informativo.
- Cards grandes e comparáveis.
- Separação clara entre:
  - identidade profissional;
  - contato editável;
  - segurança;
  - privacidade biométrica/LGPD.
- Ações expostas em cards e botões visíveis.
- Mais densidade de informação, pois o desktop é usado por gestores e usuários administrativos.

### 3.2 Mobile

A experiência mobile deve ser **app de autoatendimento**.

Características:

- Sem sidebar.
- Header compacto com identidade da plataforma.
- Cartão superior com avatar, nome, papel e status.
- Navegação por chips horizontais: Identidade, Contato, Senha, LGPD.
- Cards empilhados, com leitura curta.
- Ações por botões grandes e bottom sheet.
- Bottom navigation fixa.
- Fluxos sensíveis, como senha e revogação biométrica, devem abrir etapa dedicada, não formulário comprimido.

A versão mobile não deve ser apenas o desktop reduzido. Ela deve priorizar consulta rápida e ações de toque.

---

## 4. Paleta de cores

### 4.1 Cores principais

| Nome | Hex | RGB | Uso |
|---|---:|---:|---|
| Azul Profundo | `#102A43` | `rgb(16, 42, 67)` | Sidebar, textos principais, botões de segurança |
| Azul Petróleo | `#1F4E5F` | `rgb(31, 78, 95)` | Gradientes institucionais, áreas premium |
| Ciano Tech | `#22B8CF` | `rgb(34, 184, 207)` | Acentos, indicadores, foco e elementos tecnológicos |
| Teal Confiança | `#1C8C7C` | `rgb(28, 140, 124)` | Sucesso, conta ativa, conformidade positiva |
| Fundo Claro | `#F5F8FB` | `rgb(245, 248, 251)` | Background geral da aplicação |
| Superfície | `#FFFFFF` | `rgb(255, 255, 255)` | Cards, formulários e painéis |
| Borda Fria | `#D8E2EC` | `rgb(216, 226, 236)` | Bordas discretas e divisores |
| Texto Secundário | `#627D98` | `rgb(98, 125, 152)` | Labels, descrições e textos auxiliares |

### 4.2 Cores de estado

| Estado | Hex | RGB | Uso |
|---|---:|---:|---|
| Sucesso | `#1C8C7C` | `rgb(28, 140, 124)` | Conta ativa, consentimento vigente, operação concluída |
| Sucesso suave | `#E6F7F3` | `rgb(230, 247, 243)` | Fundo de badge positivo |
| Informação | `#22B8CF` | `rgb(34, 184, 207)` | Dados informativos, foco visual, ações neutras |
| Informação suave | `#E0F7FB` | `rgb(224, 247, 251)` | Fundo de chip informativo |
| Atenção | `#F59E0B` | `rgb(245, 158, 11)` | Senha, sessão, ações que exigem atenção |
| Atenção suave | `#FFF7E6` | `rgb(255, 247, 230)` | Fundo de aviso não destrutivo |
| Risco | `#D64545` | `rgb(214, 69, 69)` | Revogação biométrica, erros e ações destrutivas |
| Risco suave | `#FDECEC` | `rgb(253, 236, 236)` | Fundo de alerta destrutivo |
| LGPD/Rastreabilidade | `#635BFF` | `rgb(99, 91, 255)` | Histórico, evidência, exportação de dados |
| LGPD suave | `#F1EEFF` | `rgb(241, 238, 255)` | Fundo de badge de privacidade |

---

## 5. Direção visual

### 5.1 Personalidade

A tela deve transmitir:

- tecnologia corporativa;
- precisão;
- segurança;
- conformidade;
- gestão de jornada;
- confiança para empresas;
- controle sem parecer vigilância excessiva.

### 5.2 Estilo

- Visual SaaS corporativo premium.
- Cards com cantos entre 20px e 28px.
- Sombras frias, suaves e azuladas.
- Gradientes sóbrios entre `#102A43` e `#1F4E5F`.
- Acentos em ciano e teal.
- Evitar excesso de cores, ícones decorativos e fundos poluídos.

---

## 6. Conteúdo esperado por bloco

### 6.1 Header / Hero

Deve exibir:

- nome do usuário;
- papel/role;
- status da conta;
- última atualização ou última sessão;
- mensagem curta: “Dados funcionais, contato e segurança centralizados.”

### 6.2 Identidade profissional

Campos:

- nome completo;
- CPF mascarado;
- cargo;
- tipo de usuário;
- local de trabalho;
- endereço;
- remuneração mascarada ou protegida, quando exibida.

Campos não editáveis devem ter aparência de leitura, não de formulário.

### 6.3 Contato editável

Campos:

- e-mail;
- telefone.

Comportamento esperado:

- edição explícita por botão;
- estado de confirmação;
- feedback de sucesso/erro;
- validação visual antes do envio.

### 6.4 Segurança

Elementos:

- status da conta;
- alterar senha;
- aviso de encerramento da sessão após troca;
- indicadores de sessão segura.

Não misturar senha com dados cadastrais. Senha deve ser bloco próprio.

### 6.5 Privacidade e LGPD

Elementos:

- status do termo biométrico;
- versão/hash resumido ou status de evidência;
- link para histórico de consentimentos;
- ação para exportar meus dados;
- ação de revogação biométrica com linguagem de risco.

A revogação biométrica deve ser uma ação separada e confirmada.

---

## 7. Regras de UX por dispositivo

### 7.1 Desktop

| Área | Regra |
|---|---|
| Sidebar | Sempre visível, com `/usuario` ativo. |
| Grid | 2 a 3 colunas conforme largura. |
| Ações | Visíveis e próximas do contexto. |
| Privacidade | Painel inferior ou lateral, não escondido. |
| Densidade | Média/alta, com leitura comparativa. |
| Formulários | Inline ou modal lateral. |

### 7.2 Mobile

| Área | Regra |
|---|---|
| Navegação | Bottom navigation + chips horizontais. |
| Identidade | Card superior com nome, papel e status. |
| Dados | Cards empilhados e resumidos. |
| Edição | Bottom sheet ou tela dedicada. |
| Senha | Fluxo dedicado, não formulário longo na página principal. |
| LGPD | Card resumido com entrada para centro de privacidade. |
| Toque | Alvos mínimos de 44px. |

---

## 8. Acessibilidade e segurança visual

- Usar contraste adequado em tema claro e escuro.
- Botões devem ter label textual ou `aria-label`.
- Loading de perfil deve ter estado acessível.
- Erros críticos devem ser anunciados visualmente e semanticamente.
- Dados sensíveis devem ser mascarados por padrão.
- Material biométrico nunca deve aparecer na tela de perfil.
- Ações destrutivas devem exigir confirmação.

---

## 9. Resultado visual criado

Arquivos gerados:

- `kronos_usuario_desktop.png` — proposta para desktop.
- `kronos_usuario_mobile.png` — proposta responsiva mobile com experiência própria.

Esses mockups representam direção de produto e negócio. Não são especificação de código.

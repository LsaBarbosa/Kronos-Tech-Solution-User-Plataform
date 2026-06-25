# Agents e Subagents — Front-end Chat

## Orquestrador: frontend-chat-orchestrator

Coordena a implementação do suporte por chat no front-end.

## Subagents

### 1. repo-mapper

Mapear arquitetura atual do front-end.

Deve observar:

- roteamento;
- autenticação;
- chamadas HTTP;
- componentes de FAQ;
- componentes responsivos existentes;
- padrões de testes.

### 2. tawk-widget-agent

Criar camada isolada do TAWK.to.

Responsável por:

- carregamento do script;
- inicialização controlada;
- login no widget com resposta do back-end;
- controle de abrir, fechar, maximizar, minimizar e reiniciar;
- cleanup no logout.

### 3. support-experience-agent

Criar experiência de suporte da Kronos.

Responsável por:

- entrada do suporte no layout autenticado;
- integração com header/layout;
- estados online/offline;
- CTA de falar com atendimento;
- mensagens de orientação.

### 4. desktop-ux-agent

Criar experiência desktop específica.

Responsável por:

- painel lateral ou bloco contextual;
- FAQ destacado;
- status do atendimento;
- atalhos por módulo;
- layout compatível com dashboards e tabelas.

### 5. mobile-ux-agent

Criar experiência mobile específica.

Responsável por:

- bottom sheet ou ação flutuante;
- cards curtos de FAQ;
- navegação amigável ao teclado virtual;
- evitar sobreposição com navegação inferior;
- acessibilidade.

### 6. faq-agent

Reaproveitar FAQ consolidado.

Responsável por:

- usar `faqPathMapping.ts`;
- buscar artigos contextuais;
- mostrar artigos antes do chat;
- registrar abertura do chat após FAQ.

### 7. event-agent

Enviar eventos úteis ao back-end.

Responsável por:

- chat aberto;
- chat minimizado;
- chat iniciado;
- chat encerrado;
- formulário offline enviado;
- status de atendimento.

### 8. test-agent

Criar testes.

Responsável por:

- serviço do widget;
- feature flag;
- FAQ antes do chat;
- desktop;
- mobile;
- logout;
- eventos.

### 9. review-agent

Revisar entrega final.

Checklist:

- nenhum valor privado no bundle;
- build passa;
- testes passam;
- desktop e mobile são experiências distintas;
- FAQ aparece antes do chat;
- logout limpa sessão;
- documentação atualizada.

# Subagent — ui-architecture

## Objetivo

Projetar e implementar a nova arquitetura visual da tela.

## Desktop

Criar experiência de painel:

- Top bar com breadcrumb e status de evidência.
- Hero grande com título: `Formalize uma justificativa de jornada`.
- Cards de tipo:
  - `Abono de horas`
  - `Esquecimento de ponto`
- Seção período e horário:
  - início/fim de data;
  - início/fim de hora;
  - validação visual.
- Card de gestor aprovador.
- Card de evidência anexada.
- Card lateral de resumo:
  - horas/período calculado de forma auxiliar;
  - status pendente;
  - campos essenciais OK;
  - checklist operacional;
  - CTA de envio.

## Mobile

Criar experiência guiada:

- Header compacto.
- Stepper:
  - Tipo
  - Período
  - Gestor
  - Evidência
  - Revisão
- Cards empilhados.
- Bottom bar fixa com resumo e CTA.
- Interações touch-first.

## Observação sobre mockup mobile

Se o arquivo `kronos_solicitar_abono_mobile.png` contiver texto de férias, usar apenas como referência estrutural. A tela final deve falar exclusivamente de abono/esquecimento de ponto.

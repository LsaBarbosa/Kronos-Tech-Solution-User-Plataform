# Rules — Kronos `/solicitar-abono`

## Regras de contrato

1. `POST /records/time-off/request` deve continuar recebendo `multipart/form-data`.
2. O part JSON deve continuar com nome `request`.
3. O arquivo opcional deve continuar com nome `document`.
4. O DTO deve continuar compatível com:
   - `startDate`
   - `endDate`
   - `startHour`
   - `endHour`
   - `managerId`
   - `type`
5. `type` só pode ser:
   - `TIME_OFF_REQUEST`
   - `FORGOTTEN_REGISTRATION`
6. Não alterar back-end para atender a tela, salvo correção de bug comprovado e fora do escopo visual.

## Regras de domínio

1. `TIME_OFF_REQUEST` significa abono/justificativa de ausência.
2. `FORGOTTEN_REGISTRATION` significa registro de ponto esquecido.
3. Solicitação nasce pendente para análise gerencial.
4. Gestor aprova ou rejeita em fluxo separado.
5. Evidência é opcional, mas deve ser tratada como protegida.
6. A tela deve deixar claro que o envio cria solicitação, não aprovação automática.

## Regras de UX desktop

1. Desktop deve ser painel operacional.
2. Usar layout em duas colunas quando houver largura.
3. O resumo deve ficar sempre visível ou próximo ao CTA.
4. Checklist deve orientar antes do envio.
5. O upload deve mostrar estado de arquivo validado.
6. Erros devem aparecer no contexto do campo.

## Regras de UX mobile

1. Mobile deve ser fluxo guiado.
2. Usar etapas/chips/stepper.
3. Usar bottom action fixa com resumo e CTA.
4. Não comprimir todos os campos em um formulário longo sem hierarquia.
5. Alvos de toque mínimos de 44px.
6. Upload deve ter interação simples e clara.

## Regras visuais

1. Base visual SaaS corporativa.
2. Usar azul profundo, azul/ciano e superfícies claras.
3. Bordas frias, sombras suaves, cantos arredondados.
4. Evitar excesso de efeitos decorativos.
5. Não copiar textos de férias para abono.
6. Não exibir dados pessoais sensíveis.

## Regras de qualidade

1. `npm run build` deve passar.
2. `npm run lint` deve ser executado.
3. Testar fluxo com anexo.
4. Testar fluxo sem anexo.
5. Testar `TIME_OFF_REQUEST`.
6. Testar `FORGOTTEN_REGISTRATION`.
7. Testar datas iguais com horário fim posterior.
8. Testar data fim anterior à inicial.
9. Testar manager ausente.
10. Testar arquivo inválido.

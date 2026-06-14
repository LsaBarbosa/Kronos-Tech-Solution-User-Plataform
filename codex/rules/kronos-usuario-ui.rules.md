# Rules — Kronos `/usuario` UI Refactor

## 1. Regras de negócio

1. A rota `/usuario` representa perfil, conta, senha, segurança, consentimento biométrico e LGPD.
2. O usuário autenticado pode consultar dados de colaborador e conta.
3. O usuário só pode alterar dados pessoais autorizados:
   - e-mail;
   - telefone;
   - endereço, se o contrato atual permitir.
4. O usuário não pode alterar por essa rota:
   - empresa;
   - papel/role;
   - salário;
   - escala;
   - status ativo;
   - biometria administrativa.
5. Troca de senha deve ser tratada como ação sensível e deve encerrar a sessão.
6. Revogação biométrica deve ser tratada como ação destrutiva e deve encerrar a sessão.
7. Consentimento biométrico deve ser apresentado como evidência versionada.
8. Exportação LGPD deve ser ação separada.

## 2. Regras de contrato

1. Não alterar endpoints existentes.
2. Não alterar DTOs do back-end.
3. Não criar fallback que mascare erro de contrato.
4. Chamadas mutáveis devem usar o fluxo CSRF existente.
5. `401` deve levar a logout ou tela de login.
6. `403` deve ser tratado como acesso negado/CSRF conforme helpers existentes.
7. Manter `/usuario` em `APP_PATHS.usuario`.

## 3. Regras de segurança visual

1. CPF completo nunca aparece.
2. Salário não aparece em valor aberto por padrão.
3. Biometria facial nunca aparece.
4. Hash completo não aparece; se exibido, usar resumo curto.
5. Senha nunca fica fora de inputs do tipo password, salvo toggle explícito.
6. Não logar dados pessoais, senha, token, exportação LGPD ou payload biométrico.
7. Ações destrutivas precisam de confirmação.

## 4. Regras de UX desktop

1. Desktop deve ser painel de gestão pessoal.
2. Sidebar deve permanecer disponível.
3. Header deve mostrar rota/contexto e status.
4. Layout deve usar grid com densidade média/alta.
5. Ações devem ficar próximas ao contexto.
6. LGPD não deve ficar escondido.

## 5. Regras de UX mobile

1. Mobile não usa sidebar.
2. Mobile deve ter header compacto.
3. Mobile deve ter card superior de identidade.
4. Mobile deve ter chips horizontais por seção.
5. Mobile deve ter bottom navigation fixa.
6. Edição e senha devem abrir sheet ou etapa dedicada.
7. Alvos de toque mínimos: 44px.
8. Não comprimir formulário longo na página principal.

## 6. Regras de design

1. Usar paleta:
   - `#102A43`;
   - `#1F4E5F`;
   - `#22B8CF`;
   - `#1C8C7C`;
   - `#F5F8FB`;
   - `#FFFFFF`;
   - `#D8E2EC`;
   - `#627D98`;
   - `#D64545`;
   - `#635BFF`.
2. Cards devem ter cantos entre 20px e 28px.
3. Sombras devem ser frias, suaves e discretas.
4. Evitar excesso de ícones e cores.
5. Visual deve comunicar SaaS corporativo, segurança e conformidade.

## 7. Regras de implementação

1. `src/pages/Usuario.tsx` deve virar entrypoint enxuto.
2. Componentes novos devem ficar em `src/features/user-profile`.
3. Separar hook/view-model de apresentação.
4. Formatadores e máscaras devem ser funções puras.
5. Não duplicar services HTTP sem necessidade.
6. Reaproveitar componentes de UI existentes.
7. Evitar componentes gigantes.
8. Evitar lógica de negócio dentro do JSX.
9. Remover legado visual após validação.
10. Executar lint/build/test antes de finalizar.

## 8. Regras de aceite

A tarefa só está concluída se:

- `/usuario` abre em desktop;
- `/usuario` abre em mobile;
- e-mail edita e salva;
- telefone edita e salva;
- senha valida e envia;
- status biométrico aparece;
- histórico de consentimentos é acessível;
- exportação LGPD é acessível;
- revogação biométrica exige confirmação;
- lint passa;
- build passa;
- legado visual antigo não fica duplicado.

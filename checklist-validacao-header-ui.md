# Checklist de validação — Header global Kronos

## Ambiente

- [ ] Front-end na branch `feature/lgpd-compliance-new-ui`
- [ ] Back-end na branch `PROD_HOSTINGER_V2`
- [ ] Documentação na branch `main`
- [ ] Dependências instaladas
- [ ] Ambiente local sobe sem erro

## Arquivos

- [ ] `src/components/Header.tsx` refatorado
- [ ] `src/components/PageShell.tsx` sem duplicidade de header
- [ ] `src/utils/layout-colors.ts` atualizado ou não mais necessário
- [ ] Componentes auxiliares criados em `src/components/header/`
- [ ] Imports mortos removidos
- [ ] Header legado removido

## Desktop

- [ ] Header fixo no topo
- [ ] Botão de menu visível
- [ ] Marca Kronos visível
- [ ] Rota/contexto atual visível
- [ ] Role visível
- [ ] Sessão protegida visível
- [ ] LGPD/consentimento visível
- [ ] `Registrar ponto` visível e textual
- [ ] Avisos com badge
- [ ] Avatar/perfil
- [ ] Logout dentro do menu de conta
- [ ] Header não cobre conteúdo

## Mobile

- [ ] Header compacto
- [ ] Menu com toque mínimo de 44px
- [ ] Marca curta
- [ ] Role em chip
- [ ] Badge de avisos
- [ ] CTA de ponto prioritário
- [ ] Textos reduzidos
- [ ] Sem cópia reduzida do desktop
- [ ] Sem overflow horizontal

## Integração

- [ ] `openCheckin` é chamado pelo CTA
- [ ] `logout` do `AuthContext` é usado
- [ ] `APP_ROUTE_META`/`APP_PATHS` usados para contexto de rota
- [ ] `Sidebar` abre e fecha corretamente
- [ ] `CheckinModal` continua funcionando
- [ ] Rotas públicas sem header autenticado
- [ ] Rotas autenticadas com header

## Estados

- [ ] Sessão carregando
- [ ] Sessão autenticada
- [ ] Role desconhecida
- [ ] Sem avisos
- [ ] Com avisos
- [ ] Check-in aberto
- [ ] Logout
- [ ] Sessão expirada

## Segurança e LGPD

- [ ] Não expõe salário
- [ ] Não expõe CPF
- [ ] Não expõe dado sensível no header
- [ ] LGPD aparece como confiança visual
- [ ] Logout não é acidental
- [ ] Autorização final permanece no back-end

## Acessibilidade

- [ ] `aria-label` nos botões iconográficos
- [ ] Foco visível
- [ ] Navegação por teclado
- [ ] Contraste validado
- [ ] Badge tem texto acessível
- [ ] Menu de conta operável por teclado

## Comandos

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run test`
- [ ] `npm run test:e2e`, se aplicável

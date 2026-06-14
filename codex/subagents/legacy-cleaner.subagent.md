# Subagent — Legacy Cleaner

## Responsabilidade

Remover o legado visual da tela `/usuario` após a nova implementação estar funcional.

## O que pode ser removido

- JSX antigo dentro de `src/pages/Usuario.tsx`.
- Componentes antigos exclusivos da tela `/usuario` sem uso.
- Utilitários antigos de cores exclusivos da tela, se substituídos.
- Imports mortos.
- Estados locais que migraram para hooks.
- Comentários antigos que não agregam manutenção.

## O que não pode ser removido sem validação

- `useUser`, se ainda usado por outra tela.
- `user.service.ts`, `terms.service.ts`, `lgpd.service.ts`.
- Tipos compartilhados em `src/types`.
- Componentes UI compartilhados.
- `BiometricConsentCard`, se usado em outro fluxo.
- Rotas globais.
- Configuração de CSRF/interceptors.

## Processo

1. Rodar busca por imports antes de remover.
2. Remover somente código sem referência.
3. Rodar lint.
4. Rodar build.
5. Corrigir imports quebrados.
6. Registrar arquivos removidos.

## Comandos úteis

```bash
grep -R "BiometricConsentCard" -n src
grep -R "usuarioPageColors" -n src
grep -R "useUser" -n src
npm run lint
npm run build
```

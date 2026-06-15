# Subagent — Security LGPD

## Objetivo

Validar que o header comunica segurança e LGPD sem expor dados sensíveis.

## Validar

- Não exibir salário.
- Não exibir CPF.
- Não exibir e-mail completo se o espaço for pequeno; preferir nome/iniciais.
- Mostrar consentimento/LGPD como chip de confiança.
- Logout deve exigir ação deliberada via menu.
- Header não deve permanecer em sessão expirada.
- Não expor stack trace ou erro técnico.

## Conteúdo recomendado

- `Sessão protegida`
- `online`
- `LGPD`
- `consentimento OK`
- `perfil`

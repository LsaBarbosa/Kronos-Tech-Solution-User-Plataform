# Subagent — Security LGPD

## Responsabilidade

Garantir que a tela `/usuario` respeite segurança, minimização de dados, LGPD e consentimento biométrico versionado.

## Regras críticas

### Dados sensíveis

- CPF deve aparecer mascarado.
- Remuneração deve aparecer mascarada ou como `R$ •••••,••`.
- Biometria facial nunca deve aparecer.
- Não exibir chave S3, hash completo, token, cookie, base64 ou dados brutos.
- Não usar `console.log` com payload de perfil, senha, exportação LGPD ou consentimento.

### Senha

- Bloco próprio.
- Não misturar com dados cadastrais.
- Validar confirmação localmente.
- Informar que a troca encerra a sessão.
- Após sucesso, respeitar redirecionamento ou sessão expirada.

### Consentimento biométrico

- Exibir status como evidência versionada, não apenas booleano.
- Quando houver histórico, mostrar:
  - tipo;
  - versão;
  - status;
  - data resumida;
  - hash/evidência resumidos, se disponíveis.
- Revogação:
  - ação destrutiva;
  - confirmação explícita;
  - texto claro sobre perda de login facial;
  - tratar encerramento de sessão.

### LGPD

- Exportação de dados próprios deve ficar separada.
- Exportação deve ter feedback.
- Se gerar arquivo/download, não renderizar todo o JSON sensível na página.
- Solicitações LGPD devem usar linguagem de titular de dados.
- Ações destrutivas devem ser confirmadas.

## Textos sugeridos

- “Dados funcionais, contato e segurança centralizados.”
- “Troca de senha encerra a sessão atual.”
- “Consentimento biométrico versionado.”
- “Exportar meus dados.”
- “Revogar biometria — ação sensível.”

## Saída

Validar que a UI não viola:

- minimização;
- finalidade;
- segurança visual;
- separação de ação sensível;
- mascaramento por padrão.

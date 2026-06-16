---
name: security-lgpd-subagent
summary: Revisa segurança, LGPD, auditoria, retenção e logs do fluxo de assinatura do ponto.
tools: Read, Grep, Glob, Bash, Edit, MultiEdit
---

# Subagent — Security & LGPD

## Objetivo

Garantir que a assinatura eletrônica do ponto seja segura, auditável e compatível com LGPD.

## Checklist técnico

### Autenticação e autorização

- [ ] Endpoint de assinatura exige usuário autenticado.
- [ ] Endpoint mutável exige CSRF via configuração existente.
- [ ] Assinatura própria usa `employeeId` do JWT, não do body.
- [ ] Admin list valida tenant por `DomainAuthorizationService`.
- [ ] MANAGER não assina por colaborador.

### Reautenticação

- [ ] Senha atual é verificada no backend.
- [ ] Senha nunca é logada.
- [ ] Senha não é persistida.
- [ ] Campo de senha é limpo no frontend.

### Evidência

- [ ] Hash SHA-256 do PDF.
- [ ] Hash SHA-256 do snapshot dos registros.
- [ ] IP e User-Agent coletados no backend.
- [ ] Data/hora do servidor registrada.
- [ ] Declaração versionada com hash.
- [ ] Audit log gerado.

### LGPD

- [ ] Dados pessoais minimizados em logs.
- [ ] Inventário de tratamento atualizado.
- [ ] Retenção preserva dados trabalhistas/fiscais.
- [ ] Exportação LGPD considera a nova evidência quando aplicável.
- [ ] Não há imagem facial no fluxo, salvo decisão explícita futura.

### Integridade

- [ ] Snapshot canônico determinístico.
- [ ] Consulta de status detecta divergência posterior.
- [ ] Assinatura não altera registros fiscais.
- [ ] Sem endpoint destrutivo sem auditoria.

## Sinais de reprovação

Reprovar se encontrar:

- assinatura com `employeeId` informado pelo cliente;
- ausência de senha/reautenticação;
- persistência de senha/token/face;
- log de CPF, senha, JWT, CSRF ou imagem;
- texto de aceite com renúncia de direito;
- alteração de NSR/AFD/AEJ por causa da assinatura;
- assinatura de mês atual ou período arbitrário.

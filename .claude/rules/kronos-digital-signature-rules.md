# Rules — Assinatura Digital do Ponto Kronos

## Regras de implementação

1. **Nunca alterar NSR, AFD ou AEJ** para criar assinatura mensal.
2. **Nunca assinar mês atual ou futuro**.
3. **Nunca assinar período informado livremente pelo cliente** no fluxo do colaborador; sempre calcular mês anterior no backend.
4. **Nunca aceitar `employeeId` no body** da assinatura própria.
5. **Nunca permitir gestor assinar em nome de colaborador**.
6. **Nunca armazenar senha, JWT, CSRF token ou imagem facial** na evidência.
7. **Nunca logar senha, token, CPF completo ou imagem facial**.
8. **Nunca declarar ICP-Brasil/assinatura qualificada** sem integração real com certificado ICP-Brasil.
9. **Toda alteração de schema exige Flyway**.
10. **Todo endpoint novo entra em `ApiPaths`**.
11. **Controller não contém regra de negócio**; chamar UseCase/Service.
12. **Provider/repository deve respeitar arquitetura hexagonal existente**.
13. **Assinatura exige reautenticação por senha**.
14. **Assinatura exige confirmação explícita do texto de declaração**.
15. **Assinatura exige hash do PDF e hash do snapshot dos registros**.
16. **Assinatura exige audit log** em sucesso e falha relevante.
17. **Consulta deve detectar divergência posterior** entre snapshot assinado e estado atual.
18. **Documento/evidência deve respeitar retenção trabalhista/fiscal**.
19. **Frontend não persiste senha em storage**.
20. **Documentação deve ser atualizada no repositório `kronos-business`**.

## Definition of Done obrigatória

- Backend build/test OK ou falhas documentadas como pré-existentes.
- Frontend build/test OK ou falhas documentadas como pré-existentes.
- Migration versionada.
- Endpoints documentados.
- Tela ou integração de UI pronta.
- Evidência técnica auditável.
- LGPD/inventário atualizado.
- Sem mudança indevida no fluxo fiscal existente.

# Frontend Permissions Matrix

## Regras vigentes no front

O front segue o contrato hoje validado contra o backend `Kronos-Tech-Solutions-KTS`.
Quando o backend não tem validação clara para CTO em fluxos gerenciais, o front adota a opção conservadora e não expõe a rota.

## Rotas do front

| Área | Rota | PARTNER | MANAGER | CTO | Observação |
|---|---|---:|---:|---:|---|
| Dashboard | `/dashboard` | Sim | Sim | Sim | Sem chamadas gerenciais para roles sem permissão |
| Perfil | `/usuario` | Sim | Sim | Sim | Dados próprios |
| Relatórios | `/relatorio-detalhado` | Sim | Sim | Sim | `employeeId` opcional para gestão |
| Espelho de ponto | `/espelho-ponto` | Sim | Sim | Sim | Gera documento do usuário autenticado |
| Avisos | `/avisos` | Sim | Sim | Sim | Criação de aviso permanece operacional para perfis internos |
| Solicitar férias | `/solicitar-ferias` | Sim | Sim | Sim | Fluxo próprio |
| Solicitar abono | `/solicitar-abono` | Sim | Sim | Sim | Fluxo próprio |
| Documentos | `/documentos` | Sim | Sim | Sim | PARTNER restrito aos próprios documentos |
| Enviar documentos próprios | `/enviar-documentos` | Sim | Sim | Sim | Uso geral |
| Documento de colaborador | `/enviar-documento-colaborador` | Sim | Sim | Sim | Tela segue ativa conforme fluxo atual |
| Empresas | `/empresa` e subrotas | Não | Não | Sim | Gestão enterprise |
| Auditoria fiscal | `/auditoria` | Não | Sim | Sim | Aderente ao backend nos endpoints `/legal/*` |
| Colaboradores | `/lista-colaboradores` | Não | Sim | Não | Gestão de equipe |
| Criar colaborador | `/criar-colaborador` | Não | Sim | Não | Gestão de equipe |
| Criar administrador | `/criar-administrador` | Não | Sim | Sim | CTO e MANAGER |
| Aprovações de ponto | `/apuracao-horas` | Não | Sim | Não | Endpoint real exige perfil gerencial |
| Status do registro | `/status-do-registro` | Não | Sim | Não | Gestão de registros |
| Férias gerenciais | `/ferias` | Não | Sim | Não | Gestão de aprovações |
| Abonos gerenciais | `/aprovacoes-abono` | Não | Sim | Não | Gestão de aprovações |

## Endpoints críticos por domínio

| Domínio | Endpoint | PARTNER | MANAGER | CTO | Observação |
|---|---|---:|---:|---:|---|
| Terms | `GET /terms/status` | Sim | Sim | Sim | Retorna boolean puro |
| Terms | `POST /terms/accept-biometric` | Sim | Sim | Sim | Retorna token novo |
| Terms | `DELETE /terms/revoke-biometric` | Sim | Sim | Sim | Revoga consentimento e retorna novo token |
| Users | `GET /users/own-profile` | Sim | Sim | Sim | Base da sessão |
| Employee | `GET /employee/own-profile` | Sim | Sim | Sim | Base do perfil da sessão |
| Records | `GET /records/pending-approvals` | Não | Sim | Não | Bloqueado no front para evitar 403 previsível |
| Records | `GET /records/vacation-request` | Não | Sim | Não | Gestão de férias |
| Records | `GET /records/time-off/requests` | Não | Sim | Não | Gestão de abonos |
| Companies | `GET /companies` | Não | Não | Sim | Gestão enterprise |
| Legal | `GET /legal/*` | Não | Sim | Sim | Aderente ao backend para auditoria fiscal |

## Notas

- `RoleRoute` protege acesso manual por URL usando `APP_ROUTE_META`.
- O menu lateral não deve expor navegação gerencial para `PARTNER`.
- O dashboard não dispara queries gerenciais de férias, abonos ou aprovações quando a role não tem permissão.

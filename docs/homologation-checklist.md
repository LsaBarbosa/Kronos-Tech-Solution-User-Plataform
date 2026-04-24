# Checklist de Homologação Manual

## 1. Login com senha

- Pré-condição: usuário ativo com credenciais válidas
- Passos: acessar login, informar `username` e `password`, submeter
- Resultado esperado: token salvo, sessão autenticada, redirecionamento para área interna
- Evidência: screenshot da navegação pós-login

## 2. Login facial

- Pré-condição: usuário com biometria cadastrada
- Passos: abrir modal facial, capturar imagem, confirmar
- Resultado esperado: sessão autenticada e redirecionamento
- Evidência: screenshot do fluxo concluído

## 3. Logout

- Pré-condição: usuário autenticado
- Passos: clicar em sair no menu lateral
- Resultado esperado: token removido, contexto limpo, retorno ao login
- Evidência: screenshot da tela de login

## 4. Criação de empresa

- Pré-condição: usuário com permissão
- Passos: preencher empresa, validar CNPJ, aguardar geolocalização, salvar
- Resultado esperado: empresa criada e navegação para criação do administrador
- Evidência: screenshot do toast de sucesso

## 5. Criação de colaborador

- Pré-condição: usuário gestor autenticado
- Passos: validar CPF, criar colaborador, validar username, criar usuário
- Resultado esperado: colaborador e usuário vinculados com sucesso
- Evidência: screenshot do estado final

## 6. Criação de usuário

- Pré-condição: `employeeId` já criado
- Passos: informar username e role, validar disponibilidade, salvar
- Resultado esperado: `POST /users` com `username`, `role`, `employeeId`
- Evidência: inspeção da requisição ou toast

## 7. Upload de documento

- Pré-condição: colaborador existente
- Passos: selecionar arquivo, tipo e colaborador, enviar
- Resultado esperado: documento listado após upload
- Evidência: screenshot da listagem

## 8. Download de documento

- Pré-condição: documento disponível
- Passos: acionar download na lista
- Resultado esperado: arquivo baixado com nome esperado
- Evidência: arquivo salvo localmente

## 9. Relatório detalhado

- Pré-condição: registros no período
- Passos: informar período, filtros e buscar
- Resultado esperado: tabela carregada com registros do backend
- Evidência: screenshot do relatório

## 10. Solicitação de férias

- Pré-condição: gestor aprovador disponível
- Passos: selecionar datas e gestor, enviar
- Resultado esperado: solicitação registrada
- Evidência: toast de sucesso

## 11. Aprovação de férias

- Pré-condição: solicitação pendente
- Passos: acessar tela de férias, filtrar pendentes, aprovar
- Resultado esperado: status atualizado e item removido da lista pendente
- Evidência: screenshot antes/depois

## 12. Solicitação de abono

- Pré-condição: gestor aprovador disponível
- Passos: preencher datas/horas, opcionalmente anexar documento, enviar
- Resultado esperado: request multipart aceita pelo backend
- Evidência: inspeção da requisição ou toast

## 13. Aprovação de abono

- Pré-condição: solicitação pendente
- Passos: acessar gestão de abonos e aprovar
- Resultado esperado: status atualizado
- Evidência: screenshot antes/depois

## 14. Aceite de termo biométrico

- Pré-condição: usuário sem aceite
- Passos: consultar status, executar aceite
- Resultado esperado: status passa para aceito e fluxo deixa de bloquear biometria
- Evidência: resposta do endpoint e screenshot

## 15. Download de AFD

- Pré-condição: período com dados disponíveis
- Passos: acionar download do AFD
- Resultado esperado: arquivo `.txt` baixado
- Evidência: arquivo salvo

## 16. Download de AEJ

- Pré-condição: período com dados disponíveis
- Passos: informar período e baixar AEJ
- Resultado esperado: arquivo `.p7s` baixado
- Evidência: arquivo salvo

## 17. Download de espelho de ponto

- Pré-condição: período com dados disponíveis
- Passos: selecionar mês/período e baixar espelho
- Resultado esperado: PDF baixado
- Evidência: arquivo salvo

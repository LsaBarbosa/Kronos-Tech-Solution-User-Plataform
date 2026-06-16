# Kronos - Diretriz visual de negocio para o PDF gerado em `/relatorio-detalhado`

## 1. Objetivo do PDF

O PDF do relatorio detalhado deve ser um documento de **apuracao de ponto orientado a contabilidade e folha de pagamento**.

Ele deve ser agradavel para leitura, mas tambem objetivo para conferencia de:

- competencia;
- periodo selecionado;
- colaborador;
- empresa;
- jornada de referencia;
- total trabalhado;
- saldo do periodo;
- horas positivas;
- horas negativas;
- abonos, folgas, ferias e faltas;
- registros pendentes;
- trilha de auditoria e observacoes.

---

## 2. Estrutura recomendada

### Pagina 1

1. Cabecalho institucional Kronos.
2. Identificacao da empresa e colaborador.
3. Competencia e periodo.
4. Resumo para contabilidade.
5. Aviso interpretativo de fechamento.
6. Tabela de registros por dia.

### Pagina 2 em diante

1. Quadro de conciliacao para fechamento.
2. Eventos contabeis relevantes.
3. Observacoes de fechamento.
4. Campos de conferencia/assinatura.
5. Rodape com pagina, fonte e orientacao de auditoria.

---

## 3. Campos de identificacao

O cabecalho do PDF deve conter:

- nome da empresa;
- CNPJ;
- nome do colaborador;
- CPF mascarado;
- cargo;
- competencia;
- periodo inicial e final;
- jornada diaria de referencia;
- data/hora de geracao;
- usuario/perfil que gerou, quando disponivel.

---

## 4. Resumo orientado a contabilidade

O PDF deve possuir um bloco proprio chamado **Resumo para contabilidade** com:

| Indicador | Finalidade |
|---|---|
| Total trabalhado | Conferencia da carga realizada. |
| Saldo do periodo | Identificacao de credito/debito. |
| Horas positivas | Base para banco de horas ou extra, conforme regra. |
| Horas negativas | Base para ajuste, desconto ou compensacao. |
| Abonos/Folgas/Ferias | Conciliacao com documentos e eventos da folha. |
| Registros pendentes | Bloqueio operacional antes do fechamento. |

---

## 5. Regras de leitura contabil

- O PDF deve separar dado bruto de interpretacao contabil.
- O PDF nao deve afirmar automaticamente que hora positiva e hora extra.
- O PDF deve indicar que a regra final depende da politica da empresa, escala, contrato e convencao coletiva.
- Abonos devem estar destacados e vinculados a evidencia quando houver documento.
- Registros pendentes devem aparecer como risco de fechamento.
- Saldos negativos devem aparecer em vermelho.
- Saldos positivos devem aparecer em verde.

---

## 6. Tabela de registros

A tabela principal deve conter:

| Coluna | Objetivo |
|---|---|
| Data | Agrupar por dia de competencia. |
| Dia | Facilitar leitura contabil. |
| Entrada | Hora de inicio. |
| Saida | Hora de fim. |
| Horas | Duracao calculada. |
| Tipo | Entrada, saida, pausa, abono, ferias ou folga. |
| Status | Estado do registro. |
| Impacto | Saldo ou observacao do evento. |

---

## 7. Paleta de cores

| Papel | Hexadecimal | RGB | Uso |
|---|---:|---:|---|
| Azul noite | `#0B1220` | `rgb(11, 18, 32)` | Cabecalho e rodape institucional. |
| Azul meia-noite | `#101A33` | `rgb(16, 26, 51)` | Faixas e areas premium. |
| Azul profundo | `#1E3A8A` | `rgb(30, 58, 138)` | Cabecalho de tabelas. |
| Azul principal | `#2563EB` | `rgb(37, 99, 235)` | Destaques e acoes. |
| Ciano tecnico | `#22D3EE` | `rgb(34, 211, 238)` | Linha superior e identidade tecnica. |
| Verde positivo | `#16A34A` | `rgb(22, 163, 74)` | Saldo positivo, aprovado, concluido. |
| Verde suave | `#DCFCE7` | `rgb(220, 252, 231)` | Fundo positivo. |
| Amarelo atencao | `#F59E0B` | `rgb(245, 158, 11)` | Pendencias e alertas de fechamento. |
| Amarelo suave | `#FEF3C7` | `rgb(254, 243, 199)` | Fundo de aviso. |
| Vermelho negativo | `#DC2626` | `rgb(220, 38, 38)` | Saldo negativo, falta, erro, risco. |
| Vermelho suave | `#FEE2E2` | `rgb(254, 226, 226)` | Fundo de risco. |
| Roxo evento especial | `#7C3AED` | `rgb(124, 58, 237)` | Abonos, documentos e eventos especiais. |
| Roxo suave | `#EDE9FE` | `rgb(237, 233, 254)` | Fundo de evento especial. |
| Teal privacidade | `#0D9488` | `rgb(13, 148, 136)` | LGPD, biometria, geolocalizacao. |
| Teal suave | `#CCFBF1` | `rgb(204, 251, 241)` | Fundo de privacidade. |
| Fundo claro | `#F8FAFC` | `rgb(248, 250, 252)` | Blocos auxiliares. |
| Superficie | `#FFFFFF` | `rgb(255, 255, 255)` | Fundo principal do documento. |
| Borda | `#E2E8F0` | `rgb(226, 232, 240)` | Separadores e tabelas. |
| Texto principal | `#0F172A` | `rgb(15, 23, 42)` | Titulos e dados fortes. |
| Texto secundario | `#64748B` | `rgb(100, 116, 139)` | Labels e metadados. |
| Texto terciario | `#94A3B8` | `rgb(148, 163, 184)` | Rodape e textos auxiliares. |

---

## 8. Diretrizes visuais

- Usar A4 vertical.
- Manter margens amplas para impressao.
- Evitar excesso de gradientes no PDF.
- Usar cabecalho escuro e tabela com alto contraste.
- Garantir legibilidade em impressao preto e branco.
- Usar zebra striping leve nas tabelas.
- Repetir cabecalho de tabela em novas paginas.
- Incluir numeracao de pagina.
- Incluir rodape com origem do documento.
- Usar status textual alem de cor.

---

## 9. Estados e alertas

| Estado | Representacao |
|---|---|
| Saldo positivo | Verde. |
| Saldo negativo | Vermelho. |
| Registro atualizado | Azul. |
| Registro pendente | Amarelo. |
| Abono | Roxo. |
| Ferias/Folga | Teal ou cinza, conforme contexto. |
| Falta | Vermelho. |
| Pausa implicita | Cinza neutro. |

---

## 10. Resultado esperado

O novo PDF deve transmitir:

- clareza para RH;
- leitura objetiva para contabilidade;
- apoio ao fechamento de folha;
- reducao de duvidas sobre saldo;
- rastreabilidade de status;
- compatibilidade com impressao e arquivamento.

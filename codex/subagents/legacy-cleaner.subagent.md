# Subagent — legacy-cleaner

## Objetivo

Remover a implementação visual antiga após a nova tela estar validada.

## Ações

1. Substituir o corpo legado de `RequestManualRegistration.tsx`.
2. Remover imports não usados.
3. Remover componentes auxiliares mortos criados no legado.
4. Preservar hook/serviços se ainda forem úteis.
5. Preservar rota e export público.
6. Rodar busca por:
   - textos antigos;
   - comentários obsoletos;
   - classes não usadas;
   - componentes duplicados.

## Saída esperada

Relatório de limpeza com arquivos removidos, arquivos preservados e justificativa.

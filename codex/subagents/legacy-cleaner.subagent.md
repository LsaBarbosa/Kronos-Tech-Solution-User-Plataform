# Subagent — legacy-cleaner

## Missão

Remover resíduos da implementação anterior depois que a nova UI estiver funcional.

## Remover ou consolidar

- blocos visuais antigos de `Documentos.tsx`;
- instruções antigas que tratam a tela como formulário simples;
- CSS/classes não utilizadas pela nova tela;
- duplicação de mapeamento de labels;
- imports não utilizados;
- componentes temporários deixados no arquivo.

## Não remover

- lógica de API funcional;
- tratamento de erro;
- toasts;
- validações;
- rotas existentes `/documentos` e `/meus-documentos`.

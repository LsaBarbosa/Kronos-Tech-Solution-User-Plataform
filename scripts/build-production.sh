#!/bin/bash

# ============================================================
# Script de Build para Produção
# Garante que VITE_API_BASE_URL está definida
# ============================================================

set -e  # Sair se qualquer comando falhar

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================
# 1. Validar que VITE_API_BASE_URL está definida
# ============================================================

if [ -z "$VITE_API_BASE_URL" ]; then
    echo -e "${RED}❌ ERRO: VITE_API_BASE_URL não está definida${NC}"
    echo ""
    echo "Como usar este script:"
    echo "  VITE_API_BASE_URL=https://seu-backend-url.com ./scripts/build-production.sh"
    echo ""
    echo "Exemplos:"
    echo "  VITE_API_BASE_URL=https://api.kronossolutions.com ./scripts/build-production.sh"
    echo "  VITE_API_BASE_URL=https://backend.render.com ./scripts/build-production.sh"
    exit 1
fi

# ============================================================
# 2. Validar que a URL é válida (começa com http:// ou https://)
# ============================================================

if [[ ! "$VITE_API_BASE_URL" =~ ^https?:// ]]; then
    echo -e "${RED}❌ ERRO: VITE_API_BASE_URL deve começar com http:// ou https://${NC}"
    echo "Valor fornecido: $VITE_API_BASE_URL"
    exit 1
fi

# ============================================================
# 3. Mostrar configuração
# ============================================================

echo -e "${GREEN}🚀 Iniciando build para PRODUÇÃO${NC}"
echo ""
echo "Configurações:"
echo -e "  Backend URL: ${GREEN}$VITE_API_BASE_URL${NC}"
echo -e "  Observability: ${YELLOW}${VITE_OBSERVABILITY_ENABLED:-false}${NC}"
echo ""

# ============================================================
# 4. Limpar builds anteriores
# ============================================================

echo "🧹 Limpando builds anteriores..."
rm -rf dist/

# ============================================================
# 5. Instalar dependências (se necessário)
# ============================================================

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm ci
fi

# ============================================================
# 6. Executar testes
# ============================================================

echo "🧪 Executando testes..."
npm run test:coverage

# ============================================================
# 7. Executar lint
# ============================================================

echo "🔍 Executando lint..."
npm run lint

# ============================================================
# 8. Build com variável de ambiente
# ============================================================

echo "🔨 Buildando para produção..."
npm run build

# ============================================================
# 9. Validação pós-build
# ============================================================

echo ""
echo "✅ Build concluído com sucesso!"
echo ""
echo "Próximos passos:"
echo "  1. Verifique dist/ para seus arquivos estáticos"
echo "  2. Faça deploy para seu servidor/CDN"
echo "  3. Teste em produção"
echo ""
echo "Dica: Para verificar a URL configurada no build:"
echo "  grep -r 'localhost' dist/ && echo '⚠️  localhost encontrado' || echo '✅ Nenhuma referência a localhost'"
echo ""

# Configuração de Ambiente

## Produção

Exemplo mínimo para Hostinger em domínio único:

```env
VITE_API_BASE_URL=https://kronostechsolutions.com
VITE_BIOMETRIC_LIVENESS_REQUIRED=false
VITE_OBSERVABILITY_ENABLED=true
VITE_OBSERVABILITY_ENDPOINT=
VITE_GOOGLE_MAPS_API_KEY=
```

## Observação importante

O front agora resolve a API assim:

1. usa `VITE_API_BASE_URL` se estiver definida;
2. em produção, usa `window.location.origin` se a variável estiver ausente;
3. em desenvolvimento, usa `http://localhost:8080`.

Isso significa que o build continua funcional no cenário real em que SPA e API compartilham `https://kronostechsolutions.com`.

## Quando a configuração está errada

Sinais típicos:

- refresh em `/dashboard` cai no Spring;
- chamadas XHR saem para domínio incorreto;
- autenticação falha por origem diferente da configurada no back-end.

## Boas práticas

- manter `VITE_API_BASE_URL` explícita no build de produção;
- alinhar CORS e domínio de cookie do back-end com `kronostechsolutions.com`;
- não usar domínio legado ou subdomínio inexistente no pipeline.

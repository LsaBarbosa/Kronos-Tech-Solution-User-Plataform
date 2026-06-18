# Hostinger Cutover

## Objetivo

Garantir que:

- `https://kronostechsolutions.com/` sirva a SPA;
- `https://kronostechsolutions.com/dashboard` abra o front em refresh direto;
- rotas de API continuem indo ao Spring Boot.

## Build do front

```bash
cd /home/kronos/Documentos/Codigin/kronos/Kronos-Tech-Solution-User-Plataform
VITE_API_BASE_URL=https://kronostechsolutions.com npm run build
```

## Publicacao do front

Publique o conteudo de `dist/` no diretório servido pelo Nginx:

```bash
sudo mkdir -p /var/www/kronos/dist
sudo rsync -av --delete dist/ /var/www/kronos/dist/
```

Arquivos obrigatórios:

- `/var/www/kronos/dist/index.html`
- `/var/www/kronos/dist/assets/*`
- `/var/www/kronos/dist/.htaccess`

## Configuracao do Nginx

Usar o arquivo:

- `/home/kronos/Documentos/Codigin/kronos/Kronos-Tech-Solutions-KTS/deploy/hostinger-nginx.conf`

Exemplo de aplicacao:

```bash
sudo cp /home/kronos/Documentos/Codigin/kronos/Kronos-Tech-Solutions-KTS/deploy/hostinger-nginx.conf /etc/nginx/sites-available/kronostechsolutions.com.conf
sudo ln -sfn /etc/nginx/sites-available/kronostechsolutions.com.conf /etc/nginx/sites-enabled/kronostechsolutions.com.conf
sudo nginx -t
sudo systemctl reload nginx
```

## Verificacao obrigatoria

```bash
curl -I https://kronostechsolutions.com/
curl -I https://kronostechsolutions.com/dashboard
curl -I https://kronostechsolutions.com/records/pending-approvals
curl -I https://kronostechsolutions.com/dashboard/summary
```

## Resultado esperado

- `/` -> `200` com `Content-Type: text/html`
- `/dashboard` -> `200` com `Content-Type: text/html`
- `/records/pending-approvals` -> `401` ou `200` JSON do back, dependendo da sessao
- `/dashboard/summary` -> `401` ou `200` JSON do back, dependendo da sessao

## Se `/dashboard` continuar em `401` ou `404` JSON

O proxy do dominio ainda está enviando a rota da SPA para o Spring Boot.

Nesse caso, revisar:

1. se o `server_name` ativo é `kronostechsolutions.com`;
2. se o `root` ativo aponta para `/var/www/kronos/dist`;
3. se o `location / { try_files $uri $uri/ /index.html; }` está no vhost ativo;
4. se não existe outro `server` sobrepondo a configuração.

# Déploiement Dashboard Web

Le Dashboard est une application React statique (SPA - Single Page Application).

## 1. Préparation
1.  **Configurer `.env`** :
    Créez un fichier `.env` à la racine :
    ```env
    VITE_API_URL=http://<IP_SERVEUR_BACKEND>:8000
    VITE_WS_HOST=<IP_SERVEUR_BACKEND>
    ```

2.  **Construire** :
    ```bash
    npm install
    npm run build
    ```

## 2. Hébergement
Les fichiers construits se trouvent dans le dossier `dist/`.

Servez ce dossier avec un serveur web statique (Nginx recommandé).

### Configuration Nginx (Exemple)
```nginx
server {
    listen 80;
    server_name dashboard.exemple.com;
    root /var/www/dashboard/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

# Guía de Despliegue en VPS (Ubuntu 24.04 LTS)

Este documento contiene los pasos exactos y configuraciones utilizadas para desplegar el backend de la API de Cobranza en un entorno de producción (VPS Ubuntu). Útil en caso de requerir migrar el sistema a un nuevo servidor.

## 1. Instalación de Dependencias Base

Actualizar el sistema e instalar Nginx, PostgreSQL, Git, Supervisor y PHP 8.3 con sus extensiones:

```bash
sudo apt update && sudo apt upgrade -y

# Instalar Nginx, PostgreSQL, Git, Unzip y Supervisor
sudo apt install -y nginx postgresql postgresql-contrib git unzip supervisor curl

# Instalar PHP 8.3 y extensiones para Laravel
sudo apt install -y php8.3-fpm php8.3-pgsql php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip php8.3-bcmath php8.3-intl php8.3-cli

# Instalar Composer globalmente
curl -sS https://getcomposer.org/installer -o composer-setup.php
sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer
rm composer-setup.php
```

## 2. Configuración de la Base de Datos (PostgreSQL)

Ingresar como el usuario postgres:
```bash
su - postgres -c psql
```

Crear el usuario y la base de datos:
```sql
CREATE USER admin_cobranza WITH PASSWORD 'laravel2026';
CREATE DATABASE db_cobranza;
GRANT ALL PRIVILEGES ON DATABASE db_cobranza TO admin_cobranza;
ALTER DATABASE db_cobranza OWNER TO admin_cobranza;
\q
```

*Nota: Si el puerto 5432 está ocupado por otra instancia, PostgreSQL en Ubuntu 24.04 usará automáticamente el puerto 5433, o se puede conectar vía Unix Socket.*

## 3. Clonación del Proyecto y Laravel

```bash
cd /var/www
sudo git clone https://github.com/tu-usuario/pr-cobranza.git
cd pr-cobranza/backend

# Asignar permisos temporales al usuario actual para instalar
sudo chown -R $USER:$USER /var/www/pr-cobranza

# Instalar dependencias de PHP
composer install --optimize-autoloader --no-dev

# Crear archivo de entorno
cp .env.example .env
php artisan key:generate
```

### Configuración del archivo `.env`
Editar `nano .env` con la siguiente configuración de base de datos (Ejemplo usando puerto 5433):

```ini
APP_ENV=production
APP_DEBUG=false
APP_URL=http://tu-ip:8005

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5433
DB_DATABASE=db_cobranza
DB_USERNAME=admin_cobranza
DB_PASSWORD=laravel2026
```

Ejecutar migraciones:
```bash
php artisan migrate --force
```

Asignar permisos finales al servidor web:
```bash
sudo chown -R www-data:www-data /var/www/pr-cobranza/backend
sudo chmod -R 775 /var/www/pr-cobranza/backend/storage
sudo chmod -R 775 /var/www/pr-cobranza/backend/bootstrap/cache
```

## 4. Configuración de Nginx

Crear el Virtual Host para Nginx:
```bash
sudo tee /etc/nginx/sites-available/pr-cobranza > /dev/null << 'EOF'
server {
    listen 8005;
    listen [::]:8005;
    server_name _;
    root /var/www/pr-cobranza/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF
```

Activar y reiniciar Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/pr-cobranza /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

## 5. Configuración de Tareas en Segundo Plano (Supervisor)

Para procesar correos e importaciones de Excel automáticamente 24/7, configurar Supervisor:

```bash
sudo tee /etc/supervisor/conf.d/pr-cobranza-worker.conf > /dev/null << 'EOF'
[program:pr-cobranza-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/pr-cobranza/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/pr-cobranza/backend/storage/logs/worker.log
stopwaitsecs=3600
EOF
```

Activar proceso:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start pr-cobranza-worker:*
```

## 6. Configuración de Firewall (UFW)

Abrir el puerto configurado en Nginx para permitir tráfico web:
```bash
sudo ufw allow 8005/tcp
sudo ufw reload
```

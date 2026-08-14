# Guía de Despliegue en VPS (Hostinger / Ubuntu)

¡Felicidades por llegar a la etapa de producción! Desplegar una aplicación separada (Backend en Laravel + Frontend en React) requiere configurar un par de servicios en tu VPS. A continuación, tienes el paso a paso exacto.

## 1. Preparación Local (Tu Computadora)

Antes de subir nada, necesitamos compilar el código de React (Frontend) para que los navegadores lo entiendan sin necesidad de Node.js.

1. Abre una terminal en tu carpeta `frontend/`.
2. Ejecuta: `npm run build`
3. Esto creará una carpeta llamada `dist/` dentro de `frontend`. Esa carpeta contiene tu aplicación web lista para producción.

## 2. Subida de Archivos al VPS

Existen dos formas de subir tu proyecto: **A través de Git (Recomendado)** o **Subiendo un archivo ZIP (SFTP/Panel de Hostinger)**.

**¿Qué debes subir al VPS?**
1. Toda la carpeta `backend/` (EXCEPTO la carpeta `vendor/` y el archivo `.env`).
2. El contenido de la carpeta `frontend/dist/` (lo subiremos a una carpeta pública que configuraremos en el servidor).

> [!TIP]
> **Estructura Recomendada en tu VPS (`/var/www/`):**
> - `/var/www/pr-cobranza-api/` -> (Aquí pones el código de Laravel).
> - `/var/www/pr-cobranza-web/` -> (Aquí pones el contenido de `frontend/dist/`).

## 3. Configuración del Backend (Laravel)

Entra a la terminal SSH de tu VPS (Hostinger te da acceso por terminal) y dirígete a la carpeta del backend (`cd /var/www/pr-cobranza-api`).

1. **Instalar Dependencias de PHP:**
   ```bash
   composer install --optimize-autoloader --no-dev
   ```
2. **Configurar Entorno (`.env`):**
   - Copia el `.env.example` a `.env` (`cp .env.example .env`).
   - Edita el archivo (`nano .env`) y pon estos valores obligatorios:
     - `APP_ENV=production`
     - `APP_DEBUG=false`
     - `APP_URL=https://api.tudominio.com`
     - `DB_CONNECTION=pgsql` (o mysql, según lo que crees en el panel de Hostinger)
     - `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` (Las credenciales reales de tu base de datos en producción).
     - `MAIL_MAILER=smtp` (Aquí pones los datos de tu correo real para que lleguen los mensajes de campañas).
     - `QUEUE_CONNECTION=database` (Para producción, se recomienda database o redis, no sync).
3. **Generar Llave y Migrar:**
   ```bash
   php artisan key:generate
   php artisan migrate --force
   php artisan storage:link
   ```
4. **Optimizar Laravel:**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

## 4. Configuración del Servidor Web (Nginx / Apache)

Dependiendo de si Hostinger usa CyberPanel, cPanel o puro Nginx, debes apuntar tus dominios a las carpetas correctas:

- **Dominio Principal (`tudominio.com`):** Debe apuntar a la carpeta `/var/www/pr-cobranza-web/`. Como es una Single Page Application (React), debes asegurarte de que todas las rutas redirijan al `index.html`.
- **Subdominio (`api.tudominio.com`):** Debe apuntar a la carpeta `/var/www/pr-cobranza-api/public/` (Laravel siempre sirve desde la carpeta `public`).

> [!WARNING]
> No olvides actualizar la variable base de tu Frontend (posiblemente un archivo `.env` en React) para que apunte a `https://api.tudominio.com` antes de ejecutar el `npm run build` en el paso 1.

## 5. El Motor del Sistema (Colas y Cronjobs)

Como nuestro SaaS procesa miles de correos y automatizaciones, el servidor debe estar ejecutando procesos en segundo plano 24/7.

### A. El Obrero de Colas (Supervisor)
No puedes simplemente correr `php artisan queue:work` y cerrar la terminal porque se apagará. En Linux se usa **Supervisor** para mantenerlo vivo:
1. Instala supervisor (`sudo apt install supervisor`).
2. Crea un archivo en `/etc/supervisor/conf.d/cobranza-worker.conf`:
   ```ini
   [program:cobranza-worker]
   process_name=%(program_name)s_%(process_num)02d
   command=php /var/www/pr-cobranza-api/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
   autostart=true
   autorestart=true
   stopasgroup=true
   killasgroup=true
   user=www-data
   numprocs=2
   redirect_stderr=true
   stdout_logfile=/var/www/pr-cobranza-api/storage/logs/worker.log
   ```
3. Actívalo: `sudo supervisorctl reread` -> `sudo supervisorctl update` -> `sudo supervisorctl start cobranza-worker:*`

### B. El Motor de Campañas (Cronjob)
Para que el servidor revise automáticamente todos los días las fechas de vencimiento y envíe las notificaciones:
1. Abre los cronjobs del servidor: `crontab -e`
2. Pega esta línea al final (esto ejecutará el schedule de Laravel cada minuto, y Laravel decidirá a qué hora lanzar tu comando de campañas si lo programas en `routes/console.php`):
   ```bash
   * * * * * cd /var/www/pr-cobranza-api && php artisan schedule:run >> /dev/null 2>&1
   ```

## 6. Integración Final de IA

Una vez el proyecto esté corriendo en línea (`https://tudominio.com`):
1. Entra al servidor por consola y genera el token permanente para el Agente IA:
   ```bash
   php artisan ai:create-token
   ```
2. Guarda el Token Bearer. Este es el token que el código de Python/Node.js de tu bot de WhatsApp usará para consumir las rutas `https://api.tudominio.com/api/ai/...` y hablar con el sistema de cobranza en vivo.

## 7. Pruebas y Diagnóstico (Troubleshooting)

Si alguna vez los correos automatizados dejan de llegar, aquí tienes el paso a paso exacto para diagnosticar el motor de fondo.

### A. Forzar el Buscador de Campañas (El Cron)
Este comando fuerza a Laravel a buscar inmediatamente en la base de datos a los deudores que cumplan las condiciones de las campañas activas.
```bash
php artisan campaigns:process
```
**Qué debe ocurrir:** 
Deberá imprimir en pantalla cuántos deudores encontró. Si dice `No se encontraron deudores`, revisa que el deudor esté en estado `pending`, que la fecha calce matemáticamente con las reglas de la campaña, y que el deudor pertenezca a la empresa de la campaña.

### B. Revisar el Cartero (La Cola de envíos)
Si el comando anterior dice `Encolando mensajes...` pero el correo no llega, el problema está en la salida.
1. Detén cualquier proceso en segundo plano de supervisor temporalmente o corre el comando manual para ver el error en vivo:
   ```bash
   php artisan queue:work --stop-when-empty
   ```
2. Si arroja un error rojo (ej. credenciales inválidas, puerto 587 bloqueado, etc.), corrígelo en tu `.env`.
3. **¡IMPORTANTE!** Si modificas cualquier archivo de código (ej. una plantilla de correo o un controlador de Laravel) o cambias el `.env`, **Supervisor seguirá usando la versión antigua que tiene en memoria RAM**. 
Para obligarlo a leer el nuevo código, SIEMPRE debes ejecutar:
   ```bash
   php artisan queue:restart
   ```
4. Si quieres leer el historial silencioso de fallos en segundo plano:
   ```bash
   tail -n 50 storage/logs/laravel.log
   ```

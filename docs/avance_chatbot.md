# Avances: Arquitectura del Chatbot y Landing Page

**Fecha de Actualización:** Agosto 2026

Este documento resume la implementación arquitectónica de la interfaz pública orientada a los deudores y la integración con el sistema automatizado de campañas de correos.

## 1. El "Enlace Mágico" (Backend)

Para evitar que los deudores deban crear cuentas o recordar contraseñas, se implementó un sistema de enlaces dinámicos en los correos electrónicos.

- **Archivo Modificado:** `backend/app/Mail/CampaignMailable.php`
- **Funcionamiento:** Cuando el cronjob procesa una campaña, reemplaza las variables `[Nombre del Cliente]`, `[Monto de la Deuda]`, `[Fecha de Vencimiento]` y `[https://URL_DE_TU_LANDING_PAGE_AQUI]` por los datos reales del deudor.
- **Ruta Habilitada:** Se expuso la ruta `GET /api/v1/debtors/{id}` en `backend/routes/api.php` para que la Landing Page pueda consultar públicamente el nombre y el saldo del deudor sin requerir un token de administrador.

## 2. La Landing Page Corporativa (Frontend)

Se creó un portal público y seguro diseñado específicamente para dispositivos móviles (Mobile-First).

- **Nueva Ruta:** `/portal/:token` (Registrada en `frontend/src/App.jsx`).
- **Vista Principal (`ChatPortal.jsx`):** 
  - Diseño "Hero" amigable que invita a la negociación ("Te ayudamos a recuperar tu tranquilidad financiera").
  - Muestra tarjetas de beneficios para generar confianza (24/7, pagos seguros, sin intereses ocultos).
- **El Widget Flotante:** 
  - El asistente virtual no ocupa toda la pantalla, sino que vive dentro de un elegante widget en la esquina inferior derecha.
  - Al ingresar, inyecta automáticamente el token seguro en los datos del widget para que la IA sepa quién es el usuario.

## 3. ¿Cómo se verá esto en tu VPS?

Actualmente, estás probando en `http://localhost:5173/portal/ZSNZJDPD`. 

Cuando subas esto a producción siguiendo tu `deployment_guide.md`, el enlace de producción que llegará a los correos de tus clientes será:

👉 **`https://tudominio.com/portal/ZSNZJDPD`**

*(Reemplazando `tudominio.com` por el dominio real que conectaste a tu VPS, y `ZSNZJDPD` por el d_token del deudor).*

### Pasos para actualizar tu VPS con estos cambios:

1. **En el Frontend (Tu computadora):**
   - Abre la terminal en la carpeta `frontend/`.
   - Ejecuta `npm run build`.
   - Sube el contenido de la carpeta `frontend/dist/` a tu VPS (en la ruta de tu servidor web para React, ej. `/var/www/pr-cobranza-web/`).
   
2. **En el Backend (El VPS):**
   - Sube los siguientes archivos actualizados a sus respectivas carpetas en el VPS:
     - `backend/app/Mail/CampaignMailable.php`
     - `backend/routes/api.php`
   - Reinicia las colas para que el servidor lea los nuevos archivos:
     ```bash
     php artisan queue:restart
     ```

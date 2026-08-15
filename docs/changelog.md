# Registro de Avances y Cambios (Changelog)

Este documento mantiene un registro histórico de las funcionalidades implementadas, correcciones de errores (bug fixes) y decisiones arquitectónicas del sistema de cobranza (SaaS Multitenant).

---

## [1.4.0] - Integración de IA (Tools API) y Pasarela de Pagos
**Fecha:** 15 de Agosto de 2026

### 🚀 Nuevas Funcionalidades
- **APIs M2M (Machine-to-Machine) para Agentes IA:**
  - Creación de rutas dedicadas bajo `/api/ai/*` protegidas por Sanctum Bearer Tokens.
  - Generación de herramientas (Functions) clave para la IA:
    - `GET /rules`: Retorna el límite de descuento dinámico.
    - `POST /payment-link`: Genera URLs para pagar en línea.
    - `POST /chat`: Espejea los mensajes del bot hacia la base de datos (Bitácora).
    - `POST /interactions`: Registra acuerdos oficiales tras el fin de una conversación.
- **Pasarela de Pagos (Checkout):**
  - Creación del componente público `Checkout.jsx` en React que lee los parámetros `paymentId`, `amount` y `debtor_id` de la URL.
  - Interfaz premium, responsive y segura que simula la pasarela de pagos, incluyendo una simulación de latencia de red.
  - Funcionalidad *End-to-End*: Al confirmar, dispara una petición a `POST /api/v1/debtors/{id}/payments`, reflejando instantáneamente el dinero en el saldo deudor del CRM y cerrando el ciclo exitosamente.
- **Documentación Completa Swagger:**
  - Actualización del archivo `docs/ai_tools_openapi.json` con los esquemas exactos (payloads correctos para `interactions` y `email`).
  - Sincronización con `backend/public/ai_tools_openapi.json` para que el visor interactivo de Swagger UI sea 100% preciso.

### 🐛 Corrección de Errores (Bug Fixes)
- **JSON Forzado en Errores de Laravel (`bootstrap/app.php`):**
  - **Problema:** Laravel respondía con código HTML en lugar de JSON al fallar validaciones (código 422) o carecer de Token en rutas `/api/*`, lo que causaba redirecciones fallidas y el temido error 500 por la ausencia de una ruta `login`.
  - **Solución:** Se intervino profundamente en `bootstrap/app.php` para usar `$middleware->redirectGuestsTo()` y abortar inmediatamente devolviendo JSON con estatus `401 Unauthorized`. Además, se implementó `$exceptions->shouldRenderJsonWhen()` para forzar que cualquier otro error (como validaciones de campos `POST`/`PATCH`) siempre devuelva una respuesta JSON estructurada, facilitando a la IA la corrección automática de parámetros faltantes sin estrellarse contra un muro HTML.
- **Corrección de Endpoints:**
  - El ruteo de `PATCH /api/ai/debtors/{id}/status` fue corregido para apuntar correctamente al método `status()` (anteriormente llamado erróneamente `updateStatus`).

---

## [1.3.0] - Automatización Híbrida y Campañas
**Fecha:** 13 de Agosto de 2026

### 🚀 Nuevas Funcionalidades
- **Panel Visual de Automatizaciones (`/campaigns`):**
  - Creación del panel administrativo en React para configurar y parametrizar envíos masivos.
  - Implementación de la tabla `campaigns` con atributos: `tenant_id`, `name`, `days_offset`, `condition_type`, `message_template` e `is_active`.
  - Capacidad de seleccionar el **Tipo de Ejecución**: 
    - *Exacto*: Diseñado como un "francotirador" para contactar a deudores en un día específico.
    - *Continuo (Repetitivo)*: Diseñado para bombardear diariamente a deudores que superan un umbral de atraso.
- **Motor Cronjob Maestro (`ProcessCampaigns`):**
  - Implementación del comando de consola `php artisan campaigns:process` encargado de barrer la base de datos de deudores, calcular matemáticamente sus fechas de vencimiento según el offset, y generar listas de destinatarios.
  - El motor delega el proceso pesado al sistema asíncrono usando **Queues & Jobs**.
- **Envío Real de Correos Electrónicos (Background Jobs):**
  - Creación del Worker Job `SendCampaignEmailJob` y la plantilla visual `CampaignMailable`.
  - Inyección dinámica de variables (reemplazando `{nombre}` y `{deuda}` por los datos reales del deudor).
  - Integración nativa con los logs del sistema (`MAIL_MAILER=log`) para facilitar pruebas locales sin requerir servidor SMTP.

---

## [1.2.0] - Módulo Global e Historial de Pagos
**Fecha:** 12 de Agosto de 2026

### 🚀 Nuevas Funcionalidades
- **Módulo Global de Pagos y Recaudos (`/payments`):**
  - Implementación de un componente completo en React (`Payments.jsx`) para que los agentes administrativos visualicen las transacciones.
  - El sistema integra filtros compuestos en Backend y Frontend por Empresa, Rangos de Fecha y Búsqueda por texto (Nombre/ID del cliente).
  - Integración nativa de botón de "Exportar Excel" que descarga un archivo `.csv` filtrado (usando `StreamDownload` con encabezado BOM en PHP).
- **Historial de Pagos Individual:**
  - Creación de una tabla `payments` ligada al modelo de `Debtor` con llaves foráneas y soporte Multitenant.
  - Añadido el componente visual `PaymentHistoryModal.jsx` a la lista de deudores, accesible mediante un ícono de recibo.
  - Incorporado un formulario en el modal que consume la ruta POST para procesar abonos en caliente, reflejando al instante los datos y re-calculando el saldo en tiempo real.

### 🐛 Corrección de Errores (Bug Fixes)
- **Desfase de Zonas Horarias (Timezone Bug):**
  - **Problema:** Los pagos se guardaban en la base de datos basándose en el reloj Universal de Greenwich (UTC) del servidor, pero el Frontend renderizaba la fecha usando las reglas de zona horaria local (`UTC-05:00`), causando que los pagos del día 12 aparecieran escondidos bajo el filtro del día 13 en las mañanas/tardes del lado de la base de datos, o que pagos recién registrados se mostraran un día antes visualmente.
  - **Solución:**
    - Ajustada la constante `'timezone' => 'America/Bogota'` dentro del archivo maestro `config/app.php` de Laravel.
    - Se reforzaron las visualizaciones de Frontend agregando un offset neutral (`+ 'T12:00:00'`) durante el formateo en `Payments.jsx` y `PaymentHistoryModal.jsx` para blindar la interpretación nativa del navegador y frenar el desfase horario retroactivo en el calendario visual.

---

## [1.1.0] - Implementación Core y Bug Fixes
**Fecha:** 31 de Julio de 2026

### 🚀 Nuevas Funcionalidades
- **Gestión de Empresas (Tenants) y Usuarios:**
  - Implementación completa de CRUDs en el Backend (`TenantController` y `UserController`).
  - Creación de interfaces modernas en React (`Tenants.jsx` y `Users.jsx`) con modales funcionales para crear y editar registros.
- **Filtro Multitenant en Cartera:**
  - Se agregó un menú desplegable (Select) en la vista de deudores (`Debtors.jsx`) para cambiar entre Tenants.
  - La tabla de deudores, la exportación a Excel (`GET /api/v1/debtors/export`) y la creación manual de casos (`POST /api/v1/debtors`) ahora requieren y validan el `tenant_id` activo.
  - El modal de importación envía dinámicamente el `tenant_id` seleccionado, corrigiendo un fallo donde se inyectaba estáticamente el ID "1" (`ImportModal.jsx`).
- **Dashboard en Tiempo Real:**
  - Se eliminó la "data falsa" (mock data) del Dashboard de React.
  - Creación del endpoint `/api/v1/dashboard/stats` en Laravel que calcula la deuda total, montos recuperados, y deudores en alto riesgo basándose en la base de datos real y aplicando el filtro Multitenant.
- **Importador Visual (React):**
  - Implementación de un componente Drag & Drop (`ImportModal.jsx`) en la vista de deudores que se comunica directamente con la API de importación de Laravel.
- **Creación y Exportación de Deudores:**
  - Implementación del Modal manual para añadir un "Nuevo Caso" (`DebtorModal.jsx`).
  - Creación del endpoint `POST /api/v1/debtors` para insertar nuevos deudores en tiempo real.
  - Creación del endpoint `GET /api/v1/debtors/export` que utiliza `streamDownload` de Laravel para agrupar y descargar masivamente la cartera entera en un archivo `.csv`.

### 🛡️ Arquitectura y Seguridad
- **Autenticación Machine-to-Machine (M2M) para el Agente IA:**
  - Se implementó **Laravel Sanctum** en el modelo `User` para emitir "API Tokens" (Bearer Tokens).
  - Se creó el comando de consola `php artisan ai:create-token` para que el administrador pueda generar llaves permanentes de acceso para los motores de IA (OpenAI, Gemini).
  - Se aislaron las rutas exclusivas de la Inteligencia Artificial bajo el prefijo `/api/ai/*`.

### 🐛 Corrección de Errores (Bug Fixes)
- **Fallo Silencioso en Importación de Excel (Windows):**
  - **Problema:** El Job `ProcessExcelImportJob` fallaba silenciosamente en entornos Windows al intentar abrir el archivo, devolviendo un 200 OK en el frontend pero sin guardar datos.
  - **Causas:** 
    1. Laravel guardaba la ruta temporal mezclando barras (`\` y `/`), lo cual causaba que la librería `spatie/simple-excel` fallara internamente al buscar el archivo.
    2. El "MIME type" detectado por los navegadores en Windows al subir un CSV provocaba que el sistema forzara la lectura como archivo de texto, o en su defecto como un XLSX corrupto.
  - **Solución:**
    - Se modificó `ImportController` para guardar el archivo respetando la extensión original del cliente.
    - Se normalizaron las rutas en `ProcessExcelImportJob` usando `DIRECTORY_SEPARATOR`.
    - Se implementó un bloque *fallback* `try/catch` que intenta forzar la lectura del archivo en formato 'csv' si la librería falla al leerlo como 'xlsx'.
- **Ejecución de Trabajos en Segundo Plano:**
  - Se cambió `QUEUE_CONNECTION` a `sync` en el `.env` para facilitar el entorno de desarrollo local, permitiendo que las importaciones de Excel se procesen de inmediato sin requerir de un proceso `queue:work` separado.
- **Mapeo de Columnas (CSV):**
  - Se ajustó el arreglo de extracción del CSV en `ProcessExcelImportJob` para aceptar explícitamente el header `fecha_vencimiento` (minúsculas y con guión bajo) asegurando compatibilidad con exportaciones estándar.

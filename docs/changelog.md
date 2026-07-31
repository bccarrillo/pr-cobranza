# Registro de Avances y Cambios (Changelog)

Este documento mantiene un registro histórico de las funcionalidades implementadas, correcciones de errores (bug fixes) y decisiones arquitectónicas del sistema de cobranza (SaaS Multitenant).

---

## [1.1.0] - Implementación Core y Bug Fixes
**Fecha:** 31 de Julio de 2026

### 🚀 Nuevas Funcionalidades
- **Gestión de Empresas (Tenants) y Usuarios:**
  - Implementación completa de CRUDs en el Backend (`TenantController` y `UserController`).
  - Creación de interfaces modernas en React (`Tenants.jsx` y `Users.jsx`) con modales funcionales para crear y editar registros.
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

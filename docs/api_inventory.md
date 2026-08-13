# Inventario y Análisis de APIs (Sistema de Cobranza)

Este documento detalla todas las rutas (endpoints) actuales de nuestro backend en Laravel. Sirve como fuente de verdad para conocer qué APIs existen, quién las consume, y cuáles son los próximos avances planeados.

---

## 1. APIs Internas (Frontend / Panel de Control)
Estas rutas están diseñadas para ser consumidas por la interfaz de usuario (React) y por administradores. Requieren autenticación estándar de Tenant/Usuario.

### 🏢 Gestión Core (Próximo a Implementar)
| Endpoint | Método | Descripción | Estado |
| :--- | :--- | :--- | :--- |
| `/api/v1/tenants` | `GET/POST` | Lista o crea empresas (Tenants) | ✅ Listo |
| `/api/v1/tenants/{id}`| `PUT/DEL` | Edita o elimina un Tenant | ✅ Listo |
| `/api/v1/users` | `GET/POST` | Lista o crea usuarios | ✅ Listo |
| `/api/v1/users/{id}` | `PUT/DEL` | Edita o elimina un usuario | ✅ Listo |

### 📊 Dashboard e Importación
| Endpoint | Método | Descripción | Estado |
| :--- | :--- | :--- | :--- |
| `/api/v1/dashboard/stats` | `GET` | Devuelve métricas consolidadas (Deuda total, activos, riesgo) | ✅ Listo |
| `/api/v1/imports` | `POST` | Sube y procesa Excel/CSV en Background | ✅ Listo |

### 👥 Gestión de Deudores
| Endpoint | Método | Descripción | Estado |
| :--- | :--- | :--- | :--- |
| `/api/v1/debtors` | `GET` | Lista todos los deudores (Paginado) | ✅ Listo |
| `/api/v1/debtors/export` | `GET` | Exportación CSV general de todos los deudores | ✅ Listo |
| `/api/v1/debtors/search` | `GET` | Búsqueda global de deudores | ✅ Listo |
| `/api/v1/debtors/{id}/status`| `PATCH`| Cambia manualmente el estado | ✅ Listo |

### 💵 Módulo de Pagos
| Endpoint | Método | Descripción | Estado |
| :--- | :--- | :--- | :--- |
| `/api/v1/payments` | `GET` | Lista general de pagos con filtros (Empresa, fechas, búsqueda) | ✅ Listo |
| `/api/v1/payments/export` | `GET` | Exportación CSV de pagos filtrados | ✅ Listo |
| `/api/v1/debtors/{id}/payments` | `GET` | Obtiene el historial de pagos de un solo deudor | ✅ Listo |
| `/api/v1/debtors/{id}/payments` | `POST` | Registra manualmente un abono para el deudor | ✅ Listo |

---

## 2. Herramientas de IA (AI Tools - Function Calling)
Estas rutas actúan como las "manos" y "ojos" del Agente de IA. Se autentican mediante **Sanctum API Tokens (M2M)** y utilizan el prefijo `/api/ai`.

| Endpoint | Método | Descripción | Estado |
| :--- | :--- | :--- | :--- |
| `/api/ai/debtors/{id}/rules` | `GET` | Obtiene reglas dinámicas de negociación (% descuento) | ✅ Listo |
| `/api/ai/debtors/{id}/payment-link`| `POST` | Genera un enlace de pago único (Simulado) | ✅ Listo |
| `/api/ai/debtors/{id}` | `GET` | Obtiene los datos de 1 deudor específico | ✅ Listo |
| `/api/ai/debtors/{id}/payments` | `GET` | Obtiene el historial de pagos del deudor (Compartido con V1) | ✅ Listo |
| `/api/ai/debtors/{id}/payments` | `POST` | Registra una promesa o abono gestionado por la IA | ✅ Listo |
| `/api/ai/debtors/{id}/interactions`| `POST` | Guarda el log (historial/resumen) de la conversación | ✅ Listo |
| `/api/ai/notifications/email` | `POST` | Envía un recibo o recordatorio por correo a petición de la IA | ✅ Listo |

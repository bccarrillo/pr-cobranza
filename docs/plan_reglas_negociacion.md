# Implementación: Reglas de Negociación (CRUD)

Este documento detalla el plan ejecutado para migrar las reglas de negociación de código estático a una base de datos dinámica administrable desde el Frontend.

## Cambios Realizados

### Base de Datos y Modelos
- **Migración:** Se creó la tabla `negotiation_rules`.
  - Columnas: `id`, `tenant_id`, `min_days` (int), `max_days` (int), `max_discount_percentage` (decimal), `allowed_installments` (int), `strategy_name` (string), `ai_message_prompt` (text).
- **Modelo:** `NegotiationRule.php` usando el trait `Multitenantable` para seguridad por empresa.
- **Población (Seeder):** Al correr la migración, se generaron las reglas predeterminadas (0-30 días, 30-90 días, etc.) para las empresas existentes.

### Backend API
- **Controlador Principal:** Se creó `NegotiationRuleController.php` con métodos CRUD (`index`, `store`, `update`, `destroy`).
- **Rutas:** Se agregó el grupo `/api/v1/rules` en `routes/api.php` protegido por Sanctum.
- **Integración IA:** Se modificó `AIToolController::getRules($id)` para que consulte dinámicamente la tabla `negotiation_rules` basándose en el `tenant_id` y los `days_overdue` del cliente. Si no hay regla, devuelve una contingencia de 0% de descuento.

### Frontend (React)
- **Vista Principal:** Se creó `NegotiationRules.jsx`, una pantalla completa con listado de reglas y formulario Modal para su edición.
- **Rutas:** Se registró la ruta `/rules` en `App.jsx`.
- **Navegación:** Se agregó la opción "Reglas de Cobranza" en el menú lateral (`Layout.jsx`).

# Seguridad y Deuda Técnica: Búsqueda Multitenant de IA

## Estado Actual (MVP)
Actualmente, las herramientas del Agente de Inteligencia Artificial (dentro de `AIToolController`) están diseñadas para ignorar la seguridad Multitenant (el "Global Scope").

Esto se logró agregando `withoutGlobalScope('tenant_id')` a las peticiones del Agente.

### ¿Por qué se hizo esto?
Para el **Producto Mínimo Viable (MVP)**, esto permite conectar un **único número de WhatsApp** y un **único Token de Agente** que pueda atender a todos los deudores en la base de datos sin importar a qué empresa pertenecen. Esto reduce drásticamente el esfuerzo de configuración inicial.

---

## El Riesgo en B2B a Gran Escala
Cuando la plataforma escale y vendas tu servicio a múltiples empresas (Empresa A, Empresa B), probablemente la Empresa A querrá tener *su propio* número de WhatsApp y su propio agente personalizado.

Si le entregas un Token de IA al Agente de la Empresa A, y un deudor de la Empresa B le escribe a ese agente por error, el Agente A **podrá acceder a los datos financieros de ese deudor** porque hemos apagado el candado de seguridad `tenant_id` en las herramientas de IA.

---

## ¿Cómo restaurar la seguridad para Producción (Escalabilidad)?

El día que quieras aislar por completo a las empresas (un bot por empresa que solo pueda leer su propia base de datos):

1. **Crear Tokens Múltiples:** Crea un Token de acceso distinto (Sanctum) para el Agente de la Empresa A, y otro para la Empresa B.
2. **Restaurar el Código:** Abre `backend/app/Http/Controllers/AIToolController.php`, busca todos los comentarios que dicen `// TODO: [SEGURIDAD - DEUDA TÉCNICA MVP]` y elimina la función `withoutGlobalScope('tenant_id')` de las consultas a Eloquent.

**Ejemplo de restauración:**
*De esto:*
`$debtor = Debtor::withoutGlobalScope('tenant_id')->where('identification', $id)->first();`

*A esto:*
`$debtor = Debtor::where('identification', $id)->first();`

Con esto, el trait `Multitenantable` volverá a blindar el sistema y el Bot A jamás podrá encontrar ni ver los datos de los deudores del Bot B, aunque pasen la cédula correcta.

# Documentación: Módulo Bitácora IA (Human-In-The-Loop)

**Fecha:** Agosto 2026
**Objetivo:** Permitir el monitoreo en vivo de las conversaciones de la IA y brindar la capacidad de intervención humana ("Human-In-The-Loop").

## Arquitectura de Base de Datos

Para proteger la integridad de los reportes del CRM (tabla `interaction_logs`), se diseñó una arquitectura paralela para el historial de chat:

### 1. Nueva Tabla: `chat_messages`
Esta tabla guarda la "cinta grabadora" cruda de todas las interacciones de chat.
- **`debtor_id`**: Referencia al cliente.
- **`sender`**: Identifica quién envió el mensaje (`'user'`, `'bot'`, o `'agent'`).
- **`message`**: El contenido de texto.
- **`read_at`**: Para manejar contadores de no leídos en el futuro.

### 2. Estados del Bot en `debtors`
Se añadieron dos banderas de seguridad al modelo del deudor:
- **`bot_paused` (boolean)**: Si es `true`, el motor de Python (IA) tiene prohibido responder a este deudor. Se activa automáticamente cuando un administrador humano envía un mensaje.
- **`requires_human` (boolean)**: Si es `true`, el cliente solicitó explícitamente hablar con un humano, o la IA detectó un nivel de frustración alto. Dispara una alerta roja de `AYUDA` en el dashboard.

## Rutas API (Backend)

Se creó el `InboxController` con las siguientes rutas en `routes/api.php`:
- `GET /api/v1/inbox/debtors`: Devuelve la lista de deudores activos, ordenando primero aquellos con `requires_human = true` y luego por la fecha del último mensaje.
- `GET /api/v1/inbox/debtors/{id}/messages`: Carga el historial de un chat.
- `POST /api/v1/inbox/debtors/{id}/messages`: Ruta usada por el administrador para enviar un mensaje como humano (Esto cambia automáticamente el `bot_paused` a true).
- `POST /api/v1/inbox/debtors/{id}/toggle-bot`: Permite forzar el encendido o apagado de la IA manualmente.

## Panel de Administración (Frontend React)

Se agregó la vista **`Inbox.jsx`** al menú lateral bajo el nombre **"Bitácora IA"**.

### Características de Interfaz:
- **Diseño a dos columnas**: Izquierda para la lista de contactos, derecha para el chat activo.
- **Efecto de Tiempo Real (Polling)**: El componente de React lanza una petición Axios cada 3 segundos (`setInterval`) para recuperar nuevos mensajes.
- **Protección contra Race Conditions**: Se usa un `useRef` para recordar el ID del deudor activo y evitar que las peticiones HTTP retrasadas sobrescriban la pantalla si el administrador cambia rápidamente de chat.
- **Auto-Scroll Inteligente**: El contenedor del chat solo se desplaza hacia abajo si detecta que la variable `messages.length` cambió (hubo un nuevo mensaje) o si se cambió de deudor, previniendo "tirones" molestos cuando el administrador intenta leer el historial superior.
- **Código de Colores de Mensajes**:
  - `Gris`: Usuario (Cliente)
  - `Azul Claro`: Bot (Inteligencia Artificial)
  - `Morado`: Agent (Humano / Administrador)

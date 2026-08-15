# Guía de Configuración: Orquestador Multi-Agente

Ya que cuentas con un orquestador externo capaz de manejar múltiples agentes, la mejor estrategia es utilizar un **Enfoque de Enjambre (Swarm) o Supervisor-Trabajador**. Esto divide la carga cognitiva y evita que un solo prompt se vuelva demasiado grande o confunda al modelo de IA.

Recordemos el flujo inicial:
1. **Cronjob** envía el correo.
2. **Deudor** hace clic en el enlace y llega al `ChatPortal` (Landing Page).
3. **Deudor** escribe su primer mensaje.
4. **El Orquestador** recibe el mensaje y entra en acción.

A continuación, te recomiendo **3 Agentes clave** y cómo configurarlos con las APIs (Tools) que ya construimos.

---

## 1. 👮 Agente Supervisor (Triage & Enrutamiento)

**Propósito:** Es la "Recepcionista". Es el primer agente que recibe el mensaje. Su único trabajo es perfilar al cliente, validar de quién se trata y derivar la conversación al agente especializado correcto (o a un humano).

* **APIs (Tools) Asignadas:**
  * `GET /api/ai/debtors/{id}` (Para conocer el saldo y días de mora antes de hablar).
  * `POST /api/ai/debtors/{id}/chat` (Para responder un saludo inicial).

* **Prompt del Sistema (System Prompt):**
  > "Eres el Agente Supervisor de PR Cobranza. Tu tarea es recibir al deudor, consultar su perfil usando la herramienta `getDebtorInfo` y analizar su intención. 
  > 
  > Reglas:
  > 1. Si el deudor está dispuesto a pagar o pide opciones de pago, transfiere la conversación al **Agente Negociador**.
  > 2. Si el deudor dice que ya pagó y tiene un reclamo, o si detectas groserías, frustración extrema o lenguaje legal, debes pausar el bot indicando que transfieres a un humano y despídete amablemente.
  > 3. Usa la herramienta `syncChatMessage` para que el humano vea lo que dices."

---

## 2. 🤝 Agente Negociador (Experto en Cobranza)

**Propósito:** Es el "Cerrador". Este agente toma la conversación cuando el deudor está dispuesto a hablar de dinero. Conoce las matemáticas, los descuentos y busca concretar una promesa o un pago inmediato.

* **APIs (Tools) Asignadas:**
  * `GET /api/ai/debtors/{id}/rules` (Para saber cuánto descuento puede dar).
  * `POST /api/ai/debtors/{id}/payment-link` (Para generar el link si el cliente acepta pagar hoy).
  * `POST /api/ai/debtors/{id}/payments` (Para registrar la promesa de pago).
  * `POST /api/ai/debtors/{id}/chat` (Para hablar con el deudor).
  * `POST /api/ai/debtors/{id}/interactions` (Para cerrar la conversación).

* **Prompt del Sistema (System Prompt):**
  > "Eres un experto en cobranza empática y persuasiva. Tu objetivo es lograr que el cliente realice un pago hoy mismo o agende una Promesa de Pago en una fecha exacta.
  > 
  > Flujo de Trabajo:
  > 1. Inmediatamente ejecuta `getNegotiationRules` para conocer tu límite de descuento y cuotas permitidas. ¡NUNCA ofrezcas un descuento mayor al permitido!
  > 2. Negocia con el cliente usando técnicas de urgencia y empatía. Empieza ofreciendo el pago total, y usa los descuentos solo como última opción para salvar el acuerdo.
  > 3. Si el cliente acepta pagar ahora, genera un link con `generatePaymentLink` y envíaselo.
  > 4. Si el cliente acepta pagar después, registra la fecha con `registerPaymentPromise`.
  > 5. Cuando te despidas, SIEMPRE ejecuta `saveInteractionSummary` resumiendo el acuerdo alcanzado.
  > 6. Recuerda usar `syncChatMessage` para cada mensaje que le envíes al usuario."

---

## 3. ⚖️ Agente de Prevención Legal (Mora Alta)

**Propósito:** Este agente solo se invoca si el Agente Supervisor detecta que el cliente tiene más de 90 días de mora (o si el deudor se niega rotundamente a pagar). Tiene un tono más firme (corporativo, no agresivo) e informa sobre las consecuencias.

* **APIs (Tools) Asignadas:**
  * `GET /api/ai/debtors/{id}/rules`
  * `PATCH /api/ai/debtors/{id}/status` (Para marcarlo como "Renuente" o "Ilocalizable").
  * `POST /api/ai/debtors/{id}/chat` 
  * `POST /api/ai/debtors/{id}/interactions`

* **Prompt del Sistema (System Prompt):**
  > "Eres el Agente de Prevención Legal. Intervienes cuando los clientes tienen alta morosidad o se niegan a cooperar. Tu tono debe ser firme, formal e informativo.
  > 
  > Tu objetivo es hacerle entender al cliente las implicaciones de no regularizar su cuenta (reportes en centrales de riesgo, cobro pre-jurídico). 
  > Si el cliente recapacita, ofrécele el descuento máximo permitido por `getNegotiationRules`.
  > Si el cliente se niega a pagar, infórmale que su expediente será trasladado al área legal, utiliza `updateDebtorStatus` para marcarlo como 'Renuente' y finaliza con `saveInteractionSummary`."

---

## 💡 Consejo Clave para la Integración

Ya que tu Orquestador es externo, asegúrate de tener cubiertos estos dos puntos para que el flujo sea perfecto:

1. **El Disparador (Trigger):** Tu plataforma de Orquestador debe enterarse cuando el usuario escribe. Puedes hacer que el Orquestador consulte (Polling) nuevos mensajes a la base de datos o, mejor aún, pedirle a Laravel que le haga un POST (Webhook) a tu plataforma cada vez que un usuario envíe un mensaje desde el portal de React.
2. **El Espejo Obligatorio:** Es **VITAL** que le dejes claro a tus agentes en el Prompt que *cualquier cosa* que decidan responderle al cliente, deben hacerlo consumiendo la API de `syncChatMessage`. Si la IA solo genera el texto internamente en la otra plataforma y no usa la herramienta, el cliente nunca verá el mensaje en la pantalla.

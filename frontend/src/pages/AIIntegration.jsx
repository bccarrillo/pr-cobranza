import React from 'react';
import { Bot, Terminal, Key, ShieldCheck, Database, Link as LinkIcon, Code2, Copy, CheckCircle2 } from 'lucide-react';

const AIIntegration = () => {
  const [copiedText, setCopiedText] = React.useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const ApiCard = ({ method, endpoint, description, colorClass, payload }) => (
    <div className="glass-card mb-4 overflow-hidden border border-slate-200/50 hover:shadow-lg transition-all">
      <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
        <div className={`px-3 py-1 rounded-md font-bold text-sm tracking-widest text-white ${colorClass}`}>
          {method}
        </div>
        <div className="font-mono text-slate-700 bg-slate-100 px-3 py-1 rounded border border-slate-200 flex-1 flex items-center justify-between">
          {endpoint}
          <button 
            onClick={() => copyToClipboard(endpoint)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            {copiedText === endpoint ? <CheckCircle2 size={16} className="text-green-500"/> : <Copy size={16} />}
          </button>
        </div>
      </div>
      <div className="px-5 pb-5">
        <p className="text-light-text-secondary">{description}</p>
        
        {payload && (
          <div className="mt-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payload (JSON)</div>
            <div className="bg-slate-900 rounded-lg p-4 relative group">
              <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                {JSON.stringify(payload, null, 2)}
              </pre>
              <button 
                onClick={() => copyToClipboard(JSON.stringify(payload, null, 2))}
                className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col relative pb-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-light-purple to-light-blue flex items-center justify-center text-white shadow-lg">
              <Bot size={24} />
            </div>
            <h2 className="text-3xl font-bold text-light-text-primary tracking-tight">Integración IA</h2>
          </div>
          <p className="text-light-text-secondary mt-1 max-w-2xl">
            Centro para desarrolladores. Aquí encontrarás la documentación necesaria para conectar agentes inteligentes (OpenAI, Gemini) a través de nuestras API Tools (Function Calling).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Left Column - Docs */}
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Terminal size={20} className="text-light-blue" />
              Catálogo de Herramientas (AI Tools)
            </h3>
            <p className="text-slate-600 mb-6">
              Estas rutas deben configurarse como funciones dentro de tu agente IA. Al llamarlas, el agente puede interactuar con la base de datos de manera autónoma.
            </p>

            <ApiCard 
              method="GET"
              colorClass="bg-blue-500"
              endpoint="/api/ai/debtors/{id}"
              description="Obtiene toda la información de un deudor específico (saldo, mora, datos de contacto). La IA debe llamar esto antes de iniciar una negociación para tener contexto."
            />

            <ApiCard 
              method="GET"
              colorClass="bg-blue-500"
              endpoint="/api/ai/debtors/{id}/rules"
              description="Obtiene las reglas dinámicas de negociación. Le indica a la IA el porcentaje máximo de descuento y número de cuotas permitidas según la mora del cliente."
            />

            <ApiCard 
              method="POST"
              colorClass="bg-green-500"
              endpoint="/api/ai/debtors/{id}/payment-link"
              description="Genera un enlace de pago (Stripe/MercadoPago). La IA puede solicitar la generación de un enlace para enviarlo al deudor durante el chat."
              payload={{
                amount: 50000,
                description: "Pago parcial de deuda atrasada"
              }}
            />

            <ApiCard 
              method="POST"
              colorClass="bg-green-500"
              endpoint="/api/ai/debtors/{id}/payments"
              description="Registra una promesa de pago. Si la IA logra que el cliente acepte abonar una cantidad, usa esta ruta para asentarlo."
              payload={{
                amount: 50000,
                date: "2026-08-15"
              }}
            />

            <ApiCard 
              method="POST"
              colorClass="bg-blue-400"
              endpoint="/api/ai/debtors/{id}/chat"
              description="Espejea el mensaje de la IA. La IA DEBE llamar esta ruta cada vez que le responde al deudor, para que los administradores humanos puedan leer sus mensajes en la Bitácora."
              payload={{
                message: "Hola, claro que podemos ayudarte. Te ofrezco un descuento del 10% si pagas hoy."
              }}
            />

            <ApiCard 
              method="POST"
              colorClass="bg-green-500"
              endpoint="/api/ai/debtors/{id}/interactions"
              description="Guarda el registro (log) de la conversación. La IA DEBE llamar a este endpoint al finalizar cada chat o llamada para dejar constancia humana en el CRM."
              payload={{
                type: "Chatbot",
                notes: "El cliente solicitó descuento, se negoció pago completo para la quincena.",
                promise_date: "2026-08-15"
              }}
            />
            
            <ApiCard 
              method="POST"
              colorClass="bg-purple-500"
              endpoint="/api/ai/notifications/email"
              description="Envía notificaciones de correo. Si el canal principal falla, la IA puede pedirle al sistema que envíe un correo oficial."
              payload={{
                debtor_id: 123,
                template: "payment_reminder"
              }}
            />
          </section>
        </div>

        {/* Right Column - Auth & Info */}
        <div className="space-y-6">
          <div className="glass-card p-6 border border-slate-200/60 bg-gradient-to-br from-white to-slate-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <ShieldCheck size={20} className="text-green-500" />
              Autenticación (M2M)
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Las rutas del prefijo <code className="bg-slate-200 px-1 rounded">/api/ai/*</code> están protegidas mediante Bearer Tokens de Laravel Sanctum. No utilizan cookies de sesión.
            </p>
            
            <div className="bg-slate-900 rounded-lg p-4 mb-4">
              <div className="text-xs text-slate-400 mb-2">Generar Token (Consola Server)</div>
              <code className="text-sm text-green-400 font-mono">
                php artisan ai:create-token
              </code>
            </div>

            <div className="bg-slate-900 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-2">Header HTTP requerido</div>
              <code className="text-sm text-yellow-300 font-mono break-words">
                Authorization: Bearer 1|T9xQ...
              </code>
            </div>
          </div>

          <div className="glass-card p-6 border border-slate-200/60">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Code2 size={20} className="text-light-purple" />
              Flujo Recomendado
            </h3>
            <ul className="text-sm text-slate-600 space-y-3">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0">1</span>
                <span>La IA recibe el ID del deudor a contactar.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0">2</span>
                <span>Ejecuta <code>get_debtor_info(id)</code> para cargar contexto.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0">3</span>
                <span>Negocia con el cliente vía LLM.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 shrink-0">4</span>
                <span>Si hay acuerdo, ejecuta <code>register_payment(id, amount)</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 shrink-0">5</span>
                <span>Al terminar, ejecuta <code>log_interaction(id)</code>.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIIntegration;

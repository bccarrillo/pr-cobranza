<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Debtor;

class AIToolController extends Controller
{
    /**
     * AI Tool: Busca el ID interno de un deudor usando su número de identificación
     */
    public function searchDebtor(Request $request)
    {
        $identification = $request->query('identification');
        
        if (!$identification) {
            return response()->json(['error' => 'El parámetro identification es requerido'], 400);
        }

        // TODO: [SEGURIDAD - DEUDA TÉCNICA MVP]
        // Se deshabilitó el Global Scope 'tenant_id' para permitir que un solo Bot atienda a todas las empresas.
        // Para escalar a B2B real (Un Bot/Token por Empresa), eliminar "withoutGlobalScope('tenant_id')"
        $debtor = Debtor::withoutGlobalScope('tenant_id')->where('identification', $identification)->first();

        if (!$debtor) {
            return response()->json(['error' => 'No se encontró ningún deudor con esa identificación'], 404);
        }

        return response()->json([
            'id' => $debtor->id,
            'identification' => $debtor->identification,
            'full_name' => $debtor->full_name,
            'total_debt' => $debtor->total_debt,
            'current_balance' => $debtor->current_balance,
            'due_date' => $debtor->due_date ? $debtor->due_date->format('Y-m-d') : null,
            'message' => 'Usa este ID (' . $debtor->id . ') para ejecutar las demás herramientas.'
        ]);
    }

    /**
     * AI Tool: Busca el ID interno de un deudor usando su token único o su correo (vía POST body)
     */
    public function searchDebtorByToken(Request $request)
    {
        $token = $request->input('token');
        $email = $request->input('email');

        if (!$token && !$email) {
            return response()->json(['error' => 'Debe enviar el parámetro token o email en el body (JSON)'], 400);
        }

        // TODO: [SEGURIDAD - DEUDA TÉCNICA MVP]
        // Para aislar datos por empresa, eliminar "withoutGlobalScope('tenant_id')"
        $query = Debtor::withoutGlobalScope('tenant_id');
        
        if ($token) {
            $query->where('d_token', $token);
        } else {
            $query->where('email', $email);
        }

        $debtor = $query->first();

        if (!$debtor) {
            return response()->json(['error' => 'No se encontró ningún deudor con esos datos'], 404);
        }

        return response()->json([
            'id' => $debtor->id,
            'd_token' => $debtor->d_token,
            'identification' => $debtor->identification,
            'full_name' => $debtor->full_name,
            'total_debt' => $debtor->total_debt,
            'current_balance' => $debtor->current_balance,
            'due_date' => $debtor->due_date ? $debtor->due_date->format('Y-m-d') : null,
            'message' => 'Usa este ID (' . $debtor->id . ') para ejecutar las demás herramientas.'
        ]);
    }

    /**
     * AI Tool: Obtiene las reglas de negociación permitidas para un deudor
     */
    public function getRules($id)
    {
        // TODO: [SEGURIDAD - DEUDA TÉCNICA MVP]
        // Eliminar "withoutGlobalScope" en producción B2B
        $debtor = Debtor::withoutGlobalScope('tenant_id')->findOrFail($id);
        
        $rules = [
            'debtor_id' => $debtor->id,
            'days_overdue' => $debtor->days_overdue,
            'status' => $debtor->status,
        ];

        // Buscar regla aplicable en la base de datos
        $rule = \App\Models\NegotiationRule::where('tenant_id', $debtor->tenant_id)
            ->where('min_days', '<=', $debtor->days_overdue)
            ->where('max_days', '>=', $debtor->days_overdue)
            ->first();

        if ($rule) {
            $rules['max_discount_percentage'] = floatval($rule->max_discount_percentage);
            $rules['allowed_installments'] = $rule->allowed_installments;
            $rules['strategy'] = $rule->strategy_name;
            $rules['message'] = $rule->ai_message_prompt;
        } else {
            // Regla de contingencia por si no hay reglas configuradas para este tenant
            $rules['max_discount_percentage'] = 0;
            $rules['allowed_installments'] = 1;
            $rules['strategy'] = 'contingency_no_discount';
            $rules['message'] = 'No hay reglas configuradas. Solicita el pago total y no ofrezcas descuentos.';
        }

        return response()->json($rules);
    }

    /**
     * AI Tool: Genera un link de pago simulado
     */
    public function generatePaymentLink(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'description' => 'nullable|string'
        ]);

        // TODO: [SEGURIDAD - DEUDA TÉCNICA MVP]
        // Eliminar "withoutGlobalScope" en producción B2B
        $debtor = Debtor::withoutGlobalScope('tenant_id')->findOrFail($id);

        // Simulamos la generación de un link de Stripe o MercadoPago
        // NOTA: Este código fue forzado a actualizarse para limpiar el OPCache del VPS.
        $paymentId = uniqid('pay_');
        $amount = $request->input('amount');
        
        return response()->json([
            'payment_id' => $paymentId,
            'debtor_id' => $debtor->id,
            'amount' => $amount,
            'payment_url' => "https://pr-cobranza.nation-ai.tech/checkout/{$paymentId}?amount={$amount}&debtor_id={$debtor->id}&debtor_token={$debtor->d_token}",
            'expires_at' => now()->addHours(24)->toDateTimeString(),
            'message' => 'Enlace generado exitosamente. Envíalo al deudor.'
        ]);
    }
    /**
     * AI Tool: El agente de IA responde al chat
     */
    public function sendChatMessage(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $debtor = Debtor::withoutGlobalScope('tenant_id')->findOrFail($id);

        // Si el bot está pausado (un humano tomó el control), la IA no debería estar enviando mensajes,
        // pero por si acaso, podemos rechazar la petición o aceptarla pero advertir.
        if ($debtor->bot_paused) {
            return response()->json([
                'error' => 'Bot is currently paused by a human agent.',
                'bot_paused' => true
            ], 403);
        }

        $message = $debtor->chatMessages()->create([
            'sender' => 'bot',
            'message' => $request->message
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Chat message saved successfully.',
            'data' => $message
        ]);
    }
}

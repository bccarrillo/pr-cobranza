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

        $debtor = Debtor::where('identification', $identification)->first();

        if (!$debtor) {
            return response()->json(['error' => 'No se encontró ningún deudor con esa identificación'], 404);
        }

        return response()->json([
            'id' => $debtor->id,
            'identification' => $debtor->identification,
            'full_name' => $debtor->full_name,
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

        $query = Debtor::query();
        
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
            'message' => 'Usa este ID (' . $debtor->id . ') para ejecutar las demás herramientas.'
        ]);
    }

    /**
     * AI Tool: Obtiene las reglas de negociación permitidas para un deudor
     */
    public function getRules($id)
    {
        $debtor = Debtor::findOrFail($id);
        
        $rules = [
            'debtor_id' => $debtor->id,
            'days_overdue' => $debtor->days_overdue,
            'status' => $debtor->status,
        ];

        // Reglas de negocio dinámicas para la IA
        if ($debtor->days_overdue <= 0) {
            $rules['max_discount_percentage'] = 0;
            $rules['allowed_installments'] = 1;
            $rules['strategy'] = 'preventive_reminder';
            $rules['message'] = 'Recordar amablemente la fecha de pago próxima. No ofrecer descuentos.';
        } elseif ($debtor->days_overdue > 0 && $debtor->days_overdue <= 30) {
            $rules['max_discount_percentage'] = 5;
            $rules['allowed_installments'] = 2;
            $rules['strategy'] = 'early_collection';
            $rules['message'] = 'Ofrecer acuerdo rápido. Máximo 5% de descuento solo si paga de inmediato.';
        } elseif ($debtor->days_overdue > 30 && $debtor->days_overdue <= 90) {
            $rules['max_discount_percentage'] = 15;
            $rules['allowed_installments'] = 3;
            $rules['strategy'] = 'medium_collection';
            $rules['message'] = 'Buscar regularización. Puede ofrecer pago en 3 cuotas o hasta 15% de descuento en pago único.';
        } else {
            $rules['max_discount_percentage'] = 30;
            $rules['allowed_installments'] = 6;
            $rules['strategy'] = 'late_collection_aggressive';
            $rules['message'] = 'Última instancia antes de cobro jurídico. Ofrecer máximo descuento (30%) o hasta 6 cuotas.';
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

        $debtor = Debtor::findOrFail($id);

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

        $debtor = Debtor::findOrFail($id);

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

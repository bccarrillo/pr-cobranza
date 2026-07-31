<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Debtor;

class AIToolController extends Controller
{
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
        $paymentId = uniqid('pay_');
        $amount = $request->input('amount');
        
        return response()->json([
            'payment_id' => $paymentId,
            'debtor_id' => $debtor->id,
            'amount' => $amount,
            'payment_url' => "https://checkout.pr-cobranza.com/pay/{$paymentId}?amount={$amount}",
            'expires_at' => now()->addHours(24)->toDateTimeString(),
            'message' => 'Enlace generado exitosamente. Envíalo al deudor.'
        ]);
    }
}

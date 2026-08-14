<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Jobs\SendNotificationEmailJob;
use Illuminate\Support\Facades\Mail;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function sendEmail(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'debtor_name' => 'nullable|string|max:255',
            'amount' => 'nullable|numeric',
            'invoice_number' => 'nullable|string|max:50',
            'date' => 'nullable|date',
        ]);

        $invoiceData = [
            'debtor_name' => $validated['debtor_name'] ?? 'Cliente',
            'amount' => $validated['amount'] ?? 0,
            'invoice_number' => $validated['invoice_number'] ?? 'INV-' . time(),
            'date' => $validated['date'] ?? now()->format('Y-m-d'),
            'message' => $validated['message'],
        ];

        SendNotificationEmailJob::dispatch($validated['email'], $validated['subject'], $invoiceData);

        return response()->json(['message' => 'Email notification queued successfully']);
    }

    /**
     * Test SMTP configuration by sending a raw email.
     */
    public function testEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        try {
            Mail::raw('¡Felicidades! Este es un mensaje de prueba desde PR Cobranza. Si estás leyendo esto, significa que tu servidor SMTP está configurado correctamente y listo para enviar correos de campañas.', function ($message) use ($request) {
                $message->to($request->email)
                        ->subject('Prueba SMTP Exitosa - PR Cobranza');
            });

            return response()->json(['message' => 'Correo de prueba enviado con éxito a ' . $request->email]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error SMTP: ' . $e->getMessage()], 500);
        }
    }
}

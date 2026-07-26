<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Jobs\SendNotificationEmailJob;

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
}

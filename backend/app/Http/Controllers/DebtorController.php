<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Debtor;
use App\Jobs\SendNotificationEmailJob;

class DebtorController extends Controller
{
    public function index(Request $request)
    {
        $debtors = Debtor::orderBy('id', 'desc')->paginate(15);
        return response()->json($debtors);
    }

    public function search(Request $request)
    {
        $q = $request->query('q');
        
        if (!$q) {
            return response()->json([]);
        }
        
        $debtors = Debtor::where('identification', 'ilike', "%{$q}%")
            ->orWhere('full_name', 'ilike', "%{$q}%")
            ->limit(10)
            ->get();
            
        return response()->json($debtors);
    }

    public function show(string $id)
    {
        $debtor = Debtor::findOrFail($id);
        
        return response()->json([
            'id' => $debtor->id,
            'identification' => $debtor->identification,
            'full_name' => $debtor->full_name,
            'financials' => [
                'total_debt' => $debtor->total_debt,
                'current_balance' => $debtor->current_balance,
            ],
            'status' => $debtor->status,
            'custom_details' => $debtor->extra_data,
        ]);
    }

    public function status(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|string'
        ]);
        
        $debtor = Debtor::findOrFail($id);
        $debtor->update(['status' => $request->status]);
        
        return response()->json(['message' => 'Status updated successfully', 'debtor' => $debtor]);
    }

    public function payment(Request $request, string $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'date' => 'nullable|date'
        ]);

        $debtor = Debtor::findOrFail($id);
        
        $newBalance = max(0, $debtor->current_balance - $request->amount);
        $debtor->update([
            'current_balance' => $newBalance,
            'status' => $newBalance == 0 ? 'paid' : 'in_negotiation'
        ]);
        
        $email = $debtor->extra_data['email'] ?? null;

        if ($email) {
            $invoiceData = [
                'debtor_name' => $debtor->full_name,
                'amount' => $request->amount,
                'invoice_number' => 'ABONO-' . time(),
                'date' => $request->date ?? now()->format('Y-m-d'),
                'message' => "Hemos procesado tu abono de $" . number_format($request->amount, 2) . " exitosamente. Tu saldo pendiente actualizado es de $" . number_format($newBalance, 2),
            ];
            
            SendNotificationEmailJob::dispatch($email, 'Confirmación de Abono - PR Cobranza', $invoiceData);
        }
        
        return response()->json([
            'message' => 'Payment registered successfully and email queued (if available)', 
            'current_balance' => $debtor->current_balance
        ]);
    }
}

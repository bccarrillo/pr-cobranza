<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Debtor;
use App\Models\Payment;
use App\Jobs\SendNotificationEmailJob;

class DebtorController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->query('tenant_id');
        if (!$tenantId) {
            return response()->json(['data' => [], 'total' => 0]); // Retornar vacío si no hay tenant
        }

        $debtors = Debtor::where('tenant_id', $tenantId)->orderBy('id', 'desc')->paginate(15);
        return response()->json($debtors);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'identification' => 'required|string',
            'full_name' => 'required|string',
            'total_debt' => 'required|numeric',
            'email' => 'nullable|email',
            'phone' => 'nullable|string'
        ]);

        $debtor = Debtor::create([
            'tenant_id' => $request->tenant_id,
            'identification' => $request->identification,
            'full_name' => $request->full_name,
            'total_debt' => $request->total_debt,
            'current_balance' => $request->total_debt,
            'email' => $request->email,
            'phone' => $request->phone,
            'status' => 'pending',
            'due_date' => now()->toDateString(),
            'batch_id' => \Illuminate\Support\Str::uuid()->toString()
        ]);

        return response()->json($debtor, 201);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'identification' => 'required|string',
            'full_name' => 'required|string',
            'total_debt' => 'required|numeric',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'due_date' => 'nullable|date'
        ]);

        $debtor = Debtor::findOrFail($id);
        $debtor->update([
            'identification' => $request->identification,
            'full_name' => $request->full_name,
            'total_debt' => $request->total_debt,
            'email' => $request->email,
            'phone' => $request->phone,
            'due_date' => $request->due_date ?? $debtor->due_date
        ]);

        return response()->json($debtor);
    }

    public function export(Request $request)
    {
        $tenantId = $request->query('tenant_id');
        
        return response()->streamDownload(function () use ($tenantId) {
            $query = Debtor::query();
            if ($tenantId) {
                $query->where('tenant_id', $tenantId);
            }
            $debtors = $query->get();
            $handle = fopen('php://output', 'w');
            
            fputcsv($handle, ['ID', 'Identificacion', 'Nombre Completo', 'Deuda Total', 'Balance Actual', 'Email', 'Telefono', 'Estado', 'Dias Mora']);

            foreach ($debtors as $row) {
                fputcsv($handle, [
                    $row->id,
                    $row->identification,
                    $row->full_name,
                    $row->total_debt,
                    $row->current_balance,
                    $row->email,
                    $row->phone,
                    $row->status,
                    $row->days_overdue
                ]);
            }
            fclose($handle);
        }, 'cartera_export.csv', ['Content-Type' => 'text/csv']);
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
            'date' => 'nullable|date',
            'payment_method' => 'nullable|string',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        $debtor = Debtor::findOrFail($id);
        
        // Registrar en la nueva tabla de historial
        $payment = Payment::create([
            'tenant_id' => $debtor->tenant_id,
            'debtor_id' => $debtor->id,
            'amount' => $request->amount,
            'payment_date' => $request->date ?? now()->toDateString(),
            'payment_method' => $request->payment_method ?? 'Transferencia / Link IA',
            'reference_number' => $request->reference_number,
            'notes' => $request->notes,
        ]);
        
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
                'invoice_number' => 'ABONO-' . $payment->id, // Usamos el ID del pago
                'date' => $payment->payment_date,
                'message' => "Hemos procesado tu abono de $" . number_format($request->amount, 2) . " exitosamente. Tu saldo pendiente actualizado es de $" . number_format($newBalance, 2),
            ];
            
            SendNotificationEmailJob::dispatch($email, 'Confirmación de Abono - PR Cobranza', $invoiceData);
        }
        
        return response()->json([
            'message' => 'Payment registered successfully and email queued (if available)', 
            'current_balance' => $debtor->current_balance,
            'payment_id' => $payment->id
        ]);
    }

    public function getPayments(string $id)
    {
        $debtor = Debtor::findOrFail($id);
        $payments = $debtor->payments()->orderBy('payment_date', 'desc')->orderBy('id', 'desc')->get();
        return response()->json($payments);
    }
}

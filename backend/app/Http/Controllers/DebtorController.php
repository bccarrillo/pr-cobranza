<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Debtor;

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
        
        return response()->json([
            'message' => 'Payment registered successfully', 
            'current_balance' => $debtor->current_balance
        ]);
    }
}

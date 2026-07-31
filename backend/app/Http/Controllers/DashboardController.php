<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Debtor;

class DashboardController extends Controller
{
    public function getStats()
    {
        // Los deudores ya están filtrados por el scope del Tenant en el modelo
        $totalDebt = Debtor::sum('total_debt') ?? 0;
        
        // Simular o calcular el monto recuperado (para este PoC usamos el current_balance vs total_debt)
        $currentBalanceTotal = Debtor::sum('current_balance') ?? 0;
        $recovered = $totalDebt - $currentBalanceTotal;

        $activeDebtorsCount = Debtor::count();

        $highRiskDebt = Debtor::where('days_overdue', '>', 90)->sum('current_balance') ?? 0;

        return response()->json([
            'total_debt' => $totalDebt,
            'recovered' => $recovered,
            'active_debtors' => $activeDebtorsCount,
            'high_risk_debt' => $highRiskDebt
        ]);
    }
}

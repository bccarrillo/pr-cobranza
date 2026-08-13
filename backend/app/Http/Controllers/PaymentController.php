<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use Illuminate\Support\Carbon;

class PaymentController extends Controller
{
    private function applyFilters($query, Request $request)
    {
        $tenantId = $request->query('tenant_id');
        $q = $request->query('q');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        if ($dateFrom) {
            $query->whereDate('payment_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('payment_date', '<=', $dateTo);
        }

        if ($q) {
            $query->whereHas('debtor', function($qBuilder) use ($q) {
                $qBuilder->where('full_name', 'ilike', "%{$q}%")
                         ->orWhere('identification', 'ilike', "%{$q}%");
            });
        }

        return $query;
    }

    public function index(Request $request)
    {
        if (!$request->query('tenant_id')) {
            return response()->json(['data' => [], 'total' => 0]);
        }

        $query = Payment::with('debtor');
        $query = $this->applyFilters($query, $request);

        $payments = $query->orderBy('payment_date', 'desc')->orderBy('id', 'desc')->paginate(15);
        
        return response()->json($payments);
    }

    public function export(Request $request)
    {
        $tenantId = $request->query('tenant_id');
        
        return response()->streamDownload(function () use ($request) {
            $query = Payment::with('debtor');
            $query = $this->applyFilters($query, $request);
            
            $payments = $query->get();
            $handle = fopen('php://output', 'w');
            
            // BOM for Excel UTF-8 reading
            fputs($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($handle, ['ID Pago', 'Deudor', 'Identificacion', 'Monto', 'Fecha', 'Metodo', 'Referencia', 'Notas'], ';');

            foreach ($payments as $payment) {
                fputcsv($handle, [
                    $payment->id,
                    $payment->debtor ? $payment->debtor->full_name : 'N/A',
                    $payment->debtor ? $payment->debtor->identification : 'N/A',
                    $payment->amount,
                    $payment->payment_date,
                    $payment->payment_method,
                    $payment->reference_number,
                    $payment->notes
                ], ';');
            }
            fclose($handle);
        }, 'reporte_pagos.csv', ['Content-Type' => 'text/csv']);
    }
}

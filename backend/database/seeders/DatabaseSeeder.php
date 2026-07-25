<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Debtor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Debtor::create([
            'identification' => '1234567890',
            'full_name' => 'Carlos Cliente',
            'total_debt' => 2500000.50,
            'current_balance' => 2500000.50,
            'status' => 'pending',
            'batch_id' => Str::uuid()->toString(),
            'extra_data' => [
                'email' => 'carlos.cliente@example.com',
                'telefono' => '+573001234567',
                'ciudad' => 'Bogotá',
                'fecha_vencimiento' => '2026-08-15'
            ]
        ]);

        Debtor::create([
            'identification' => '0987654321',
            'full_name' => 'Maria Deudora',
            'total_debt' => 800000.00,
            'current_balance' => 800000.00,
            'status' => 'in_negotiation',
            'batch_id' => Str::uuid()->toString(),
            'extra_data' => [
                'email' => 'maria.d@example.com',
                'telefono' => '+573109876543',
                'ciudad' => 'Medellín',
                'ultima_llamada' => '2026-07-20'
            ]
        ]);
    }
}

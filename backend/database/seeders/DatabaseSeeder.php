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
        // 1. Crear el Tenant
        $tenant = \DB::table('tenants')->insertGetId([
            'name' => 'Empresa Cobranzas Demo',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Crear el Usuario Administrador
        $user = User::create([
            'name' => 'Admin Demo',
            'email' => 'admin@demo.com',
            'password' => bcrypt('password123'),
            'tenant_id' => $tenant,
        ]);

        // 3. Crear Deudores de prueba (con diferentes días de mora)
        Debtor::create([
            'tenant_id' => $tenant,
            'identification' => '1098765432',
            'full_name' => 'María Gómez (Preventivo)',
            'total_debt' => 1500.00,
            'current_balance' => 1500.00,
            'status' => 'pending',
            'due_date' => now()->addDays(2)->toDateString(), // -2 días (preventivo)
            'days_overdue' => -2,
            'phone' => '+573001112233',
            'email' => 'maria@example.com',
            'batch_id' => Str::uuid()->toString(),
        ]);

        Debtor::create([
            'tenant_id' => $tenant,
            'identification' => '987654321',
            'full_name' => 'Carlos Ruiz (Temprana)',
            'total_debt' => 3200.50,
            'current_balance' => 3200.50,
            'status' => 'pending',
            'due_date' => now()->subDays(15)->toDateString(), // 15 días (temprana)
            'days_overdue' => 15,
            'phone' => '+573004445566',
            'email' => 'carlos@example.com',
            'batch_id' => Str::uuid()->toString(),
        ]);

        Debtor::create([
            'tenant_id' => $tenant,
            'identification' => 'NIT-900123',
            'full_name' => 'Empresa ABC (Media)',
            'total_debt' => 15400.00,
            'current_balance' => 15400.00,
            'status' => 'pending',
            'due_date' => now()->subDays(45)->toDateString(), // 45 días (media)
            'days_overdue' => 45,
            'phone' => '+573007778899',
            'email' => 'abc@ejemplo.com',
            'batch_id' => Str::uuid()->toString(),
        ]);

        Debtor::create([
            'tenant_id' => $tenant,
            'identification' => '12345678',
            'full_name' => 'Luis Fernando (Tardía)',
            'total_debt' => 800.00,
            'current_balance' => 800.00,
            'status' => 'pending',
            'due_date' => now()->subDays(110)->toDateString(), // 110 días (tardía)
            'days_overdue' => 110,
            'phone' => '+573009990000',
            'email' => 'luis@ejemplo.com',
            'batch_id' => Str::uuid()->toString(),
        ]);
    }
}

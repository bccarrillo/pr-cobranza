<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('negotiation_rules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->integer('min_days')->default(0)->comment('Días de mora mínimos del rango');
            $table->integer('max_days')->default(30)->comment('Días de mora máximos del rango');
            $table->decimal('max_discount_percentage', 5, 2)->default(0.00)->comment('Descuento máximo en porcentaje');
            $table->integer('allowed_installments')->default(1)->comment('Número máximo de cuotas autorizadas');
            $table->string('strategy_name')->default('default')->comment('Nombre de la estrategia');
            $table->text('ai_message_prompt')->nullable()->comment('Instrucción adicional para la IA en este rango');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Poblar la tabla con las reglas default existentes para cada tenant
        $tenants = \Illuminate\Support\Facades\DB::table('tenants')->get();
        foreach ($tenants as $tenant) {
            $now = now();
            \Illuminate\Support\Facades\DB::table('negotiation_rules')->insert([
                'tenant_id' => $tenant->id,
                'min_days' => -999,
                'max_days' => 0,
                'max_discount_percentage' => 0,
                'allowed_installments' => 1,
                'strategy_name' => 'preventive_reminder',
                'ai_message_prompt' => 'Recordar amablemente la fecha de pago próxima. No ofrecer descuentos.',
                'created_at' => $now,
                'updated_at' => $now
            ]);
            \Illuminate\Support\Facades\DB::table('negotiation_rules')->insert([
                'tenant_id' => $tenant->id,
                'min_days' => 1,
                'max_days' => 30,
                'max_discount_percentage' => 5,
                'allowed_installments' => 2,
                'strategy_name' => 'early_collection',
                'ai_message_prompt' => 'Ofrecer acuerdo rápido. Máximo 5% de descuento solo si paga de inmediato.',
                'created_at' => $now,
                'updated_at' => $now
            ]);
            \Illuminate\Support\Facades\DB::table('negotiation_rules')->insert([
                'tenant_id' => $tenant->id,
                'min_days' => 31,
                'max_days' => 90,
                'max_discount_percentage' => 15,
                'allowed_installments' => 3,
                'strategy_name' => 'medium_collection',
                'ai_message_prompt' => 'Buscar regularización. Puede ofrecer pago en 3 cuotas o hasta 15% de descuento en pago único.',
                'created_at' => $now,
                'updated_at' => $now
            ]);
            \Illuminate\Support\Facades\DB::table('negotiation_rules')->insert([
                'tenant_id' => $tenant->id,
                'min_days' => 91,
                'max_days' => 9999,
                'max_discount_percentage' => 30,
                'allowed_installments' => 6,
                'strategy_name' => 'late_collection_aggressive',
                'ai_message_prompt' => 'Última instancia antes de cobro jurídico. Ofrecer máximo descuento (30%) o hasta 6 cuotas.',
                'created_at' => $now,
                'updated_at' => $now
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('negotiation_rules');
    }
};

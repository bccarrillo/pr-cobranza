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
        Schema::create('interaction_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debtor_id')->constrained()->cascadeOnDelete();
            $table->string('channel'); // WhatsApp, Voz, Email
            $table->string('outcome'); // Promesa de pago, Rechazo, Buzón de voz
            $table->text('summary')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interaction_logs');
    }
};

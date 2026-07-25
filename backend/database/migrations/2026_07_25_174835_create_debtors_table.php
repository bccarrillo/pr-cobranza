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
        Schema::create('debtors', function (Blueprint $table) {
            $table->id();
            $table->string('identification')->unique();
            $table->string('full_name')->index();
            $table->decimal('total_debt', 12, 2)->default(0);
            $table->decimal('current_balance', 12, 2)->default(0);
            $table->string('status')->default('pending');
            $table->string('batch_id')->nullable();
            $table->jsonb('extra_data')->nullable(); // Using jsonb for PostgreSQL efficiency
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debtors');
    }
};

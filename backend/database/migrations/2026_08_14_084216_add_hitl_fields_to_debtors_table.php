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
        Schema::table('debtors', function (Blueprint $table) {
            $table->boolean('bot_paused')->default(false)->after('due_date');
            $table->boolean('requires_human')->default(false)->after('bot_paused');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('debtors', function (Blueprint $table) {
            $table->dropColumn(['bot_paused', 'requires_human']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('debtors', function (Blueprint $table) {
            $table->string('d_token', 8)->nullable()->unique()->after('id');
        });

        // Poblar el d_token para todos los deudores existentes
        $debtors = DB::table('debtors')->whereNull('d_token')->get();
        foreach ($debtors as $debtor) {
            DB::table('debtors')->where('id', $debtor->id)->update([
                'd_token' => strtoupper(Str::random(8))
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('debtors', function (Blueprint $table) {
            $table->dropColumn('d_token');
        });
    }
};

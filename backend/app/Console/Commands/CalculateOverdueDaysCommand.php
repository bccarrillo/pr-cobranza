<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CalculateOverdueDaysCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collection:calculate-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculates overdue days for all debtors and updates their status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting calculation of overdue days...');

        // Process in chunks to avoid memory issues
        \App\Models\Debtor::where('current_balance', '>', 0)
            ->whereNotNull('due_date')
            ->withoutGlobalScopes() // Run for all tenants
            ->chunkById(500, function ($debtors) {
                foreach ($debtors as $debtor) {
                    $daysOverdue = now()->startOfDay()->diffInDays($debtor->due_date, false) * -1;
                    
                    // We only count days overdue, not future days (those would be negative)
                    $debtor->days_overdue = $daysOverdue;

                    // Decision Engine logic based on days_overdue
                    if ($daysOverdue < 0) {
                        $debtor->status = 'preventive';
                    } elseif ($daysOverdue >= 0 && $daysOverdue <= 30) {
                        $debtor->status = 'early_stage';
                    } elseif ($daysOverdue > 30 && $daysOverdue <= 90) {
                        $debtor->status = 'medium_stage';
                    } else {
                        $debtor->status = 'late_stage';
                    }

                    $debtor->save();
                }
            });

        $this->info('Calculation completed.');
    }
}

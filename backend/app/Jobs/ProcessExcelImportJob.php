<?php

namespace App\Jobs;

use App\Models\Debtor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Str;
use Spatie\SimpleExcel\SimpleExcelReader;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProcessExcelImportJob implements ShouldQueue
{
    use Queueable;

    protected $filePath;
    protected $batchId;

    /**
     * Create a new job instance.
     */
    public function __construct(string $filePath, string $batchId)
    {
        $this->filePath = $filePath;
        $this->batchId = $batchId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $absolutePath = Storage::disk('local')->path($this->filePath);
        
        if (!file_exists($absolutePath)) {
            Log::error("Excel file not found at: {$absolutePath}");
            return;
        }

        try {
            SimpleExcelReader::create($absolutePath)
                ->getRows()
                ->chunk(500)
                ->each(function ($rows) {
                    $debtorsData = [];
                    foreach ($rows as $row) {
                        $identification = $row['identification'] ?? $row['Cédula'] ?? $row['DNI'] ?? $row['cedula'] ?? null;
                        $fullName = $row['full_name'] ?? $row['Nombre'] ?? $row['nombre'] ?? null;
                        $totalDebt = $row['total_debt'] ?? $row['Deuda'] ?? $row['deuda'] ?? 0;
                        
                        if (!$identification) continue;

                        $extraData = $row;
                        unset($extraData['identification'], $extraData['Cédula'], $extraData['DNI'], $extraData['cedula']);
                        unset($extraData['full_name'], $extraData['Nombre'], $extraData['nombre']);
                        unset($extraData['total_debt'], $extraData['Deuda'], $extraData['deuda']);

                        $debtorsData[] = [
                            'identification' => (string) $identification,
                            'full_name' => $fullName,
                            'total_debt' => (float) $totalDebt,
                            'current_balance' => (float) $totalDebt,
                            'status' => 'pending',
                            'batch_id' => $this->batchId,
                            'extra_data' => json_encode($extraData),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }

                    if (count($debtorsData) > 0) {
                        Debtor::upsert($debtorsData, ['identification'], ['full_name', 'total_debt', 'current_balance', 'batch_id', 'extra_data', 'status', 'updated_at']);
                    }
                });
        } catch (\Exception $e) {
            Log::error("Error processing Excel: " . $e->getMessage());
        } finally {
            Storage::disk('local')->delete($this->filePath);
        }
    }
}

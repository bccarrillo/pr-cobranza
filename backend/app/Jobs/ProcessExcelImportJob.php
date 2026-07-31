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
    protected $tenantId;

    /**
     * Create a new job instance.
     */
    public function __construct(string $filePath, string $batchId, ?int $tenantId = null)
    {
        $this->filePath = $filePath;
        $this->batchId = $batchId;
        $this->tenantId = $tenantId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $rawPath = Storage::disk('local')->path($this->filePath);
        $absolutePath = str_replace(['\\', '/'], DIRECTORY_SEPARATOR, $rawPath);
        
        if (!file_exists($absolutePath)) {
            Log::error("Excel file not found at: {$absolutePath}");
            return;
        }

        try {
            $reader = SimpleExcelReader::create($absolutePath);
            
            // Verificamos si se puede leer. Si es un .xlsx pero por dentro es un CSV (texto plano),
            // ZipArchive lanzará una excepción. La atrapamos y forzamos lectura como CSV.
            try {
                $reader->getHeaders();
            } catch (\Exception $e) {
                Log::warning("Fallo al leer como formato original, intentando forzar como CSV. Error: " . $e->getMessage());
                $reader = SimpleExcelReader::create($absolutePath, 'csv');
            }

            $reader->getRows()
                ->chunk(500)
                ->each(function ($rows) {
                    $debtorsData = [];
                    foreach ($rows as $row) {
                        $identification = $row['identification'] ?? $row['Cédula'] ?? $row['DNI'] ?? $row['cedula'] ?? null;
                        $fullName = $row['full_name'] ?? $row['Nombre'] ?? $row['nombre'] ?? null;
                        $totalDebt = $row['total_debt'] ?? $row['Deuda'] ?? $row['deuda'] ?? 0;
                        $phone = $row['phone'] ?? $row['Teléfono'] ?? $row['telefono'] ?? null;
                        $email = $row['email'] ?? $row['Email'] ?? $row['correo'] ?? null;
                        $dueDate = $row['due_date'] ?? $row['Fecha Vencimiento'] ?? $row['fecha_vencimiento'] ?? clone now()->subDays(rand(1, 30)); 
                        
                        if (!$identification) continue;

                        $extraData = $row;
                        unset($extraData['identification'], $extraData['Cédula'], $extraData['DNI'], $extraData['cedula']);
                        unset($extraData['full_name'], $extraData['Nombre'], $extraData['nombre']);
                        unset($extraData['total_debt'], $extraData['Deuda'], $extraData['deuda']);
                        unset($extraData['phone'], $extraData['Teléfono'], $extraData['telefono']);
                        unset($extraData['email'], $extraData['Email'], $extraData['correo']);
                        unset($extraData['due_date'], $extraData['Fecha Vencimiento']);

                        $debtorsData[] = [
                            'tenant_id' => $this->tenantId,
                            'identification' => (string) $identification,
                            'full_name' => $fullName,
                            'total_debt' => (float) $totalDebt,
                            'current_balance' => (float) $totalDebt,
                            'phone' => $phone,
                            'email' => $email,
                            'due_date' => $dueDate,
                            'status' => 'pending',
                            'batch_id' => $this->batchId,
                            'extra_data' => json_encode($extraData),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }

                    if (count($debtorsData) > 0) {
                        Debtor::upsert($debtorsData, ['identification'], ['tenant_id', 'full_name', 'total_debt', 'current_balance', 'phone', 'email', 'due_date', 'batch_id', 'extra_data', 'status', 'updated_at']);
                    }
                });
        } catch (\Exception $e) {
            Log::error("Error processing Excel: " . $e->getMessage());
        } finally {
            Storage::disk('local')->delete($this->filePath);
        }
    }
}

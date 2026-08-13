<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Campaign;
use App\Models\Debtor;

class ProcessCampaigns extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'campaigns:process';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Procesa las automatizaciones activas y encola correos/mensajes.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando procesamiento de campañas...');

        // Solo buscar las campañas que estén activas
        $activeCampaigns = Campaign::where('is_active', true)->get();

        if ($activeCampaigns->isEmpty()) {
            $this->info('No hay campañas activas en este momento.');
            return;
        }

        foreach ($activeCampaigns as $campaign) {
            $this->info("Procesando campaña: {$campaign->name} (Tenant: {$campaign->tenant_id})");

            // 1. Calcular la fecha de vencimiento que estamos buscando hoy.
            $targetDate = now()->addDays($campaign->days_offset)->toDateString();
            
            $operator = '=';
            if ($campaign->condition_type === 'continuous') {
                $operator = $campaign->days_offset <= 0 ? '<=' : '>=';
            }

            $this->info("Buscando deudores con fecha de vencimiento {$operator} {$targetDate}");

            // 2. Buscar en la tabla Debtors los que cumplan la condición y tengan correo
            $query = Debtor::where('tenant_id', $campaign->tenant_id)
                           ->whereNotNull('email')
                           ->where('status', 'pending');

            if ($campaign->condition_type === 'continuous') {
                if ($campaign->days_offset <= 0) {
                    // Atrasos: Buscar todos los que tengan esta fecha o sean MÁS antiguos (mayor atraso)
                    $query->whereDate('due_date', '<=', $targetDate);
                } else {
                    // Preventivos: Buscar todos los que venzan en esta fecha o después
                    $query->whereDate('due_date', '>=', $targetDate);
                }
            } else {
                // Exacto: Solo los que coinciden con el día calculado
                $query->whereDate('due_date', '=', $targetDate);
            }

            $debtors = $query->get();

            if ($debtors->isEmpty()) {
                $this->info("No se encontraron deudores para esta campaña hoy.");
                continue;
            }

            $this->info("Encontrados {$debtors->count()} deudores. Encolando mensajes...");

            // 3. Despachar un Job para que se envíe el correo/mensaje en segundo plano.
            foreach ($debtors as $debtor) {
                \App\Jobs\SendCampaignEmailJob::dispatch($campaign, $debtor);
            }
            
            $this->info("Mensajes encolados correctamente.");
        }

        $this->info('Procesamiento de campañas finalizado exitosamente.');
    }
}

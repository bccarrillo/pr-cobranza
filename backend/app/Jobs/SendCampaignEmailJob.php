<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\Debtor;
use App\Models\Campaign;
use App\Mail\CampaignMailable;

class SendCampaignEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $campaign;
    public $debtor;

    /**
     * Create a new job instance.
     */
    public function __construct(Campaign $campaign, Debtor $debtor)
    {
        $this->campaign = $campaign;
        $this->debtor = $debtor;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if (!$this->debtor->email) {
            Log::info("No se puede enviar campaña al deudor {$this->debtor->id} porque no tiene email.");
            return;
        }

        try {
            Mail::to($this->debtor->email)->send(new CampaignMailable($this->debtor, $this->campaign));
            
            Log::info("Campaña '{$this->campaign->name}' enviada a {$this->debtor->email}");
            
            // Aquí podríamos guardar en interaction_logs que se envió un correo automatizado
        } catch (\Exception $e) {
            Log::error("Error enviando campaña a {$this->debtor->email}: " . $e->getMessage());
        }
    }
}

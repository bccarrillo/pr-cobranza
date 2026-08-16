<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Debtor;
use App\Models\Campaign;

class CampaignMailable extends Mailable
{
    use Queueable, SerializesModels;

    public $debtor;
    public $campaign;
    public $parsedMessage;

    /**
     * Create a new message instance.
     */
    public function __construct(Debtor $debtor, Campaign $campaign)
    {
        $this->debtor = $debtor;
        $this->campaign = $campaign;
        
        // El FRONTEND_URL se puede configurar en el .env, si no existe usa la de producción
        $frontendUrl = env('FRONTEND_URL', 'https://pr-cobranza.nation-ai.tech');
        $magicLink = $frontendUrl . '/portal/' . $this->debtor->d_token;

        // Parse dynamic variables
        $this->parsedMessage = str_replace(
            [
                '{nombre}', '{deuda}', 
                '[Nombre del Cliente]', '[Monto de la Deuda]', '[Fecha de Vencimiento]',
                '[https://URL_DE_TU_LANDING_PAGE_AQUI]', 'https://url_de_tu_landing_page_aqui/',
                '[Enlace al Asistente]'
            ],
            [
                $debtor->full_name, '$' . number_format($debtor->current_balance, 2),
                $debtor->full_name, number_format($debtor->current_balance, 2), $debtor->due_date,
                $magicLink, $magicLink,
                $magicLink
            ],
            $campaign->message_template
        );
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Notificación Importante: ' . $this->campaign->name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: $this->parsedMessage
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

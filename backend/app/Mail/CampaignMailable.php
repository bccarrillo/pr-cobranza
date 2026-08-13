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
        
        // Parse dynamic variables
        $this->parsedMessage = str_replace(
            ['{nombre}', '{deuda}'],
            [$debtor->full_name, '$' . number_format($debtor->current_balance, 2)],
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
            htmlString: nl2br(e($this->parsedMessage))
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

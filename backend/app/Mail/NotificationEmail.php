<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class NotificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $invoiceData;
    public $subjectString;

    /**
     * Create a new message instance.
     */
    public function __construct($subjectString, $invoiceData)
    {
        $this->subjectString = $subjectString;
        $this->invoiceData = $invoiceData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectString,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.notification',
            with: [
                'invoiceData' => $this->invoiceData,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        $pdf = Pdf::loadView('pdf.invoice', $this->invoiceData);
        
        return [
            Attachment::fromData(fn () => $pdf->output(), 'Estado_de_Cuenta.pdf')
                    ->withMime('application/pdf'),
        ];
    }
}

<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use App\Mail\NotificationEmail;

class SendNotificationEmailJob implements ShouldQueue
{
    use Queueable;

    public $email;
    public $subject;
    public $invoiceData;

    /**
     * Create a new job instance.
     */
    public function __construct($email, $subject, $invoiceData)
    {
        $this->email = $email;
        $this->subject = $subject;
        $this->invoiceData = $invoiceData;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Mail::to($this->email)->send(new NotificationEmail($this->subject, $this->invoiceData));
    }
}

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
    public $subjectString;
    public $messageBody;

    /**
     * Create a new job instance.
     */
    public function __construct($email, $subjectString, $messageBody)
    {
        $this->email = $email;
        $this->subjectString = $subjectString;
        $this->messageBody = $messageBody;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Mail::to($this->email)->send(new NotificationEmail($this->subjectString, $this->messageBody));
    }
}

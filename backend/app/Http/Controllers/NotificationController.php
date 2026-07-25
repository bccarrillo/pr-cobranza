<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Jobs\SendNotificationEmailJob;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function sendEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        SendNotificationEmailJob::dispatch($request->email, $request->subject, $request->message);

        return response()->json(['message' => 'Email notification queued successfully']);
    }
}

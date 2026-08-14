<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Debtor;
use App\Models\ChatMessage;
use Illuminate\Support\Facades\DB;

class InboxController extends Controller
{
    /**
     * Get a list of debtors that have chat messages.
     * Orders them by 'requires_human' (descending) and last message timestamp.
     */
    public function getDebtors(Request $request)
    {
        // For a specific tenant if requested
        $tenantId = $request->query('tenant_id');

        $query = Debtor::whereHas('chatMessages')
            ->with(['chatMessages' => function ($query) {
                $query->latest()->limit(1); // Include only the last message for the preview
            }]);

        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        // We want to sort by requires_human first, then by the latest chat message created_at
        // Using a subquery for sorting by latest message is complex, 
        // so we can sort them in PHP collection for MVP, or use an orderByRaw.
        $debtors = $query->get()->sortByDesc(function ($debtor) {
            $lastMessage = $debtor->chatMessages->first();
            $timestamp = $lastMessage ? $lastMessage->created_at->timestamp : 0;
            // requires_human gets priority
            $priority = $debtor->requires_human ? 10000000000 : 0;
            return $priority + $timestamp;
        })->values();

        // Transform for the frontend
        $result = $debtors->map(function ($debtor) {
            $lastMessage = $debtor->chatMessages->first();
            return [
                'id' => $debtor->id,
                'name' => $debtor->full_name,
                'email' => $debtor->email,
                'phone' => $debtor->phone,
                'current_balance' => $debtor->current_balance,
                'requires_human' => $debtor->requires_human,
                'bot_paused' => $debtor->bot_paused,
                'last_message' => $lastMessage ? $lastMessage->message : '',
                'last_message_time' => $lastMessage ? $lastMessage->created_at : null,
                'unread_count' => 0 // To be implemented if needed
            ];
        });

        return response()->json($result);
    }

    /**
     * Get the full chat history for a specific debtor.
     */
    public function getMessages($id)
    {
        $debtor = Debtor::findOrFail($id);
        
        $messages = $debtor->chatMessages()->orderBy('created_at', 'asc')->get();

        // Optional: mark all as read here
        // ChatMessage::where('debtor_id', $id)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json([
            'debtor' => [
                'id' => $debtor->id,
                'name' => $debtor->full_name,
                'requires_human' => $debtor->requires_human,
                'bot_paused' => $debtor->bot_paused,
            ],
            'messages' => $messages
        ]);
    }

    /**
     * The human agent sends a reply. This auto-pauses the bot.
     */
    public function sendMessage(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $debtor = Debtor::findOrFail($id);

        // Auto pause the bot since a human intervened
        if (!$debtor->bot_paused) {
            $debtor->update(['bot_paused' => true, 'requires_human' => false]);
        } else if ($debtor->requires_human) {
            // Also clear the requires_human flag if they just replied
            $debtor->update(['requires_human' => false]);
        }

        $message = $debtor->chatMessages()->create([
            'sender' => 'agent',
            'message' => $request->message,
            'read_at' => now(), // Already read by the agent
        ]);

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $message,
            'bot_paused' => $debtor->bot_paused
        ]);
    }

    /**
     * Toggle the bot_paused status manually.
     */
    public function toggleBot(Request $request, $id)
    {
        $request->validate([
            'bot_paused' => 'required|boolean'
        ]);

        $debtor = Debtor::findOrFail($id);
        $debtor->update([
            'bot_paused' => $request->bot_paused,
            'requires_human' => false // If toggling bot, reset distress signal
        ]);

        return response()->json([
            'message' => 'Bot status updated',
            'bot_paused' => $debtor->bot_paused
        ]);
    }
}

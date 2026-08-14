<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\Multitenantable;

class Debtor extends Model
{
    use Multitenantable;

    protected $guarded = [];

    protected $casts = [
        'extra_data' => 'array',
        'total_debt' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'due_date' => 'date',
        'bot_paused' => 'boolean',
        'requires_human' => 'boolean',
        'metadata' => 'array',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function interactionLogs()
    {
        return $this->hasMany(InteractionLog::class);
    }

    public function chatMessages()
    {
        return $this->hasMany(ChatMessage::class);
    }
}

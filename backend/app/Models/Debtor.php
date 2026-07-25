<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Debtor extends Model
{
    protected $guarded = [];

    protected $casts = [
        'extra_data' => 'array',
        'total_debt' => 'decimal:2',
        'current_balance' => 'decimal:2',
    ];

    public function interactionLogs()
    {
        return $this->hasMany(InteractionLog::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InteractionLog extends Model
{
    protected $guarded = [];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function debtor()
    {
        return $this->belongsTo(Debtor::class);
    }
}

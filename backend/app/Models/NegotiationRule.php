<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Multitenantable;

class NegotiationRule extends Model
{
    use HasFactory, Multitenantable;

    protected $fillable = [
        'tenant_id',
        'min_days',
        'max_days',
        'max_discount_percentage',
        'allowed_installments',
        'strategy_name',
        'ai_message_prompt',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}

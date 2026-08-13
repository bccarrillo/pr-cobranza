<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'days_offset',
        'condition_type',
        'message_template',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}

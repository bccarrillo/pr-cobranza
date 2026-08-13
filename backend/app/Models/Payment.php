<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'tenant_id',
        'debtor_id',
        'amount',
        'payment_date',
        'payment_method',
        'reference_number',
        'notes'
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function debtor()
    {
        return $this->belongsTo(Debtor::class);
    }
}

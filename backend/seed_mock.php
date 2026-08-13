<?php

$d = App\Models\Debtor::first();
if($d) {
    $d->interactionLogs()->create([
        'channel' => 'whatsapp',
        'outcome' => 'promise_to_pay',
        'summary' => 'El cliente indica que pagará el viernes en la tarde mediante transferencia.',
        'metadata' => [
            'transcript' => "AI: Hola, tiene un saldo pendiente.\nClient: Si, pagaré el viernes.\nAI: Excelente, lo anotaré como promesa."
        ]
    ]);
    
    $d->interactionLogs()->create([
        'channel' => 'email',
        'outcome' => 'notification_sent',
        'summary' => 'Se envió el estado de cuenta y recordatorio de vencimiento automático.',
        'metadata' => [
            'transcript' => 'Notificación Preventiva 3 Días enviada.'
        ]
    ]);
    
    $d->interactionLogs()->create([
        'channel' => 'call',
        'outcome' => 'requires_human',
        'summary' => 'Cliente molesto, solicita hablar con un gerente por un cobro indebido.',
        'metadata' => [
            'transcript' => "Client: ¡No voy a pagar nada, quiero hablar con un humano!\nAI: Entiendo su molestia. Transferiré el caso inmediatamente."
        ]
    ]);
    
    $d->update(['status' => 'requires_human']);
    echo "Mock data created for debtor ID: " . $d->id . "\n";
} else {
    echo "No debtors found.\n";
}

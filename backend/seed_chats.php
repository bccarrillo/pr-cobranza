<?php
$d1 = App\Models\Debtor::find(1); 
if($d1) { 
    $d1->chatMessages()->create(['sender' => 'user', 'message' => 'Hola, me llegó un correo de que tengo una deuda.', 'created_at' => now()->subMinutes(30)]); 
    $d1->chatMessages()->create(['sender' => 'bot', 'message' => 'Hola ' . $d1->full_name . '. Sí, tienes un saldo pendiente de $' . number_format($d1->current_balance, 2) . '. ¿Deseas acordar un plan de pagos?', 'created_at' => now()->subMinutes(29)]); 
    $d1->chatMessages()->create(['sender' => 'user', 'message' => 'No tengo el dinero completo ahorita. ¡Quiero hablar con un humano por favor!', 'created_at' => now()->subMinutes(2)]); 
    $d1->update(['requires_human' => true]); 
} 

$d2 = App\Models\Debtor::find(2); 
if($d2) { 
    $d2->chatMessages()->create(['sender' => 'user', 'message' => 'Hola, quiero saber donde deposito el pago.', 'created_at' => now()->subMinutes(5)]); 
    $d2->chatMessages()->create(['sender' => 'bot', 'message' => 'Hola ' . $d2->full_name . '. Puedes depositar en la cuenta de ahorros No. 12345.', 'created_at' => now()->subMinutes(4)]); 
}
echo "Seed success!";

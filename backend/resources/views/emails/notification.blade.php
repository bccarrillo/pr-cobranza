<x-mail::message>
# Notificación del Sistema de Cobranza

{{ $messageBody }}

<x-mail::button :url="''">
Ingresar al Portal
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>

<x-mail::message>
# Hola {{ $invoiceData['debtor_name'] }},

{{ $invoiceData['message'] }}

<x-mail::panel>
**Detalle de su cuenta:**
- **Monto:** ${{ number_format((float)$invoiceData['amount'], 2) }}
- **Fecha:** {{ $invoiceData['date'] }}
</x-mail::panel>

Le hemos adjuntado un estado de cuenta detallado en PDF para sus registros.

<x-mail::button :url="''" color="primary">
Ingresar al Portal de Pagos
</x-mail::button>

Saludos cordiales,<br>
{{ config('app.name') }}
</x-mail::message>

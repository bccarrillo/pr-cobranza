<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Estado de Cuenta</title>
    <style>
        body {
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #333;
            font-size: 14px;
            line-height: 1.5;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            margin: 0;
            color: #2c3e50;
        }
        .details-table {
            width: 100%;
            margin-bottom: 20px;
        }
        .details-table td {
            padding: 5px;
            vertical-align: top;
        }
        .invoice-details {
            text-align: right;
        }
        .items-table {
            width: 100%;
            line-height: inherit;
            text-align: left;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .items-table th {
            background: #eee;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
            padding: 10px;
        }
        .items-table td {
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
        .total-row td {
            border-top: 2px solid #333;
            font-weight: bold;
            font-size: 16px;
        }
        .footer-message {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="header">
            <h1>Estado de Cuenta</h1>
        </div>
        
        <table class="details-table">
            <tr>
                <td>
                    <strong>Cliente:</strong><br>
                    {{ $debtor_name }}
                </td>
                <td class="invoice-details">
                    <strong>Factura #:</strong> {{ $invoice_number }}<br>
                    <strong>Fecha:</strong> {{ $date }}
                </td>
            </tr>
        </table>

        <div style="margin-top: 20px; margin-bottom: 30px;">
            <p>{{ $message }}</p>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Descripción</th>
                    <th style="text-align: right;">Monto</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Saldo pendiente de pago</td>
                    <td style="text-align: right;">${{ number_format((float)$amount, 2) }}</td>
                </tr>
                <tr class="total-row">
                    <td style="text-align: right;">Total Adeudado:</td>
                    <td style="text-align: right;">${{ number_format((float)$amount, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <div class="footer-message">
            Si tiene alguna duda sobre este estado de cuenta, por favor contáctenos.<br>
            Gracias por su atención.
        </div>
    </div>
</body>
</html>

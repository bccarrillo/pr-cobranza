<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ImportController;
use App\Http\Controllers\DebtorController;
use App\Http\Controllers\InteractionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CampaignController;

use App\Http\Controllers\AIToolController;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\UserController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rutas de Uso Interno (Frontend)
Route::prefix('v1')->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    
    Route::apiResource('tenants', TenantController::class);
    Route::apiResource('users', UserController::class);
    
    // Automatizaciones (Campañas)
    Route::get('/campaigns', [CampaignController::class, 'index']);
    Route::post('/campaigns', [CampaignController::class, 'store']);
    Route::put('/campaigns/{id}', [CampaignController::class, 'update']);
    Route::delete('/campaigns/{id}', [CampaignController::class, 'destroy']);
    Route::patch('/campaigns/{id}/toggle', [CampaignController::class, 'toggle']);

    Route::post('/imports', [ImportController::class, 'store']);
    
    Route::get('/payments/export', [PaymentController::class, 'export']);
    Route::get('/payments', [PaymentController::class, 'index']);
    
    Route::get('/debtors/export', [DebtorController::class, 'export']);
    Route::get('/debtors', [DebtorController::class, 'index']);
    Route::post('/debtors', [DebtorController::class, 'store']);
    Route::get('/debtors/{id}', [DebtorController::class, 'show']);
    Route::put('/debtors/{id}', [DebtorController::class, 'update']);
    Route::get('/debtors/search', [DebtorController::class, 'search']);
    Route::get('/debtors/token/{token}', [DebtorController::class, 'getByToken']);
    Route::post('/chat/messages/{debtorId}', function (Illuminate\Http\Request $request, $debtorId) {
        $request->validate(['message' => 'required|string']);
        $debtor = App\Models\Debtor::findOrFail($debtorId);
        
        $message = $debtor->chatMessages()->create([
            'sender' => 'user',
            'message' => $request->message
        ]);
        
        // MVP: The AI agent should pick this up, but we just return success.
        return response()->json(['success' => true, 'data' => $message]);
    });
    
    // AI Integration routes (WIP - Not yet implemented in backend)
    // Route::get('/ai-integrations', [App\Http\Controllers\AIIntegrationController::class, 'index']);
    // Route::put('/ai-integrations/{id}', [App\Http\Controllers\AIIntegrationController::class, 'update']);
    // Route::post('/ai-integrations/test', [App\Http\Controllers\AIIntegrationController::class, 'testConnection']);

    // Inbox / HITL Routes
    Route::get('/inbox/debtors', [App\Http\Controllers\InboxController::class, 'getDebtors']);
    Route::get('/inbox/debtors/{id}/messages', [App\Http\Controllers\InboxController::class, 'getMessages']);
    Route::post('/inbox/debtors/{id}/messages', [App\Http\Controllers\InboxController::class, 'sendMessage']);
    Route::post('/inbox/debtors/{id}/toggle-bot', [App\Http\Controllers\InboxController::class, 'toggleBot']);
    Route::patch('/debtors/{id}/status', [DebtorController::class, 'updateStatus']);
    Route::get('/debtors/{id}/payments', [DebtorController::class, 'getPayments']);
    Route::post('/debtors/{id}/payments', [DebtorController::class, 'payment']);
    Route::get('/debtors/{id}/interactions', [InteractionController::class, 'index']);

    // Configuración
    Route::post('/settings/test-email', [NotificationController::class, 'testEmail']);
});

// Rutas de Herramientas de Inteligencia Artificial (M2M API)
Route::prefix('ai')->middleware('auth:sanctum')->group(function () {
    // Herramienta de Búsqueda (Se coloca arriba para no chocar con {id})
    Route::get('/debtors/search', [AIToolController::class, 'searchDebtor']);
    Route::get('/debtors/token/{token}', [AIToolController::class, 'searchDebtorByToken']);

    // Herramientas Nuevas Específicas
    Route::get('/debtors/{id}/rules', [AIToolController::class, 'getRules']);
    Route::post('/debtors/{id}/payment-link', [AIToolController::class, 'generatePaymentLink']);
    
    // Herramientas Existentes Compartidas
    Route::get('/debtors/{id}', [DebtorController::class, 'show']);
    Route::get('/debtors/{id}/payments', [DebtorController::class, 'getPayments']);
    Route::post('/debtors/{id}/payments', [DebtorController::class, 'payment']);
    Route::patch('/debtors/{id}/status', [DebtorController::class, 'status']);
    Route::post('/debtors/{id}/interactions', [InteractionController::class, 'store']);
    Route::post('/debtors/{id}/chat', [AIToolController::class, 'sendChatMessage']);
    Route::post('/notifications/email', [NotificationController::class, 'sendEmail']);
});

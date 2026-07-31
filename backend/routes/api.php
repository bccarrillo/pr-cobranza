<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ImportController;
use App\Http\Controllers\DebtorController;
use App\Http\Controllers\InteractionController;
use App\Http\Controllers\NotificationController;

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

    Route::post('/imports', [ImportController::class, 'store']);
    
    Route::get('/debtors', [DebtorController::class, 'index']);
    Route::get('/debtors/search', [DebtorController::class, 'search']);
    Route::get('/debtors/{id}', [DebtorController::class, 'show']);
    Route::patch('/debtors/{id}/status', [DebtorController::class, 'status']);
});

// Rutas de Herramientas de Inteligencia Artificial (M2M API)
Route::prefix('ai')->middleware('auth:sanctum')->group(function () {
    // Herramientas Nuevas Específicas
    Route::get('/debtors/{id}/rules', [AIToolController::class, 'getRules']);
    Route::post('/debtors/{id}/payment-link', [AIToolController::class, 'generatePaymentLink']);
    
    // Herramientas Existentes Compartidas
    Route::get('/debtors/{id}', [DebtorController::class, 'show']);
    Route::post('/debtors/{id}/payments', [DebtorController::class, 'payment']);
    Route::post('/debtors/{id}/interactions', [InteractionController::class, 'store']);
    Route::post('/notifications/email', [NotificationController::class, 'sendEmail']);
});

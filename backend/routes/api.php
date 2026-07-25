<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ImportController;
use App\Http\Controllers\DebtorController;
use App\Http\Controllers\InteractionController;
use App\Http\Controllers\NotificationController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {
    Route::post('/imports', [ImportController::class, 'store']);
    
    Route::get('/debtors', [DebtorController::class, 'index']);
    Route::get('/debtors/search', [DebtorController::class, 'search']);
    Route::get('/debtors/{id}', [DebtorController::class, 'show']);
    Route::patch('/debtors/{id}/status', [DebtorController::class, 'status']);
    Route::post('/debtors/{id}/payments', [DebtorController::class, 'payment']);
    Route::post('/debtors/{id}/interactions', [InteractionController::class, 'store']);
    
    Route::post('/notifications/email', [NotificationController::class, 'sendEmail']);
});

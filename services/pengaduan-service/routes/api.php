<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PengaduanController;
use App\Http\Controllers\DisposisiController;
use App\Http\Controllers\RatingController;

// semua route butuh JWT
Route::middleware('jwt.auth')->group(function () {

    // pengaduan
    Route::get('/pengaduan', [PengaduanController::class, 'index']);
    Route::post('/pengaduan', [PengaduanController::class, 'store']);
    Route::get('/pengaduan/{id}', [PengaduanController::class, 'show']);
    Route::patch('/pengaduan/{id}/status', [PengaduanController::class, 'updateStatus']);
    Route::delete('/pengaduan/{id}', [PengaduanController::class, 'destroy']);

    // disposisi
    Route::post('/pengaduan/{id}/disposisi', [DisposisiController::class, 'store']);
    Route::patch('/disposisi/{id}', [DisposisiController::class, 'updateStatus']);

    // rating
    Route::post('/pengaduan/{id}/rating', [RatingController::class, 'store']);

});

// health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'service' => 'pengaduan-service']);
});
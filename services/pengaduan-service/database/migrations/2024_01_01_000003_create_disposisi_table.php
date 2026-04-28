<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disposisi', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pengaduan_id');
            $table->unsignedBigInteger('unit_id');
            $table->text('catatan')->nullable();
            $table->enum('status_disposisi', ['diterima', 'diproses', 'selesai'])->default('diterima');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('pengaduan_id')->references('id')->on('pengaduan')->onDelete('cascade');
            $table->foreign('unit_id')->references('id')->on('unit_terkait');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disposisi');
    }
};

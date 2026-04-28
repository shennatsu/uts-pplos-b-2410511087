<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rating_kepuasan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pengaduan_id')->unique();
            $table->unsignedBigInteger('user_id');
            $table->tinyInteger('nilai');
            $table->text('komentar')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('pengaduan_id')->references('id')->on('pengaduan')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rating_kepuasan');
    }
};

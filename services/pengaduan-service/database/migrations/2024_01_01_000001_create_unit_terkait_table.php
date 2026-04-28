<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('unit_terkait', function (Blueprint $table) {
            $table->id();
            $table->string('nama_unit', 255);
            $table->text('deskripsi')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // seed data default
        DB::table('unit_terkait')->insert([
            ['nama_unit' => 'Akademik', 'deskripsi' => 'Menangani pengaduan terkait akademik'],
            ['nama_unit' => 'Kemahasiswaan', 'deskripsi' => 'Menangani pengaduan non-akademik'],
            ['nama_unit' => 'IT Support', 'deskripsi' => 'Menangani pengaduan sistem informasi'],
            ['nama_unit' => 'Keuangan', 'deskripsi' => 'Menangani pengaduan keuangan mahasiswa'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('unit_terkait');
    }
};

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengaduan extends Model
{
    protected $table = 'pengaduan';

    protected $fillable = [
        'user_id',
        'judul',
        'deskripsi',
        'kategori',
        'status'
    ];

    // relasi ke disposisi
    public function disposisi()
    {
        return $this->hasMany(Disposisi::class, 'pengaduan_id');
    }

    // relasi ke rating
    public function rating()
    {
        return $this->hasOne(RatingKepuasan::class, 'pengaduan_id');
    }
}
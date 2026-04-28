<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RatingKepuasan extends Model
{
    protected $table = 'rating_kepuasan';
    public $timestamps = false;

    protected $fillable = [
        'pengaduan_id',
        'user_id',
        'nilai',
        'komentar'
    ];

    public function pengaduan()
    {
        return $this->belongsTo(Pengaduan::class, 'pengaduan_id');
    }
}
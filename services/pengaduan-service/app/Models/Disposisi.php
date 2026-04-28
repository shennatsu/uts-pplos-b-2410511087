<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Disposisi extends Model
{
    protected $table = 'disposisi';
    public $timestamps = false;

    protected $fillable = [
        'pengaduan_id',
        'unit_id',
        'catatan',
        'status_disposisi'
    ];

    public function unit()
    {
        return $this->belongsTo(UnitTerkait::class, 'unit_id');
    }

    public function pengaduan()
    {
        return $this->belongsTo(Pengaduan::class, 'pengaduan_id');
    }
}
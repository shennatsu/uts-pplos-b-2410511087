<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnitTerkait extends Model
{
    protected $table = 'unit_terkait';
    public $timestamps = false;

    protected $fillable = ['nama_unit', 'deskripsi'];
}
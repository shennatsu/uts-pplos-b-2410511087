<?php

namespace App\Http\Controllers;

use App\Models\RatingKepuasan;
use App\Models\Pengaduan;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    // POST /pengaduan/{id}/rating
    public function store(Request $request, $pengaduanId)
    {
        $request->validate([
            'nilai'   => 'required|integer|min:1|max:5',
            'komentar' => 'nullable|string'
        ]);

        $pengaduan = Pengaduan::find($pengaduanId);
        if (!$pengaduan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        // cek sudah dirating belum
        $existing = RatingKepuasan::where('pengaduan_id', $pengaduanId)->first();
        if ($existing) {
            return response()->json(['message' => 'Pengaduan ini sudah diberi rating'], 409);
        }

        $authUser = $request->auth_user;

        $rating = RatingKepuasan::create([
            'pengaduan_id' => $pengaduanId,
            'user_id'      => $authUser['id'],
            'nilai'        => $request->nilai,
            'komentar'     => $request->komentar
        ]);

        return response()->json([
            'message' => 'Rating berhasil disimpan',
            'data'    => $rating
        ], 201);
    }
}
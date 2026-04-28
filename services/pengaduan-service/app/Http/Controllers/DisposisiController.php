<?php

namespace App\Http\Controllers;

use App\Models\Disposisi;
use App\Models\Pengaduan;
use Illuminate\Http\Request;

class DisposisiController extends Controller
{
    // POST /pengaduan/{id}/disposisi — admin disposisi ke unit
    public function store(Request $request, $pengaduanId)
    {
        $request->validate([
            'unit_id' => 'required|exists:unit_terkait,id',
            'catatan' => 'nullable|string'
        ]);

        $pengaduan = Pengaduan::find($pengaduanId);
        if (!$pengaduan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        $disposisi = Disposisi::create([
            'pengaduan_id'    => $pengaduanId,
            'unit_id'         => $request->unit_id,
            'catatan'         => $request->catatan,
            'status_disposisi' => 'diterima'
        ]);

        // update status pengaduan jadi in_progress
        $pengaduan->update(['status' => 'in_progress']);

        return response()->json([
            'message' => 'Disposisi berhasil dibuat',
            'data'    => $disposisi->load('unit')
        ], 201);
    }

    // PATCH /disposisi/{id} — unit update status disposisi
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status_disposisi' => 'required|in:diterima,diproses,selesai'
        ]);

        $disposisi = Disposisi::find($id);
        if (!$disposisi) {
            return response()->json(['message' => 'Disposisi tidak ditemukan'], 404);
        }

        $disposisi->update(['status_disposisi' => $request->status_disposisi]);

        return response()->json([
            'message' => 'Status disposisi diupdate',
            'data'    => $disposisi
        ]);
    }
}
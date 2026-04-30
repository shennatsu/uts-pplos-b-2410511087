<?php

namespace App\Http\Controllers;

use App\Models\Pengaduan;
use Illuminate\Http\Request;

class PengaduanController extends Controller
{
    // GET /pengaduan — list semua pengaduan dengan paging & filter
    public function index(Request $request)
    {
        $query = Pengaduan::query();

        // filter by kategori
        if ($request->has('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        // filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // filter by user (mahasiswa liat punya sendiri)
        $authUser = $request->auth_user;
        if ($authUser['role'] === 'mahasiswa') {
            $query->where('user_id', $authUser['id']);
        }

        $perPage = $request->get('per_page', 10);
        $data = $query->with(['disposisi.unit', 'rating'])
                      ->orderBy('created_at', 'desc')
                      ->paginate($perPage);

        return response()->json([
            'message' => 'OK',
            'data' => $data
        ]);
    }

    // GET /pengaduan/{id}
    public function show($id)
    {
        $pengaduan = Pengaduan::with(['disposisi.unit', 'rating'])->find($id);

        if (!$pengaduan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        return response()->json(['data' => $pengaduan]);
    }

    // POST /pengaduan
    public function store(Request $request)
    {
        $request->validate([
            'judul'     => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'kategori'  => 'required|in:akademik,non_akademik'
        ]);

        $authUser = $request->auth_user;

        $pengaduan = Pengaduan::create([
            'user_id'   => $authUser['id'],
            'judul'     => $request->judul,
            'deskripsi' => $request->deskripsi,
            'kategori'  => $request->kategori,
            'status'    => 'open'
        ]);

        // trigger notifikasi ke notifikasi-service
        $this->kirimNotifikasi($authUser['id'], 'Pengaduan Baru', 
            "Pengaduan '{$pengaduan->judul}' berhasil dibuat", 'pengaduan_baru');

        return response()->json([
            'message' => 'Pengaduan berhasil dibuat',
            'data'    => $pengaduan
        ], 201);
    }

    // PATCH /pengaduan/{id}/status — admin update status
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed'
        ]);

        $pengaduan = Pengaduan::find($id);
        if (!$pengaduan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        $pengaduan->update(['status' => $request->status]);

        // kasih tau user bahwa statusnya berubah
        $this->kirimNotifikasi($pengaduan->user_id, 'Status Pengaduan Diupdate',
            "Status pengaduan '{$pengaduan->judul}' menjadi {$request->status}", 'status_update');

        return response()->json([
            'message' => 'Status berhasil diupdate',
            'data'    => $pengaduan
        ]);
    }

    // DELETE /pengaduan/{id}
    public function destroy($id)
    {
        $pengaduan = Pengaduan::find($id);
        if (!$pengaduan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        $pengaduan->delete();
        return response()->json(['message' => 'Pengaduan berhasil dihapus'], 204);
    }

    private function kirimNotifikasi($userId, $judul, $pesan, $tipe)
{
    try {
        $client = new \GuzzleHttp\Client();
        $client->post(env('NOTIFIKASI_SERVICE_URL', 'http://localhost:3003') . '/notifikasi', [
            'json' => [
                'user_id' => $userId,
                'judul'   => $judul,
                'pesan'   => $pesan,
                'tipe'    => $tipe
            ],
            'headers' => [
                'x-internal-secret' => env('INTERNAL_SECRET')
            ],
            'timeout' => 3
        ]);
    } catch (\Exception $e) {
        \Log::warning('Notifikasi gagal: ' . $e->getMessage());
    }
}
}
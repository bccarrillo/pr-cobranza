<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TenantController extends Controller
{
    public function index()
    {
        $tenants = DB::table('tenants')->get();
        return response()->json($tenants);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $id = DB::table('tenants')->insertGetId([
            'name' => $request->name,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id, 'name' => $request->name], 201);
    }

    public function show(string $id)
    {
        $tenant = DB::table('tenants')->where('id', $id)->first();
        if (!$tenant) return response()->json(['message' => 'Not found'], 404);
        return response()->json($tenant);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        DB::table('tenants')->where('id', $id)->update([
            'name' => $request->name,
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Updated successfully']);
    }

    public function destroy(string $id)
    {
        DB::table('tenants')->where('id', $id)->delete();
        return response()->json(null, 204);
    }
}

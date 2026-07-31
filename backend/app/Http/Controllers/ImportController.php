<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Jobs\ProcessExcelImportJob;
use Illuminate\Support\Str;

class ImportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv,txt'
        ]);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        // Forzamos a que si la extensión original es csv, se guarde como csv
        $fileName = Str::uuid()->toString() . '.' . $extension;
        $path = $file->storeAs('imports', $fileName, 'local');
        
        $batchId = Str::uuid()->toString();
        $tenantId = auth()->user()->tenant_id ?? null;

        ProcessExcelImportJob::dispatch($path, $batchId, $tenantId);

        return response()->json([
            'message' => 'Import queued successfully',
            'batch_id' => $batchId
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

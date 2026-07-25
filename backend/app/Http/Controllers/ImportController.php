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
            'file' => 'required|file|mimes:xlsx,csv'
        ]);

        $file = $request->file('file');
        $path = $file->store('imports', 'local');
        $batchId = Str::uuid()->toString();

        ProcessExcelImportJob::dispatch($path, $batchId);

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

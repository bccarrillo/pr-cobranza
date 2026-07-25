<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Debtor;
use App\Models\InteractionLog;

class InteractionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function store(Request $request, string $id)
    {
        $request->validate([
            'channel' => 'required|string',
            'outcome' => 'required|string',
            'summary' => 'nullable|string',
            'metadata' => 'nullable|array'
        ]);

        $debtor = Debtor::findOrFail($id);
        
        $interaction = $debtor->interactionLogs()->create([
            'channel' => $request->channel,
            'outcome' => $request->outcome,
            'summary' => $request->summary,
            'metadata' => $request->metadata,
        ]);
        
        return response()->json([
            'message' => 'Interaction logged successfully',
            'interaction' => $interaction
        ]);
    }
}

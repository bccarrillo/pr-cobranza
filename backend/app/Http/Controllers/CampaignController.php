<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->query('tenant_id');
        
        if (!$tenantId) {
            return response()->json([]);
        }

        $campaigns = Campaign::where('tenant_id', $tenantId)->orderBy('id', 'desc')->get();
        
        return response()->json($campaigns);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'name' => 'required|string|max:255',
            'days_offset' => 'required|integer',
            'condition_type' => 'required|in:exact,continuous',
            'message_template' => 'required|string',
            'is_active' => 'boolean'
        ]);

        $campaign = Campaign::create($validated);

        return response()->json(['message' => 'Campaña creada exitosamente', 'campaign' => $campaign], 201);
    }

    public function update(Request $request, string $id)
    {
        $campaign = Campaign::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'days_offset' => 'sometimes|required|integer',
            'condition_type' => 'sometimes|required|in:exact,continuous',
            'message_template' => 'sometimes|required|string',
            'is_active' => 'boolean'
        ]);

        $campaign->update($validated);

        return response()->json(['message' => 'Campaña actualizada exitosamente', 'campaign' => $campaign]);
    }

    public function toggle(string $id)
    {
        $campaign = Campaign::findOrFail($id);
        $campaign->is_active = !$campaign->is_active;
        $campaign->save();

        return response()->json(['message' => 'Estado cambiado', 'is_active' => $campaign->is_active]);
    }

    public function destroy(string $id)
    {
        $campaign = Campaign::findOrFail($id);
        $campaign->delete();

        return response()->json(['message' => 'Campaña eliminada exitosamente']);
    }
}

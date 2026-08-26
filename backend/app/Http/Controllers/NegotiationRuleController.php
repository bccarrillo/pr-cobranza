<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NegotiationRule;

class NegotiationRuleController extends Controller
{
    public function index()
    {
        // El trait Multitenantable filtra automáticamente por tenant_id
        $rules = NegotiationRule::orderBy('min_days', 'asc')->get();
        return response()->json($rules);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'min_days' => 'required|integer',
            'max_days' => 'required|integer|gte:min_days',
            'max_discount_percentage' => 'required|numeric|min:0|max:100',
            'allowed_installments' => 'required|integer|min:1',
            'strategy_name' => 'required|string',
            'ai_message_prompt' => 'nullable|string',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;

        $rule = NegotiationRule::create($validated);
        return response()->json($rule, 201);
    }

    public function update(Request $request, $id)
    {
        $rule = NegotiationRule::findOrFail($id);

        $validated = $request->validate([
            'min_days' => 'required|integer',
            'max_days' => 'required|integer|gte:min_days',
            'max_discount_percentage' => 'required|numeric|min:0|max:100',
            'allowed_installments' => 'required|integer|min:1',
            'strategy_name' => 'required|string',
            'ai_message_prompt' => 'nullable|string',
        ]);

        $rule->update($validated);
        return response()->json($rule);
    }

    public function destroy($id)
    {
        $rule = NegotiationRule::findOrFail($id);
        $rule->delete();
        return response()->json(['message' => 'Rule deleted successfully']);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Interest;
use Illuminate\Http\Request;

class InterestController extends Controller
{
    public function index()
    {
        $interests = Interest::all();
        return view('interests.index', compact('interests'));
    }

    public function create()
    {
        return view('interests.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:interests,name',
            'status' => 'required|in:Active,Inactive',
        ]);

        $interest = Interest::create([
            'name' => $request->name,
            'status' => $request->status,
        ]);

        return redirect()->route('interest-index')->with('success', 'Interest added successfully.');
    }

    public function show($id)
    {
        $interest = Interest::findOrFail($id);
        return response()->json($interest);
    }

    public function edit($id)
    {
        $interest = Interest::findOrFail($id);
        return view('interests.edit', compact('interest'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|unique:interests,name,'.$id,
            'status' => 'required|in:Active,Inactive',
        ]);

        $interest = Interest::findOrFail($id);
        $interest->update([
            'name' => $request->name,
            'status' => $request->status,
        ]);

        return response()->json(['message' => 'Interest updated successfully', 'interest' => $interest]);
    }

    public function destroy($id)
    {
        Interest::findOrFail($id)->delete();
        return response()->json(['message' => 'Interest deleted successfully']);
    }

}

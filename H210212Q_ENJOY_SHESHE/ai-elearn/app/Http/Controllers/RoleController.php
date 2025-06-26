<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::all();

        return view('roles.index', compact('roles'));
    }
    public function create()
    {
        return view('roles.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles,name',
            'status' => 'required|in:Active,Inactive',
        ]);

        Role::create([
            'name' => $request->name,
            'status' => $request->status,
        ]);

        return redirect()->route('roles-index')->with('success', 'Role added successfully.');
    }

    public function edit($id)
    {
        $role = Role::findOrFail($id);
        return view('roles.edit', compact('role'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'role_name' => 'required|unique:roles,role_name,'.$id,
            'status' => 'required|in:Active,Inactive',
        ]);

        $role = Role::findOrFail($id);
        $role->update([
            'role_name' => $request->role_name,
            'status' => $request->status,
        ]);

        return response()->json(['message' => 'Role updated successfully', 'role' => $role]);
    }

    public function destroy($id)
    {
        Role::findOrFail($id)->delete();
        return response()->json(['message' => 'Role deleted successfully']);
    }
}

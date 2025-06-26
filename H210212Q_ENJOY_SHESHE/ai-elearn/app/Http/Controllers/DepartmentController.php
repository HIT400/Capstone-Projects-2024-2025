<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::all();
        return view('departments.index', compact('departments'));
    }

    public function create()
    {
        return view('departments.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:departments,name',
            'code' => 'required|unique:departments,code',
        ]);

        Department::create($request->all());

        return redirect('/departments/index')->with('success', 'Department added successfully.');
    }

    public function show($id)
    {
        $department = Department::findOrFail($id);
        return view('departments.show', compact('department'));
    }

    public function edit($id)
    {
        $department = Department::findOrFail($id);
        return view('departments.edit', compact('department'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|unique:departments,name,'.$id,
        ]);

        $department = Department::findOrFail($id);
        $department->update($request->all());

        return redirect('/departments')->with('success', 'Department updated successfully.');
    }

    public function destroy($id)
    {
        Department::findOrFail($id)->delete();
        return redirect('/departments')->with('success', 'Department deleted successfully.');
    }
}

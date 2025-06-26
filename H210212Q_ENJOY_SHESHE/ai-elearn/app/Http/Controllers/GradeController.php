<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function index()
    {
        $grades = Grade::all();
//        dd($grades);
        return view('grades.index', compact('grades'));
    }
    public function create()
    {
        return view('grades.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'grade_letter' => 'required|unique:grades,grade_letter',
            'min_score' => 'required|integer',
            'max_score' => 'required|integer'
        ]);

        Grade::create($request->all());

        return redirect('/grades/index')->with('success', 'Grade added successfully.');
    }

    public function show($id)
    {
        $grade = Grade::findOrFail($id);
        return view('grades.show', compact('grade'));
    }

    public function edit($id)
    {
        $grade = Grade::findOrFail($id);
        return view('grades.edit', compact('grade'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'grade_letter' => 'required|unique:grades,grade_letter,'.$id,
            'min_score' => 'required|integer',
            'max_score' => 'required|integer'
        ]);

        $grade = Grade::findOrFail($id);
        $grade->update($request->all());

        return redirect('/grades/index')->with('success', 'Grade updated successfully.');
    }

    public function destroy($id)
    {
        Grade::findOrFail($id)->delete();
        return redirect('/grades/index')->with('success', 'Grade deleted successfully.');
    }
}

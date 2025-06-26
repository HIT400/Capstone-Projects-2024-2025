<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\Quiz;
use App\Models\Result;
use App\Models\User;
use Illuminate\Http\Request;

class ResultController extends Controller
{
    public function index()
    {
        $results = Result::with(['user', 'quiz', 'grade'])->get();
        return response()->json($results);
    }

    public function create()
    {
        $users = User::all();
        $quizzes = Quiz::all();
        $grades = Grade::all();
        return view('results.create', compact('users', 'quizzes', 'grades'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'quiz_id' => 'required|exists:quizzes,id',
            'total_score' => 'required|integer|min:1',
            'score' => 'required|integer|min:0|max:'.$request->total_score,
            'grade_id' => 'required|exists:grades,id',
            'status' => 'required|in:Active,Inactive',
        ]);

        $result = Result::create($request->all());

        return response()->json(['message' => 'Result recorded successfully', 'result' => $result], 201);
    }

    public function show($id)
    {
        $result = Result::with(['user', 'quiz', 'grade'])->findOrFail($id);
        return response()->json($result);
    }

    public function edit($id)
    {
        $result = Result::findOrFail($id);
        $users = User::all();
        $quizzes = Quiz::all();
        $grades = Grade::all();
        return view('results.edit', compact('result', 'users', 'quizzes', 'grades'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'quiz_id' => 'required|exists:quizzes,id',
            'total_score' => 'required|integer|min:1',
            'score' => 'required|integer|min:0|max:'.$request->total_score,
            'grade_id' => 'required|exists:grades,id',
            'status' => 'required|in:Active,Inactive',
        ]);

        $result = Result::findOrFail($id);
        $result->update($request->all());

        return response()->json(['success','Result updated successfully', 'result' => $result]);
    }

    public function destroy($id)
    {
        Result::findOrFail($id)->delete();
        return response()->json(['success','Result deleted successfully']);
    }
}

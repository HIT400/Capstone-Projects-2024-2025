<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\Quiz;
use Illuminate\Http\Request;

class AnswerController extends Controller
{
    public function index()
    {
        $answers = Answer::with('quiz')->get();
        return response()->json($answers);
    }

    public function create()
    {
        $quizzes = Quiz::all();
        return view('answers.create', compact('quizzes'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'quiz_id' => 'required|exists:quizzes,id',
            'answer_text' => 'required',
            'is_correct' => 'required|boolean',
            'status' => 'required|in:Active,Inactive',
        ]);

        $answer = Answer::create($request->all());

        return response()->json(['message' => 'Answer created successfully', 'answer' => $answer], 201);
    }

    public function show($id)
    {
        $answer = Answer::with('quiz')->findOrFail($id);
        return response()->json($answer);
    }

    public function edit($id)
    {
        $answer = Answer::findOrFail($id);
        $quizzes = Quiz::all();
        return view('answers.edit', compact('answer', 'quizzes'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'quiz_id' => 'required|exists:quizzes,id',
            'answer_text' => 'required',
            'is_correct' => 'required|boolean',
            'status' => 'required|in:Active,Inactive',
        ]);

        $answer = Answer::findOrFail($id);
        $answer->update($request->all());

        return response()->json(['message' => 'Answer updated successfully', 'answer' => $answer]);
    }

    public function destroy($id)
    {
        Answer::findOrFail($id)->delete();
        return response()->json(['message' => 'Answer deleted successfully']);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\User;
use App\Models\Topic;
use App\Models\Answer;
use App\Models\Course;
use App\Models\Result;
use App\Models\Performance;
use Illuminate\Http\Request;

class PerformanceController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $results =Result::with(['quiz.topic', 'grade'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();
    
        return view('student.grades.index', compact('results'));
    }

    public function create()
    {
        $users = User::all();
        $courses = Course::all();
        $topics = Topic::all();
        $quizzes = Quiz::all();
        $answers = Answer::all();
        return view('performances.create', compact('users', 'courses', 'topics', 'quizzes', 'answers'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
            'topic_id' => 'required|exists:topics,id',
            'quiz_id' => 'required|exists:quizzes,id',
            'answer_id' => 'required|exists:answers,id',
            'is_correct' => 'required|boolean',
            'status' => 'required|in:Active,Inactive',
        ]);

        $performance = Performance::create($request->all());

        return response()->json(['message' => 'Performance recorded successfully', 'performance' => $performance], 201);
    }

    public function show($id)
    {
        $performance = Performance::with(['user', 'course', 'topic', 'quiz', 'answer'])->findOrFail($id);
        return response()->json($performance);
    }

    public function edit($id)
    {
        $performance = Performance::findOrFail($id);
        $users = User::all();
        $courses = Course::all();
        $topics = Topic::all();
        $quizzes = Quiz::all();
        $answers = Answer::all();
        return view('performances.edit', compact('performance', 'users', 'courses', 'topics', 'quizzes', 'answers'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
            'topic_id' => 'required|exists:topics,id',
            'quiz_id' => 'required|exists:quizzes,id',
            'answer_id' => 'required|exists:answers,id',
            'is_correct' => 'required|boolean',
            'status' => 'required|in:Active,Inactive',
        ]);

        $performance = Performance::findOrFail($id);
        $performance->update($request->all());

        return response()->json(['message' => 'Performance updated successfully', 'performance' => $performance]);
    }

    public function destroy($id)
    {
        Performance::findOrFail($id)->delete();
        return response()->json(['message' => 'Performance deleted successfully']);
    }

    public function showTopicsWithReports($courseId)
{
    $course =Course::with('topics.quizzes')->findOrFail($courseId);

    return view('student.course-topics', compact('course'));
}

public function studentCourses()
{
    $courses = auth()->user()->courses()->with('topics.quizzes')->get();

    return view('student.student-courses', compact('courses'));
}

}

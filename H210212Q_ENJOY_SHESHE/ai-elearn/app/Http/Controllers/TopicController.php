<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Topic;
use Illuminate\Http\Request;

class TopicController extends Controller
{
    public function index()
    {
        $courses = Course::with('department')->get();
        $topics = Topic::with('course.department')->paginate(10);
        return view('topics.index', compact('topics','courses'));
    }

    public function create()
    {
        $courses = Course::with('department')->get();
        return view('topics.create', compact('courses'));
    }

    public function store(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'course_id' => 'required|exists:courses,id',
            'status' => 'required|in:Active,Inactive',
        ]);

        // Create a new Topic
        Topic::create([
            'title' => $request->title,
            'description' => $request->description,
            'course_id' => $request->course_id,
            'status' => $request->status,
        ]);

        // Redirect with success message
        return redirect()->route('topic-index')->with('success', 'Topic created successfully.');
    }
    public function show($id)
    {
        $topic = Topic::with('contents')->findOrFail($id);
        return view('topics.show', compact('topic'));
    }

    public function edit($id)
    {
        $topic = Topic::findOrFail($id);
        $courses = Course::with('department')->get();
        return view('topics.edit', compact('topic', 'courses'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required',
            'description' => 'nullable',
            'course_id' => 'required|exists:courses,id',
        ]);

        $topic = Topic::findOrFail($id);
        $topic->update($request->all());

        return response()->json(['message' => 'Topic updated successfully', 'topic' => $topic]);
    }

    public function destroy($id)
    {
        Topic::findOrFail($id)->delete();
        return view('topics.index')->with('success', 'Course deleted successfully.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\Topic;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function index()
    {
        $contents = Content::with('topic.course.department')->get();
        return response()->json($contents);
    }

    public function create()
    {
        $topics = Topic::with('course.department')->get();
        return view('contents.create', compact('topics'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required',
            'description' => 'nullable',
            'topic_id' => 'required|exists:topics,id',
        ]);

        $content = Content::create($request->all());

        return response()->json(['message' => 'Content created successfully', 'content' => $content], 201);
    }

    public function show($id)
    {
        $content = Content::with('topic.course.department')->findOrFail($id);
        return response()->json($content);
    }

    public function edit($id)
    {
        $content = Content::findOrFail($id);
        $topics = Topic::with('course.department')->get();
        return view('contents.edit', compact('content', 'topics'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required',
            'description' => 'nullable',
            'topic_id' => 'required|exists:topics,id',
        ]);

        $content = Content::findOrFail($id);
        $content->update($request->all());

        return response()->json(['message' => 'Content updated successfully', 'content' => $content]);
    }

    public function destroy($id)
    {
        Content::findOrFail($id)->delete();
        return response()->json(['message' => 'Content deleted successfully']);
    }
}

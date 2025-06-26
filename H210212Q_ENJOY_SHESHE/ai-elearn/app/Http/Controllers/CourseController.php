<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Department;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index()
    {
        $departments = Department::all();
        $courses = Course::all();
        return view('courses.index', compact('courses','departments'));
    }

    public function create()
    {
        return view('courses.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:courses,code|max:50',
            'department_id' => 'nullable|exists:departments,id',
            'status' => 'required|in:Active,Inactive',
        ]);

        Course::create([
            'name' => $request->name,
            'code' => $request->code,
            'department_id' => $request->department_id,
            'status' => $request->status,
        ]);

        return redirect()->route('course-index')->with('success', 'Course created successfully.');
    }


    public function show($id)
    {
        $course = Course::with('topics')->findOrFail($id);
        return view('courses.show', compact('course'));
    }

    public function edit($id)
    {
        $course = Course::findOrFail($id);
        return view('courses.edit', compact('course'));
    }

    public function update(Request $request, $id)
    {

        // dd($request);
        $request->validate([
            'course_name' => 'nullable',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $course = Course::findOrFail($id);
        $course->update($request->all());

        return redirect('/courses/index')->with('success', 'Course updated successfully.');
    }

    public function destroy($id)
    {
        Course::findOrFail($id)->delete();
        return redirect('/courses/index')->with('success', 'Course deleted successfully.');
    }

    public function myCourses()
{
    $userCourses = auth()->user()->courses;
    return view('my-courses', compact('userCourses'));
}


public function enrollCourse(Course $course)
{
    if (auth()->user()->courses->contains($course)) {
        return redirect()->route('my-courses')->with('error', 'You are already enrolled in this course.');
    }

    auth()->user()->courses()->attach($course->id, [
        'status' => 'Active',
    ]);

    return redirect()->route('my-courses')->with('success', 'You have successfully enrolled in the course!');
}

}

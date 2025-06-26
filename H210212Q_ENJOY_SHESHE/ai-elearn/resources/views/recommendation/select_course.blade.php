@extends('layouts.app')

@section('content')
<div class="container">
    <h2 class="text-2xl font-bold mb-4">Recommended Course</h2>

    <div class="mb-4 p-4 rounded 
    {{ $recommendedCourse === 'Course not found' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700' }}">
    
    @if($recommendedCourse !== 'Course not found')
        <p><strong>We recommend you:</strong> {{ $recommendedCourse }}</p>
    @else
        <p>No course matched your interest. Please try again with different keywords.</p>
    @endif
</div>

    @if($recommendedCourse !== 'Course not found')
        <form method="POST" action="{{ route('courses.enroll') }}">
            @csrf
            <div class="mb-4">
                <label for="course" class="block mb-2 font-semibold">Select a Course to Enroll:</label>
                <select name="course_id" id="course" class="border rounded w-full p-2">
                    @foreach ($courses as $course)
                        <option value="{{ $course->id }}"
                            {{ $course->name == $recommendedCourse ? 'selected' : '' }}>
                            {{ $course->name }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="flex justify-end mt-4">
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Enroll
                </button>
            </div>
        </form>
    @else
        <p class="text-gray-600">Please try entering a different interest.</p>
    @endif
</div>
@endsection

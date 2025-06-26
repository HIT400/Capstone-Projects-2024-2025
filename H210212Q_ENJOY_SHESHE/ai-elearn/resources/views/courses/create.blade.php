@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Recommended Course</h1>

    @if ($recommendedCourse)
        <div class="bg-green-100 text-green-800 p-4 rounded-md shadow mb-6">
            <p class="text-lg font-medium">We recommend you: <span class="font-semibold">{{ $recommendedCourse }}</span></p>
        </div>
    @endif

    @if ($courses->count() > 0)
        <form action="{{ route('courses.enroll') }}" method="POST" class="bg-white p-6 rounded-md shadow-md">
            @csrf

            div>
            <label for="course" class="block text-sm font-medium text-gray-200">Select a Course to Enroll</label>
            <select name="course_id" id="course" 
                class="block w-full mt-2 p-2 bg-white/10 border border-gray-300 text-white placeholder-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                required>
                @foreach ($courses as $course)
                    <option value="{{ $course->id }}"
                        {{ $course->title == $recommendedCourse ? 'selected' : '' }}>
                        {{ $course->title }}
                    </option>
                @endforeach
            </select>
        </div>
        
        <div class="mt-6">
            <button type="submit" 
                class="px-6 py-2 bg-blue-600/80 hover:bg-blue-700 text-white font-semibold rounded-md backdrop-blur-md">
                Enroll
            </button>
        </div>
        </form>
    @else
        <div class="bg-red-100 text-red-800 p-4 rounded-md shadow">
            <p>No courses available to enroll at the moment.</p>
        </div>
    @endif
</div>
@endsection

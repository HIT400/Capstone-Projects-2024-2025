@extends('layouts.app')

@section('content')
<div class="p-6">
    <h2 class="text-2xl font-bold mb-6">My Courses</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @forelse ($courses as $course)
            <div class="border p-4 rounded shadow hover:shadow-lg transition">
                <h3 class="text-lg font-semibold mb-2">{{ $course->name }}</h3>
                <a href="{{ route('student-report', $course->id) }}" 
                    class="inline-block bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded">
                     View Topics & Reports →
                 </a>
            </div>
        @empty
            <p class="text-gray-600 col-span-full">You are not enrolled in any courses.</p>
        @endforelse
    </div>
</div>
@endsection

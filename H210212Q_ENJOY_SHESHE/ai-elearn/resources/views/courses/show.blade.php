@extends('layouts.app')

@section('content')
<div class="p-6">
    <h2 class="text-2xl font-bold mb-4">{{ $course->name }} - Topics</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @php
            $previousPassed = true;
        @endphp

        @forelse($course->topics->sortBy('order') as $topic)
            @php
                $canAccess = $previousPassed;
                $performance = \App\Models\Performance::where('user_id', auth()->id())
                                ->where('topic_id', $topic->id)
                                ->first();
                $previousPassed = $performance && $performance->last_score >= 75;
            @endphp

            @if($canAccess)
                <a href="{{ route('topic-show', $topic->id) }}" class="block p-4 bg-white rounded shadow hover:bg-gray-100">
                    <h3 class="text-lg font-semibold">{{ $topic->title }}</h3>
                    <p class="text-sm text-gray-600">{{ $topic->description }}</p>
                </a>
            @else
                <div class="block p-4 bg-gray-200 rounded shadow cursor-not-allowed opacity-60">
                    <h3 class="text-lg font-semibold text-gray-500">{{ $topic->title }} 🔒</h3>
                    <p class="text-sm text-gray-500">{{ $topic->description }}</p>
                    <p class="text-xs text-red-500 mt-2">Complete the previous topic with at least 75% to unlock.</p>
                </div>
            @endif
        @empty
            <p>No topics available for this course.</p>
        @endforelse
    </div>
</div>
@endsection

@extends('layouts.app')

@section('content')
<div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Your Course Topics</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        @foreach ($courses as $course)
            <div class="border p-4 rounded shadow bg-white">
                <h3 class="text-xl font-semibold mb-2">{{ $course->name }}</h3>
    
                @php
                    $previousPassed = true;
                @endphp
    
                @foreach ($course->topics->sortBy('order') as $topic)
                    @php
                        $canAccess = $previousPassed;
                        $performance = \App\Models\Performance::where('user_id', auth()->id())
                                        ->where('topic_id', $topic->id)
                                        ->first();
    
                        $score = $performance->last_score ?? 0;
                        $barColor = $score >= 75 ? 'bg-green-500' : ($score >= 50 ? 'bg-yellow-400' : 'bg-red-500');
    
                        $previousPassed = $score >= 75;
                    @endphp
    
                    <div class="mb-3">
                        {{-- Topic Access --}}
                        @if ($canAccess)
                            <a href="{{ route('quiz-show', $topic->id) }}" 
                               class="block text-blue-600 hover:underline text-sm">
                                📘 {{ $topic->title }}
                            </a>
                        @else
                            <div class="text-gray-500 text-sm cursor-not-allowed opacity-60">
                                🔒 {{ $topic->title }}
                                <span class="text-xs text-red-500 ml-1">(Locked)</span>
                            </div>
                        @endif
    
                        {{-- Progress Bar --}}
                        <div class="w-full bg-gray-200 rounded h-2 mt-1">
                            <div class="{{ $barColor }} h-2 rounded transition-all duration-300" style="width: {{ $score }}%;"></div>
                        </div>
                        <p class="text-xs text-gray-600">Progress: {{ $score }}%</p>
                    </div>
                @endforeach
            </div>
        @endforeach
    </div>
</div>
@endsection

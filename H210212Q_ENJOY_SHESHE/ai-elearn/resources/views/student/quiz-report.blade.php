@extends('layouts.app')

@section('content')
<div class="p-6">
    <button onclick="window.print()" class="bg-blue-500 text-white px-4 py-2 rounded mb-6 ml-auto block">
        Print Report
    </button>

    <h2 class="text-2xl font-bold mb-4">Quiz Report - {{ $topic->title }}</h2>

    {{-- Summary Section --}}
    <div class="bg-white p-4 rounded shadow mb-6">
        <p><strong>Score:</strong> {{ $result->score }} / {{ $result->total_score }} ({{ round(($result->score / $result->total_score) * 100, 2) }}%)</p>
        <p><strong>Grade:</strong> {{ $result->grade->grade_letter ?? 'N/A' }}</p>
        <p><strong>Status:</strong> {{ $performance->last_score >= 75 ? '✅ Passed' : '❌ Failed' }}</p>
    </div>

    {{-- Question Review --}}
    <div class="bg-white p-4 rounded shadow mb-6">
        <h3 class="text-xl font-semibold mb-4">Question Review</h3>
        @foreach ($quizResults as $quizResult)
            <div class="mb-6 border-b pb-4">
                <p class="font-semibold text-lg mb-2">{{ $quizResult->quiz->question }}</p>

                @foreach ($quizResult->quiz->answers as $answer)
                    @php
                        $isCorrect = $answer->is_correct;
                        $isSelected = $quizResult->answer_id == $answer->id;
                    @endphp

                    <div class="ml-4 p-2 rounded 
                        @if ($isCorrect && $isSelected) bg-green-100 text-green-800
                        @elseif($isCorrect) bg-green-50 text-green-700
                        @elseif($isSelected) bg-red-100 text-red-700
                        @else bg-gray-50 text-gray-700
                        @endif
                    ">
                        <span class="mr-2">
                            @if ($isCorrect && $isSelected)
                                ✅🟡
                            @elseif ($isCorrect)
                                ✅
                            @elseif ($isSelected)
                                ❌🟡
                            @else
                                🟥
                            @endif
                        </span>

                        {{ $answer->answer_text }}

                        @if ($isCorrect && $isSelected)
                            <span class="text-sm italic ml-2">(Correct, and your answer)</span>
                        @elseif ($isCorrect)
                            <span class="text-sm italic ml-2">(Correct answer)</span>
                        @elseif ($isSelected)
                            <span class="text-sm italic ml-2">(Your answer — incorrect)</span>
                        @endif
                    </div>
                @endforeach

                @if (!$quizResult->is_correct)
                    <p class="text-sm text-red-600 mt-2">❗ You selected the wrong answer.</p>
                @endif
            </div>
        @endforeach
    </div>

    {{-- Recommendations --}}
    @if ($recommendations->isNotEmpty())
    <div class="bg-yellow-100 p-4 rounded shadow">
        <h3 class="text-xl font-semibold mb-3">Recommended Areas to Review</h3>
        <ul class="list-disc ml-6">
            @foreach ($recommendations as $item)
                <li>{{ $item }}</li>
            @endforeach
        </ul>
    </div>
    @endif

    {{-- Navigation Buttons --}}
<div class="mt-8 flex justify-between">
    @if ($performance && $performance->last_score >= 75)
        {{-- Passed: Show next topic if it exists --}}
        @php
            $nextTopic = \App\Models\Topic::where('course_id', $topic->course_id)
                            ->where('order', '>', $topic->order)
                            ->orderBy('order')
                            ->first();
        @endphp

@if ($nextTopic)
<a href="{{ route('topic-show', $nextTopic->id) }}"
   class="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded shadow">
    ✅ Continue to Next Topic: {{ $nextTopic->title }}
</a>
@else
<p class="text-gray-500 italic text-sm">🎉 You have completed all topics in this course.</p>
@endif
@else
{{-- Failed: Show retry current topic button --}}
<a href="{{ route('topic-show', $topic->id) }}"
class="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded shadow">
❌ Review & Retry Topic: {{ $topic->title }}
</a>
@endif
</div>
</div>
@endsection

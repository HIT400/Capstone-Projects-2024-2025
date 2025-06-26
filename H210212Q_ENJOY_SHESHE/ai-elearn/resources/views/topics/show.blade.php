@extends('layouts.app')

@section('content')
<div class="p-6">
    <h2 class="text-2xl font-bold mb-4">{{ $topic->title }} - Contents</h2>

    <div class="space-y-4">
        @forelse($topic->contents as $content)
            <div class="p-4 bg-white rounded shadow">
                <h3 class="text-lg font-semibold">{{ $content->title }}</h3>
                <p class="text-gray-700">{{ $content->description }}</p>
                <div class="mt-2 text-sm text-gray-600">
                    <ul class="list-disc pl-5 space-y-1">
                        @foreach(explode("\n", $content->notes) as $note)
                            @if(trim($note) !== '')
                                <li>{{ $note }}</li>
                            @endif
                        @endforeach
                    </ul>
                </div>
            </div>
        @empty
            <p>No contents found for this topic.</p>
        @endforelse
    </div>

    @php
    $firstQuiz = $topic->quizzes->first();
@endphp

@if ($firstQuiz)
    <div class="mt-6 text-right">
        <a href="{{ route('quiz-attempt', ['quiz' => $firstQuiz->id]) }}"
           class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow text-sm">
            Try Quiz
        </a>
    </div>
@else
    <div class="mt-6 text-right text-gray-500 italic">
        No quiz available for this topic.
    </div>
@endif

</div>
@endsection

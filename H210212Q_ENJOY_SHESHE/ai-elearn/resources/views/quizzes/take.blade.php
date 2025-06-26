@extends('layouts.app')

@section('content')
<div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Quiz for: {{ $topic->title }}</h2>
    <form method="POST" action="{{ route('quiz-submit', $topic->id) }}">
        @csrf
        @foreach ($topic->quizzes as $quiz)
            <div class="mb-4">
                <p class="font-semibold">{{ $quiz->question }}</p>
                @foreach ($quiz->answers as $answer)
                    <label class="block">
                        <input type="radio" name="quiz_{{ $quiz->id }}" value="{{ $answer->id }}" required>
                        {{ $answer->answer_text }}
                    </label>
                @endforeach
            </div>
        @endforeach

        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Submit Quiz</button>
    </form>
</div>
@endsection

@extends('layouts.app')

@section('content')
<div class="p-6">
    <h2 class="text-2xl font-bold mb-4">{{ $course->name }} - Topics & Reports</h2>

    <div class="overflow-x-auto">
        <table class="min-w-full border border-gray-200 divide-y divide-gray-200">
            <thead class="bg-gray-100">
                <tr>
                    <th class="text-left px-4 py-2">Topic</th>
                    <th class="text-left px-4 py-2">Report</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                @foreach ($course->topics as $topic)
                    @php
                        $quiz = $topic->quizzes->first();
                        $resultExists = $quiz 
                            ? \App\Models\Result::where('user_id', auth()->id())
                                ->where('quiz_id', $quiz->id)
                                ->exists()
                            : false;
                    @endphp
                    <tr class="odd:bg-white even:bg-gray-50">
                        <td class="px-4 py-2 font-semibold">{{ $topic->title }}</td>
                        <td class="px-4 py-2">
                            @if ($resultExists)
                            <a href="{{ route('quiz-report', $topic->id) }}"
                                class="inline-block bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-1 px-3 rounded">
                                 📄 View Report
                             </a>
                            @else
                                <span class="text-gray-500">📝 Complete the quiz to view report</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
@endsection

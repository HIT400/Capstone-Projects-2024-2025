@extends('layouts.app')

@section('content')
<div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Your Grades & Performance</h2>

    <table class="min-w-full bg-white border border-gray-300">
        <thead class="bg-gray-200">
            <tr>
                <th class="px-4 py-2 border">Topic</th>
                <th class="px-4 py-2 border">Score</th>
                <th class="px-4 py-2 border">Attempts</th>
                <th class="px-4 py-2 border">Grade</th>
                <th class="px-4 py-2 border">Status</th>
                <th class="px-4 py-2 border">Date</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($results as $result)

            @php
                $topic = $result->quiz->topic ?? null;
                $performance = $topic
                    ? \App\Models\Performance::where('user_id', $result->user_id)
                        ->where('topic_id', $topic->id)
                        ->first()
                    : null;
            @endphp

                <tr>
                    <td class="px-4 py-2 border">
                        {{ $result->quiz->topic->title ?? 'N/A' }}
                    </td>
                    <td class="px-4 py-2 border">
                        {{ $result->score }}/{{ $result->total_score }}
                    </td>
                    <td class="px-4 py-2 border">
                        {{ $performance->attempts }}
                    </td>
                    <td class="px-4 py-2 border">
                        {{ $result->grade->grade_letter ?? 'N/A' }}
                    </td>
                    <td class="px-4 py-2 border">
                        {{ $result->status }}
                    </td>
                    <td class="px-4 py-2 border">
                        {{ $result->updated_at->format('d M Y') }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center py-4">No results found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection

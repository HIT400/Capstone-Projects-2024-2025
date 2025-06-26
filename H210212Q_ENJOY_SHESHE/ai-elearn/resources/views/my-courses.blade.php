@extends('layouts.app')

@section('content')
@if (session('success'))
<div class="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded">
    {{ session('success') }}
</div>
@endif

@if (isset($success))
<div class="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded">
    {{ $success }}
</div>
@endif
    <div class="container">
        <h2 class="text-2xl font-bold mb-4">Courses</h2>
        <div class="flex justify-end mb-4">
            <button 
                onclick="toggleModal()" 
                class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                Enroll a Course
            </button>
        </div>
    </div>

            <div class="container mx-auto p-6">
                <h2 class="text-2xl font-bold mb-6">My Enrolled Courses</h2>
            
        

        @if($userCourses->isEmpty())
            <p class="text-gray-600">You are not enrolled in any courses yet.</p>
        @else
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @foreach ($userCourses as $course)
                @php
                    $topics = $course->topics;
                    $totalTopics = $topics->count();
                    $passedTopics = 0;
        
                    foreach ($topics as $topic) {
                        $performance = \App\Models\Performance::where('user_id', auth()->id())
                                        ->where('topic_id', $topic->id)
                                        ->first();
        
                        if ($performance && $performance->last_score >= 75) {
                            $passedTopics++;
                        }
                    }
        
                    $progress = $totalTopics > 0 ? round(($passedTopics / $totalTopics) * 100) : 0;
                    $barColor = $progress >= 75 ? 'bg-green-500' : ($progress >= 50 ? 'bg-yellow-400' : 'bg-red-500');
                @endphp
        
                <a href="{{ route('course-view', $course->id) }}" 
                   class="p-4 bg-white rounded shadow-md hover:bg-gray-100 transition duration-300">
                    <div class="flex flex-col">
                        <h3 class="text-xl font-semibold text-gray-900">{{ $course->name }}</h3>
                        <p class="text-gray-600 mt-2">Code: {{ $course->code }}</p>
                        <p class="text-gray-500 mt-1">Department: {{ $course->department->name ?? 'N/A' }}</p>
        
                        {{-- Progress Bar --}}
                        <div class="mt-4">
                            <div class="w-full bg-gray-200 h-2 rounded">
                                <div class="{{ $barColor }} h-2 rounded transition-all duration-300" style="width: {{ $progress }}%;"></div>
                            </div>
                            <p class="text-xs text-gray-600 mt-1">Progress: {{ $progress }}%</p>
                        </div>
                    </div>
                </a>
            @endforeach
            
        </div>
        @endif
    </div>

    <!-- Modal Backdrop -->
<div id="interestModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
    <!-- Modal Box -->
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold">Enter Your Interest</h2>
            <button onclick="toggleModal()" class="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
        </div>

        <form method="POST" action="/recommend-course">
            @csrf
            <label class="block text-sm font-medium text-gray-700 mb-1">Interest</label>
            <input 
                type="text" 
                name="interest" 
                placeholder="e.g. AI, Web Development" 
                class="w-full p-2 border border-gray-300 rounded-md mb-4" 
                required>

            <div class="flex justify-end">
                <button 
                    type="submit" 
                    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Submit
                </button>
            </div>
        </form>
    </div>
</div>


<script>
    function toggleModal() {
        const modal = document.getElementById('interestModal');
        modal.classList.toggle('hidden');
    }
</script>
@endsection


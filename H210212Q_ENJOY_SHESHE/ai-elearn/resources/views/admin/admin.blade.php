@extends('layouts.app')

@section('content')
<div class="p-6">
    <h2 class="text-2xl font-bold mb-4">📊 Admin Dashboard</h2>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded shadow">
            <h3 class="text-lg font-semibold">👥 Users</h3>
            <p>{{ $totalUsers }}</p>
        </div>
        <div class="bg-white p-4 rounded shadow">
            <h3 class="text-lg font-semibold">🎓 Students</h3>
            <p>{{ $totalStudents }}</p>
        </div>
        <div class="bg-white p-4 rounded shadow">
            <h3 class="text-lg font-semibold">📘 Courses</h3>
            <p>{{ $totalCourses }}</p>
        </div>
        <div class="bg-white p-4 rounded shadow">
            <h3 class="text-lg font-semibold">📚 Topics</h3>
            <p>{{ $totalTopics }}</p>
        </div>
    </div>

    <div class="bg-white p-6 rounded shadow">
        <h3 class="text-xl font-bold mb-4">📈 Enrollments by Course</h3>
        <canvas id="studentsChart"></canvas>
    </div>
</div>

<script src="{{ asset('assets/custom-chart.js')}}"></script>
<script>
    const ctx = document.getElementById('studentsChart');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: @json($studentsPerCourse->pluck('title')),
            datasets: [{
                label: 'Students Enrolled',
                data: @json($studentsPerCourse->pluck('users_count')),
                backgroundColor: 'rgba(59, 130, 246, 0.5)'
            }]
        }
    });
</script>
@endsection

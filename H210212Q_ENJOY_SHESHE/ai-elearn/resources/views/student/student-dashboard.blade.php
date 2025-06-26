@extends('layouts.app')

@section('content')
<div class="p-6">
    <h2 class="text-2xl font-bold mb-6">Student Dashboard</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-white p-4 rounded shadow">
            <h3 class="text-lg font-semibold">Enrolled Courses</h3>
            <p class="text-3xl mt-2">{{ $courses->count() }}</p>
        </div>
        <div class="bg-white p-4 rounded shadow">
            <h3 class="text-lg font-semibold">Quizzes Taken</h3>
            <p class="text-3xl mt-2">{{ $quizzesTaken }}</p>
        </div>
        <div class="bg-white p-4 rounded shadow">
            <h3 class="text-lg font-semibold">Average Score</h3>
            <p class="text-3xl mt-2">
                {{ $scores->count() > 0 ? round($scores->avg(), 2) : 'N/A' }}%
            </p>
        </div>
    </div>

    {{-- Chart Section --}}
    <div class="bg-white p-6 rounded shadow mb-6">
        <h3 class="text-xl font-semibold mb-4">Performance Overview</h3>
        <canvas id="performanceChart" height="150"></canvas>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ asset('assets/custom-chart.js')}}"></script>
<script>
    const ctx = document.getElementById('performanceChart').getContext('2d');

    // Create a gradient for a more dynamic and colorful chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)'); // Blue color
    gradient.addColorStop(1, 'rgba(234, 88, 12, 0.5)'); // Orange color

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: {!! json_encode($labels) !!},
            datasets: [{
                label: 'Scores (%)',
                data: {!! json_encode($scores) !!},
                backgroundColor: gradient, // Use gradient for background color
                borderColor: 'rgba(59, 130, 246, 1)', // Border color (blue)
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(59, 130, 246, 0.8)',
                hoverBorderColor: 'rgba(59, 130, 246, 1)',
                hoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 10, // Step size for the Y-axis
                        color: '#333' // Color for Y-axis labels
                    }
                },
                x: {
                    ticks: {
                        color: '#333' // Color for X-axis labels
                    }
                }
            },
            plugins: {
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark background for tooltips
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#fff', // White border for tooltip
                    borderWidth: 1
                }
            }
        }
    });
</script>
@endsection



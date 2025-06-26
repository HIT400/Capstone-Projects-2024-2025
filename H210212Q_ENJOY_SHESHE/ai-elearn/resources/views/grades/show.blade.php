@section('content')
    <div class="px-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-semibold text-gray-900">Grade Details</h1>
        <div class="mt-8 flow-root">
            <div class="inline-block min-w-full py-2 align-middle">
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-300 bg-white">
                        <thead class="bg-gray-50">
                        <tr>
                            <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Field</th>
                            <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Value</th>
                        </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                        <tr>
                            <td class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Grade Letter</td>
                            <td class="px-3 py-4 text-sm text-gray-500">{{ $grade->grade_letter }}</td>
                        </tr>
                        <tr>
                            <td class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Min Score</td>
                            <td class="px-3 py-4 text-sm text-gray-500">{{ $grade->min_score }}</td>
                        </tr>
                        <tr>
                            <td class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Max Score</td>
                            <td class="px-3 py-4 text-sm text-gray-500">{{ $grade->max_score }}</td>
                        </tr>
                        <tr>
                            <td class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Status</td>
                            <td class="px-3 py-4 text-sm text-gray-500">{{ $grade->status }}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="mt-6">
            <a href="{{ route('grade-index') }}" class="px-4 py-2 bg-gray-600 text-white rounded-md">Back to Grades</a>
        </div>
    </div>
@endsection

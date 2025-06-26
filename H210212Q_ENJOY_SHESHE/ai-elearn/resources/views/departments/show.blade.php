@section('content')
    <div class="px-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-semibold text-gray-900">Department Details</h1>
        <div class="mt-8 flow-root">
            <div class="inline-block min-w-full py-2 align-middle">
                <table class="min-w-full divide-y divide-gray-300 bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <tbody class="divide-y divide-gray-200">
                    <tr>
                        <td class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Name</td>
                        <td class="px-3 py-4 text-sm text-gray-500">{{ $department->name }}</td>
                    </tr>
                    <tr>
                        <td class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Code</td>
                        <td class="px-3 py-4 text-sm text-gray-500">{{ $department->code }}</td>
                    </tr>
                    <tr>
                        <td class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Status</td>
                        <td class="px-3 py-4 text-sm text-gray-500">{{ $department->status }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
@endsection

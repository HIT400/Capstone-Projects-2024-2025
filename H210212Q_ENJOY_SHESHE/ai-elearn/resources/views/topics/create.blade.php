<h1 class="text-2xl font-semibold text-gray-900">Add Topic</h1>

<form action="{{ route('topic-store') }}" method="POST" class="mt-6 bg-white p-6 rounded-md shadow-md">
    @csrf
    <label class="block text-sm font-medium text-gray-700">Topic Title</label>
    <input type="text" name="title" class="block w-full mt-2 p-2 border rounded-md" required>

    <label class="block mt-4 text-sm font-medium text-gray-700">Description</label>
    <textarea name="description" class="block w-full mt-2 p-2 border rounded-md"></textarea>

    <label class="block mt-4 text-sm font-medium text-gray-700">Course</label>
    <select name="course_id" class="block w-full mt-2 p-2 border rounded-md" required>
        @foreach ($courses as $course)
            <option value="{{ $course->id }}">{{ $course->name }}</option>
        @endforeach
    </select>

    <label class="block mt-4 text-sm font-medium text-gray-700">Status</label>
    <select name="status" class="block w-full mt-2 p-2 border rounded-md">
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
    </select>

    <button type="submit" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
</form>
@endsection

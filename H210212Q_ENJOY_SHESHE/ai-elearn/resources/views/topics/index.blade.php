@extends('layouts.app')

@section('title', 'Topics')

@section('content')
    <div class="px-4 sm:px-6 lg:px-8">
        <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
                <h1 class="text-lg font-semibold text-gray-900">Topics</h1>
            </div>
            <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button onclick="openAddModal()"
                        class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Add Topic
                </button>
            </div>
        </div>

        <!-- Table -->
        <div class="mt-6 overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="bg-gray-100 text-gray-900 text-sm font-semibold">
                <tr>
                    <th class="px-6 py-3 text-left border border-gray-300">Topic Name</th>
                    <th class="px-6 py-3 text-left border border-gray-300">Course</th>
                    <th class="px-6 py-3 text-left border border-gray-300">Status</th>
                    <th class="px-6 py-3 text-left border border-gray-300">Actions</th>
                </tr>
                </thead>
                <tbody class="bg-white text-gray-700">
                @foreach ($topics as $topic)
                    <tr class="border border-gray-300">
                        <td class="px-6 py-3.5 border border-gray-300">{{ $topic->title }}</td>
                        <td class="px-6 py-3.5 border border-gray-300">{{ $topic->course->name }}</td>
                        <td class="px-6 py-3.5 border border-gray-300">{{ $topic->status }}</td>
                        <td class="px-6 py-3.5 border border-gray-300">
                            <div class="flex space-x-4">
                                <button onclick="openEditModal({{ $topic->id }}, '{{ $topic->title }}', '{{ $topic->course_id }}', '{{ $topic->status }}')"
                                        class="text-indigo-600 hover:text-indigo-900">Edit</button> |
                                <form action="{{ route('topic-destroy', $topic->id) }}" method="POST" class="inline">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-red-600 hover:text-red-900">Delete</button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    </div>

    <!-- Add Modal -->
    <div id="addModal" class="fixed inset-0 hidden bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded-md shadow-md w-1/3">
            <h2 class="text-lg font-semibold text-gray-900">Add Topic</h2>
            <form action="{{ route('topic-store') }}" method="POST" class="mt-4">
                @csrf

                <label class="block text-sm font-medium text-gray-700">Topic Name</label>
                <input type="text" name="title" class="block w-full mt-2 p-2 border rounded-md" required>

                <label class="block mt-4 text-sm font-medium text-gray-700">Course</label>
                <select name="course_id" class="block w-full mt-2 p-2 border rounded-md">
                    @foreach($courses as $course)
                        <option value="{{ $course->id }}">{{ $course->name }}</option>
                    @endforeach
                </select>

                <label class="block mt-4 text-sm font-medium text-gray-700">Status</label>
                <select name="status" class="block w-full mt-2 p-2 border rounded-md">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>

                <div class="flex justify-end mt-4">
                    <button type="button" onclick="closeAddModal()" class="px-4 py-2 bg-gray-600 text-white rounded-md mr-2">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit Modal -->
    <div id="editModal" class="fixed inset-0 hidden bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded-md shadow-md w-1/3">
            <h2 class="text-lg font-semibold text-gray-900">Edit Topic</h2>
            <form id="editForm" method="POST">
                @csrf
                @method('PUT')

                <label class="block text-sm font-medium text-gray-700">Topic Name</label>
                <input type="text" name="title" id="editTitle" class="block w-full mt-2 p-2 border rounded-md">

                <label class="block mt-4 text-sm font-medium text-gray-700">Course</label>
                <select name="course_id" id="editCourse" class="block w-full mt-2 p-2 border rounded-md">
                    @foreach($courses as $course)
                        <option value="{{ $course->id }}">{{ $course->name }}</option>
                    @endforeach
                </select>

                <label class="block mt-4 text-sm font-medium text-gray-700">Status</label>
                <select name="status" id="editStatus" class="block w-full mt-2 p-2 border rounded-md">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>

                <div class="mt-4 flex justify-end">
                    <button type="button" onclick="closeEditModal()" class="px-4 py-2 bg-gray-600 text-white rounded-md mr-2">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md">Update</button>
                </div>
            </form>
        </div>
    </div>

    <!-- JavaScript for Modals -->
    <script>
        function openAddModal() {
            document.getElementById('addModal').classList.remove('hidden');
        }

        function closeAddModal() {
            document.getElementById('addModal').classList.add('hidden');
        }

        function openEditModal(id, title, courseId, status) {
            document.getElementById('editModal').classList.remove('hidden');
            document.getElementById('editTitle').value = title;
            document.getElementById('editCourse').value = courseId;
            document.getElementById('editStatus').value = status;
            document.getElementById('editForm').action = `/topics/${id}`;
        }

        function closeEditModal() {
            document.getElementById('editModal').classList.add('hidden');
        }
    </script>
@endsection

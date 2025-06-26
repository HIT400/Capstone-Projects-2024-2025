@section('content')
    <div class="px-4 sm:px-6 lg:px-8">
        <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
                <h1 class="text-base font-semibold leading-6 text-gray-900">Contents</h1>
                <p class="mt-2 text-sm text-gray-700">A list of all contents in the system.</p>
            </div>
            <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <a href="{{ route('content-create') }}" class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Add Content
                </a>
            </div>
        </div>
        <div class="mt-8 flow-root">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-300">
                        <thead class="bg-gray-50">
                        <tr>
                            <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Title</th>
                            <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Topic</th>
                            <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                            <th class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>
                        </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white">
                        @foreach ($contents as $content)
                            <tr>
                                <td class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ $content->title }}</td>
                                <td class="px-3 py-4 text-sm text-gray-500">{{ $content->topic->title }}</td>
                                <td class="px-3 py-4 text-sm text-gray-500">{{ $content->status }}</td>
                                <td class="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <button onclick="openEditModal({{ $content->id }}, '{{ $content->title }}', '{{ $content->description }}', '{{ $content->notes }}', '{{ $content->topic_id }}', '{{ $content->status }}')"
                                            class="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    |
                                    <a href="{{ route('content-show', $content->id) }}" class="text-green-600 hover:text-green-900">View</a>
                                    |
                                    <form action="{{ route('content-destroy', $content->id) }}" method="POST" class="inline">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="text-red-600 hover:text-red-900">Delete</button>
                                    </form>
                                </td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Modal -->
    <div id="editModal" class="fixed inset-0 hidden bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded-md shadow-md w-1/3">
            <h2 class="text-lg font-semibold text-gray-900">Edit Content</h2>
            <form id="editForm" method="POST">
                @csrf
                @method('PUT')

                <label class="block mt-4 text-sm font-medium text-gray-700">Title</label>
                <input type="text" name="title" id="editTitle" class="block w-full mt-2 p-2 border rounded-md">

                <label class="block mt-4 text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" id="editDescription" class="block w-full mt-2 p-2 border rounded-md"></textarea>

                <label class="block mt-4 text-sm font-medium text-gray-700">Notes</label>
                <textarea name="notes" id="editNotes" class="block w-full mt-2 p-2 border rounded-md"></textarea>

                <label class="block mt-4 text-sm font-medium text-gray-700">Topic</label>
                <select name="topic_id" id="editTopic" class="block w-full mt-2 p-2 border rounded-md">
                    @foreach ($topics as $topic)
                        <option value="{{ $topic->id }}">{{ $topic->title }}</option>
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

    <!-- JavaScript for Modal -->
    <script>
        function openEditModal(id, title, description, notes, topic, status) {
            document.getElementById('editModal').classList.remove('hidden');
            document.getElementById('editTitle').value = title;
            document.getElementById('editDescription').value = description;
            document.getElementById('editNotes').value = notes;
            document.getElementById('editTopic').value = topic;
            document.getElementById('editStatus').value = status;
            document.getElementById('editForm').action = `/contents/${id}`;
        }

        function closeEditModal() {
            document.getElementById('editModal').classList.add('hidden');
        }
    </script>
@endsection

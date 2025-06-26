@extends('layouts.app')

@section('title', 'Courses')

@section('content')
    <div class="px-4 sm:px-6 lg:px-8">
        <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
                <h1 class="text-lg font-semibold text-gray-900">Users</h1>
            </div>
            <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button onclick="openAddModal()"
                        class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    Add User
                </button>
            </div>
        </div>

        <!-- Table -->
        <div class="mt-6 overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="bg-gray-100 text-gray-900 text-sm font-semibold">
                <tr>
                    <th class="px-6 py-3 text-left border border-gray-300">Name</th>
                    <th class="px-6 py-3 text-left border border-gray-300">Role</th>
                    <th class="px-6 py-3 text-left border border-gray-300">Actions</th>
                </tr>
                </thead>
                <tbody class="bg-white text-gray-700">
                @foreach ($users as $user)
                    <tr class="border border-gray-300">
                        <td class="px-6 py-3.5 border border-gray-300">{{ $user->name }}
                        </td>
                        <td class="px-6 py-3.5 border border-gray-300">{{ $user->roles->pluck('name')->first() }}</td>
                            <td class="px-6 py-3.5 border border-gray-300">
                                <div class="flex space-x-4">
                                    <button onclick="openEditModal({{ $user->id }}, '{{ $user->name }}','{{ $user->roles->pluck('name')->first()  }}')"
                                            class="text-indigo-600 hover:text-indigo-900">Edit</button> |
                                    <form action="{{ route('course-destroy', $user->id) }}" method="POST" class="inline">
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
            <h2 class="text-lg font-semibold text-gray-900">Add User</h2>
            <form action="{{ route('course-store') }}" method="POST" class="mt-4">
                @csrf

                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" name="name" class="block w-full mt-2 p-2 border rounded-md" required>

                <label class="block mt-4 text-sm font-medium text-gray-700">Email</label>
                <input type="email" name=email" class="block w-full mt-2 p-2 border rounded-md" required>

                <label class="block mt-4 text-sm font-medium text-gray-700">Role</label>
                <select name="role_id" class="block w-full mt-2 p-2 border rounded-md">
                    <option>Select Role</option>
                    @foreach($roles as $role)
                        <option value="{{ $role->id }}">{{ $role->name }}</option>
                    @endforeach
                </select>
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <input type="text" name="name" class="block w-full mt-2 p-2 border rounded-md" required>
                <label class="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input type="text" name="name" class="block w-full mt-2 p-2 border rounded-md" required>
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
            <h2 class="text-lg font-semibold text-gray-900">Edit User</h2>
            <form id="editForm" method="POST">
                @csrf
                @method('PUT')

                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" name="name" id="editName" class="block w-full mt-2 p-2 border rounded-md">

                <label class="block mt-4 text-sm font-medium text-gray-700">Role</label>
                <select name="editRole" id="editRole" class="block w-full mt-2 p-2 border rounded-md">
                   {{-- @foreach($roles as $role)
                       <option value="{{ $roles->id }}">{{ $roles->name }}</option>
                 @endforeach --}}
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

        function openEditModal(id, name, code, editRole, status) {
            document.getElementById('editModal').classList.remove('hidden');
            document.getElementById('editName').value = name;
            document.getElementById('editCode').value = code;
            document.getElementById('editRole').value = editRole;
            document.getElementById('editStatus').value = status;
            document.getElementById('editForm').action = `/courses/${id}`;
        }

        function closeEditModal() {
            document.getElementById('editModal').classList.add('hidden');
        }
    </script>
@endsection

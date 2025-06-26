@extends('layouts.app')
@section('content')
    <div class="max-w-lg mx-auto mt-10">
        <div class="bg-white p-6 rounded-lg shadow-lg">
            <h1 class="text-2xl font-semibold text-gray-900 mb-4">Add Role</h1>

            <form action="{{ route('role-store') }}" method="POST">
                @csrf
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Role Name</label>
                    <input type="text" name="name" class="block w-full mt-2 p-2 border rounded-md">
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" class="block w-full mt-2 p-2 border rounded-md">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
                <button type="submit" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
            </form>
        </div>
    </div>
@endsection

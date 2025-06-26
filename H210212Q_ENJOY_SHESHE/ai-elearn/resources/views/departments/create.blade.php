@section('content')
    <h1 class="text-2xl font-semibold text-gray-900">Add Department</h1>

    <form action="{{ route('department-store') }}" method="POST" class="mt-6 bg-white p-6 rounded-md shadow-md">
        @csrf
        <label class="block text-sm font-medium text-gray-700">Department Name</label>
        <input type="text" name="name" class="block w-full mt-2 p-2 border rounded-md">

        <label class="block mt-4 text-sm font-medium text-gray-700">Code</label>
        <input type="text" name="code" class="block w-full mt-2 p-2 border rounded-md">

        <label class="block mt-4 text-sm font-medium text-gray-700">Status</label>
        <select name="status" class="block w-full mt-2 p-2 border rounded-md">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
        </select>

        <button type="submit" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
    </form>
@endsection
3️⃣ Departments Edit Page (departments/edit.blade.php)
html
Copy
Edit
@extends('layouts.app')

@section('title', 'Edit Department')

@section('content')
    <h1 class="text-2xl font-semibold text-gray-900">Edit Department</h1>

    <form action="{{ route('department-update', $department->id) }}" method="POST" class="mt-6 bg-white p-6 rounded-md shadow-md">
        @csrf
        @method('PUT')

        <label class="block text-sm font-medium text-gray-700">Department Name</label>
        <input type="text" name="name" value="{{ $department->name }}" class="block w-full mt-2 p-2 border rounded-md">

        <label class="block mt-4 text-sm font-medium text-gray-700">Code</label>
        <input type="text" name="code" value="{{ $department->code }}" class="block w-full mt-2 p-2 border rounded-md">

        <label class="block mt-4 text-sm font-medium text-gray-700">Status</label>
        <select name="status" class="block w-full mt-2 p-2 border rounded-md">
            <option value="Active" {{ $department->status == 'Active' ? 'selected' : '' }}>Active</option>
            <option value="Inactive" {{ $department->status == 'Inactive' ? 'selected' : '' }}>Inactive</option>
        </select>

        <button type="submit" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">Update</button>
    </form>
@endsection

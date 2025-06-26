<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->get();
        $roles = Role::all();
        return view('users.user', compact('roles','users'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'surname' => 'required',
            'email' => 'required|unique:users,email',
            'password' => 'required|min:6',
            'role_id' => 'required|exists:roles,id', // Role is required during registration
            'interest' => 'required'
        ]);

        $user = User::create([
            'name' => $request->name,
            'surname'=>$request->surname,
            'email' => $request->email,
            'password' => bcrypt($request->password),
        ]);

        // Assign the role to the user (Pivot Table: user_role)
        $user->roles()->sync([$request->role_id]);
        $user->interests()->sync([$request->interest]);

        return response()->json(['message' => 'User registered successfully', 'user' => $user], 201);
    }
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required',
            'surname' => 'required',
            'email' => 'required|unique:users,email,'.$id,
            'role_id' => 'required|exists:roles,id',
        ]);

        
        $user = User::findOrFail($id);

        $user->update([
            'name' => $request->name,
            'surname' => $request->surname,
            'email' => $request->email,
        ]);

        $user->roles()->sync([$request->role_id]);

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    public function assignDepartment(Request $request, $userId)
    {
        $request->validate([
            'department_id' => 'required|exists:departments,id',
        ]);

        $user = User::findOrFail($userId);

        // Assign the department to the user (Pivot Table: user_department)
        $user->departments()->attach([$request->department_id]);

        return response()->json(['message' => 'Department assigned successfully', 'user' => $user]);
    }

    public function assignCourse(Request $request, $userId)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        $user = User::findOrFail($userId);

        // Assign the course to the user (Pivot Table: user_course)
        $user->courses()->attach([$request->course_id]);

        return response()->json(['message' => 'Course assigned successfully', 'user' => $user]);
    }

    public function show($id)
    {
        $roles = Role::findOrFail($id);
        return view('courses.show', compact('roles'));
    }

}

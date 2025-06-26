@php
    $user = Auth::user();
    $role = $user ? optional($user->roles->first())->name : null; // Fetch the first assigned role safely
@endphp

<div class="iq-sidebar sidebar-default">
    <div class="iq-sidebar-logo d-flex align-items-center justify-between">
        <a href="{{ route('admin-dashboard') }}" class="header-logo">
            <img src="{{ asset('assets/images/logo.png') }}" class="img-fluid rounded-normal light-logo" alt="logo">
            <h5 class="logo-title light-logo ml-3">DZIDZO</h5>
        </a>
        <div class="iq-menu-bt-sidebar ml-0">
            <i class="las la-bars wrapper-menu"></i>
        </div>
    </div>

    <div class="data-scrollbar" data-scroll="1">
        <nav class="iq-sidebar-menu">
            <ul id="iq-sidebar-toggle" class="iq-menu">

                @php
                    $user = auth()->user();
                @endphp

            @if ($user->hasRole('Admin') || $user->hasRole('Lecturer'))
            <a href="{{ route('admin-dashboard') }}" class="svg-icon">
                <i class="fa-solid fa-house"></i>
                <span class="ml-4">Admin Dashboard</span>
            </a>
            @elseif ($user->hasRole('Student'))
            <a href="{{ route('student-dashboard') }}" class="svg-icon">
                <i class="fa-solid fa-house"></i>
                <span class="ml-4">Student Dashboard</span>
            </a>
            @endif

                <!-- Show Menu Only If User is Authenticated -->
                @if($user && $role)
                    <!-- Admin Navigation -->
                    @if($role === 'Admin')
                        <li class="{{ Request::is('departments*') ? 'active' : '' }}">
                            <a href="{{ route('department-index') }}" class="svg-icon">
                                <i class="fa-solid fa-building"></i>
                                <span class="ml-3">Departments</span>
                            </a>
                        </li>

                        <li class="{{ Request::is('courses*') ? 'active' : '' }}">
                            <a href="{{ route('course-index') }}" class="svg-icon">
                                <i class="fa-solid fa-book"></i>
                                <span class="ml-3">Manage Courses</span>
                            </a>
                        </li>

                        <li class="{{ Request::is('users*') ? 'active' : '' }}">
                            <a href="{{ route('user-index') }}" class="svg-icon">
                                <i class="fa-solid fa-users"></i>
                                <span class="ml-3">Manage Users</span>
                            </a>
                        </li>

                        <li class="{{ Request::is('reports*') ? 'active' : '' }}">
                            <a href="" class="svg-icon">
                                <i class="fa-solid fa-chart-bar"></i>
                                <span class="ml-3">Performance Reports</span>
                            </a>
                        </li>
                    @endif

                    <!-- Lecturer Navigation -->
                    @if($role === 'Lecturer')
                        <li class="{{ Request::is('lecturer/courses*') ? 'active' : '' }}">
                            <a href="{{ route('course-index') }}" class="svg-icon">
                                <i class="fa-solid fa-book-open"></i>
                                <span class="ml-3">My Courses</span>
                            </a>
                        </li>

                        <li class="{{ Request::is('lecturer/topics*') ? 'active' : '' }}">
                            <a href="" class="svg-icon">
                                <i class="fa-solid fa-list"></i>
                                <span class="ml-3">Manage Topics</span>
                            </a>
                        </li>

                        <li class="{{ Request::is('lecturer/quizzes*') ? 'active' : '' }}">
                            <a href="" class="svg-icon">
                                <i class="fa-solid fa-pencil"></i>
                                <span class="ml-3">Quizzes</span>
                            </a>
                        </li>

                        <li class="{{ Request::is('lecturer/performance*') ? 'active' : '' }}">
                            <a href="" class="svg-icon">
                                <i class="fa-solid fa-chart-line"></i>
                                <span class="ml-3">Track Performance</span>
                            </a>
                        </li>
                    @endif

                    <!-- Student Navigation -->
                    @if($role === 'Student')
                        <li class="{{ Request::is('student/courses*') ? 'active' : '' }}">
                            <a href="{{ route('my-courses') }}" class="svg-icon">
                                <i class="fa-solid fa-graduation-cap"></i>
                                <span class="ml-3"> 🎓 My Courses</span>
                            </a>
                        </li>

                        {{-- <li class="{{ Request::is('student/learning-materials*') ? 'active' : '' }}">
                            <a href="" class="svg-icon">
                                <i class="fa-solid fa-book-reader"></i>
                                <span class="ml-3">Learning Materials</span>
                            </a>
                        </li> --}}

                        <li class="{{ Request::is('student/quizzes*') ? 'active' : '' }}">
                            <a href="{{route('student-quizzes')}}" class="svg-icon">
                                <i class="fa-solid fa-question-circle"></i>
                                <span class="ml-3">❓ Quizzes</span>
                            </a>
                        </li>

                        <li x-data="{ open: {{ Request::is('student/grades*') || Request::is('student-courses') ? 'true' : 'false' }} }">
                            <button @click="open = !open" class="flex items-center space-x-2 w-full text-left focus:outline-none">
                                <i class="fa-solid fa-award"></i>
                            <span>🏅 Grades & Performance</span>
                            <svg class="w-4 h-4 transform transition-transform duration-300" 
                                :class="{ 'rotate-180': open }" 
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
    
                            </button>
                        
                            <ul x-show="open" x-transition class="ml-6 mt-2 space-y-1">
                                <li>
                                    <a href="{{ route('student-performances') }}"
                                       class="block px-2 py-1 rounded hover:bg-gray-200 {{ Request::is('student/grades*') ? 'font-semibold text-blue-600' : '' }}">
                                       📈 Performance
                                    </a>
                                </li>
                                <li>
                                    <a href="{{ route('student-courses') }}"
                                       class="block px-2 py-1 rounded hover:bg-gray-200 {{ Request::is('student/grades*') ? 'font-semibold text-blue-600' : '' }}">
                                       📚 Reports
                                    </a>
                                </li>
                            </ul>
                        </li>
                        
                        
                    @endif
                @endif
                <li>
                    <form method="POST" action="{{ route('logout') }}" class="ml-4">
                        @csrf
                        <a href="{{ route('logout') }}"
                           onclick="event.preventDefault(); this.closest('form').submit();"
                           class="ml-3">
                            Log Out
                        </a>
                    </form>
                </li>

            </ul>
        </nav>

        <!-- Logout Button at the Bottom -->

    </div>
</div>

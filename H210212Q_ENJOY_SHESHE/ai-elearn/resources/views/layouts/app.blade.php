{{--<!DOCTYPE html>--}}
{{--<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">--}}
{{--    <head>--}}
{{--        <meta charset="utf-8">--}}
{{--        <meta name="viewport" content="width=device-width, initial-scale=1">--}}
{{--        <meta name="csrf-token" content="{{ csrf_token() }}">--}}

{{--        <title>{{ config('app.name', 'Laravel') }}</title>--}}

{{--        <!-- Fonts -->--}}
{{--        <link rel="preconnect" href="https://fonts.bunny.net">--}}
{{--        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />--}}

{{--        <!-- Scripts -->--}}
{{--        @vite(['resources/css/app.css', 'resources/js/app.js'])--}}
{{--    </head>--}}
{{--    <body class="font-sans antialiased">--}}
{{--        <div class="min-h-screen bg-gray-100 dark:bg-gray-900">--}}
{{--            @include('layouts.navigation')--}}

{{--            <!-- Page Heading -->--}}
{{--            @isset($header)--}}
{{--                <header class="bg-white dark:bg-gray-800 shadow">--}}
{{--                    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">--}}
{{--                        {{ $header }}--}}
{{--                    </div>--}}
{{--                </header>--}}
{{--            @endisset--}}

{{--            <!-- Page Content -->--}}
{{--            <main>--}}
{{--                {{ $slot }}--}}
{{--                @yield('content')--}}
{{--            </main>--}}
{{--        </div>--}}
{{--    </body>--}}
{{--</html>--}}
    <!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>AI learn</title>

    <!-- Favicon -->
    <link rel="shortcut icon" href="{{ asset('assets/images/favicon.ico') }}"/>
    <link rel="stylesheet" href="{{ asset('assets/css/backend-plugin.min.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/backend.css?v=1.0.0') }}">

    <link rel="stylesheet" href="{{ asset('assets/vendor/line-awesome/dist/line-awesome/css/line-awesome.min.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/remixicon/fonts/remixicon.css') }}">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @yield('specificpagestyles')
</head>
<body>
<!-- loader Start -->
{{-- <div id="loading">
    <div id="loading-center"></div>
</div> --}}
<!-- loader END -->

<!-- Wrapper Start -->
<div class="wrapper">
    @include('dashboard.body.sidebar')
    @include('dashboard.body.navbar')
    <div class="content-page">
{{--        {{ $slot }}--}}
        @include('layouts.flash-message')
        @yield('content')

        @yield('scripts')
        
    </div>
</div>
<!-- Wrapper End-->

@include('dashboard.body.footer')

<!-- Backend Bundle JavaScript -->
<script src="{{ asset('assets/js/backend-bundle.min.js') }}"></script>
<script src="https://kit.fontawesome.com/4c897dc313.js" crossorigin="anonymous"></script>

@yield('specificpagescripts')

<!-- App JavaScript -->
<script src="{{ asset('assets/js/app.js') }}"></script>
</body>
</html>

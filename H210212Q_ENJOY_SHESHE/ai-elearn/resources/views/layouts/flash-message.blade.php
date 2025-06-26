{{-- Display Validation Errors --}}
@if ($errors->any())
    @foreach ($errors->all() as $error)
        <div class="alert alert-danger">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <i class="icofont icofont-close-line-circled text-white"></i>
                <span aria-hidden="true">&times;</span>
            </button>
            {{ $error }}
        </div>
    @endforeach
@endif

{{-- Success Message --}}
@if (session('success'))
    <div class="alert alert-success background-success">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <i class="feather icon-minus-circle text-white"></i>
        </button>
        <strong>{{ session('success') }}</strong>
    </div>
@endif

{{-- Custom HTML or Code Message --}}
@if (session('code'))
    <div class="alert alert-success background-success">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <i class="feather icon-minus-circle text-white"></i>
        </button>
        <strong>{!! session('code') !!}</strong>
    </div>
@endif

{{-- Error Message --}}
@if (session('error'))
    <div class="alert alert-danger background-danger">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <i class="feather icon-minus-circle text-white"></i>
        </button>
        <strong>{{ session('error') }}</strong>
    </div>
@endif

{{-- Warning Message --}}
@if (session('warning'))
    <div class="alert alert-warning background-warning">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <i class="feather icon-minus-circle text-white"></i>
        </button>
        <strong>{{ session('warning') }}</strong>
    </div>
@endif

{{-- Info Message --}}
@if (session('info'))
    <div class="alert alert-info background-info">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <i class="feather icon-minus-circle text-white"></i>
        </button>
        <strong>{{ session('info') }}</strong>
    </div>
@endif

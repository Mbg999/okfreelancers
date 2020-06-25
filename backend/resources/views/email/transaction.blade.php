<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <title>OkFreelancers | @lang("emails.transaction.$type")</title>
        <link href="https://fonts.googleapis.com/css2?family=Lobster&family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    </head>

    <body style="width: 100%">
        <img src="http://iestrassierra.net/alumnado/curso1920/DAW/daw1920a2/okfreelancers/assets/images/logo_dark.png" style="display: block; width: 300px;">
        <div style="font-family: 'Open Sans', sans-serif;">
            <h1 style="background-color: #00b5d7; color: #ececec; padding: 5px; border-top-left-radius: 5px; border-top-right-radius: 5px; margin: 0;">@lang('emails.hi') {{ $name }}!</h1>
            <div style="background-color: #ececec; color: #1a1a1a; padding: 5px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
                <h3>@lang("emails.transaction.$type")</h3>
                <h4>@lang('emails.transaction.amount_eur'): {{$amount}}</h4>
                <p><b>@lang('emails.transaction.pay'):</b> {{$pay}}</p>
                <p><b>@lang('miscellaneous.description'):</b><br>{{$description}}</p>
                <b>{{$note}}</b>
            </div>
        </div>
    </body>
</html>

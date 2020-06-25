<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <title>OkFreelancers | @lang('pdfs.transactions.transactions')</title>
    </head>

    <body style="color: #1a1a1a">
        <div>
            <img src="{{env('APP_URL')}}/assets/images/backend/logo_dark.png" style="width: 200px">
            <h1 style="text-align: center">
                @lang('pdfs.transactions.your_transactions')
            </h1>
            <div>
                <table style="text-align: center; width: 100%">
                    <tr style="color: #ececec; background-color: #1a1a1a; with: 100%;">
                        <th>ID</th>
                        <th>@lang('pdfs.transactions.amount')</th>
                        <th>@lang('pdfs.transactions.pay')</th>
                        <th>@lang('pdfs.transactions.description')</th>
                        <th>@lang('pdfs.transactions.date')</th>
                    </tr>
                    @foreach($transactions as $transaction)
                        <tr
                        @if($loop->index%2==0)
                             style="background-color: #ececec"
                        @endif
                        >
                            <td>{{$transaction->id}}</td>
                            <td>{{$transaction->amount}}</td>
                            <td>{{$transaction->pay}}</td>
                            <td>{{$transaction->description}}</td>
                            <td>{{$transaction->created_at}}</td>
                        </tr>
                    @endforeach
                </table>
            </div>
        </div>
    </body>
</html>

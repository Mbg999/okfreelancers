<?php

namespace App\Exceptions;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception.
     *
     * @param  \Throwable  $exception
     * @return void
     *
     * @throws \Exception
     */
    public function report(Throwable $exception)
    {
        parent::report($exception);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $exception
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Throwable
     */
    public function render($request, Throwable $exception)
    {
        //dd($exception);
        switch(true){
            case $exception instanceof NotFoundHttpException:
            case $exception instanceof ModelNotFoundException:
                $code = 404;
                $exception = trans('status.not_found');
                $status = 'Not Found';
                break;
            default:
                $code = 500;
                $exception = $exception->getMessage();
                $status = 'Internal Server Error';
                break;
        }

        return response()->json([
                'ok' => false,
                'exception' => $exception,
                'status' => $status
        ], $code);
        //return parent::render($request, $exception);
    }
}

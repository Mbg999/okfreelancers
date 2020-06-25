<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class InternalCommandController extends Controller {

    /**
     * serve is a listener, it will never return anything, so just make the request and close the program that makes the request, like postman
     */
    public function socketsServe(){
        \Illuminate\Support\Facades\Artisan::call('websockets:serve');
    }
}

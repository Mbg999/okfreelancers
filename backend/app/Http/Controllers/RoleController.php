<?php

namespace App\Http\Controllers;

use App\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class RoleController extends Controller {
    /**
     * Display a listing of the resource.
     *
     * @return JSON response
     */
    public function index() {
        return response()->json([
            'ok' => true,
            'data' => Role::get()
        ], Response::HTTP_OK);
    }
}

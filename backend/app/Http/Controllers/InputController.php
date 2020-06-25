<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class InputController extends Controller {

    // TONS OF PROBLEMS, i wont use this but i let this here

    public static function sanitizeParams($params){
        $data = request()->only($params);

        foreach ($data as $d){
            $d = trim(htmlspecialchars($d));
        }

        return $data;
    }

    public static function sanitizeAParam($param){
        return trim(htmlspecialchars($param));
    }
}

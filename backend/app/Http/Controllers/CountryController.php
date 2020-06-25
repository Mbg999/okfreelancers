<?php

namespace App\Http\Controllers;

use App\Country;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CountryController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return response()->json([
            'ok' => true,
            'data' => Country::get()->pluck('name')
        ], Response::HTTP_OK);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Country  $country
     * @return \Illuminate\Http\Response
     */
    public function show($name)
    {
        $country = Country::where('name','like',$name)->firstOrFail();

        return response()->json([
            'ok' => true,
            'data' => $country->regions()->pluck('name')
        ], Response::HTTP_OK);
    }
}

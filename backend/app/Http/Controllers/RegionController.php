<?php

namespace App\Http\Controllers;

use App\Region;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RegionController extends Controller
{

    /**
     * Display the specified resource.
     *
     * @param  \App\Region  $region
     * @return \Illuminate\Http\Response
     */
    public function show($name) {
        $region = Region::where('name','like',$name)->firstOrFail();

        return response()->json([
            'ok' => true,
            'data' => $region->towns()->pluck('name')
        ], Response::HTTP_OK);
    }
}

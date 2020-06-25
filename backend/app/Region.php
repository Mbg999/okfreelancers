<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'country_id', 'name'
    ];

    public function country(){
        return $this->belongsTo('App\Country');
    }

    public function towns(){
        return $this->hasMany('App\Town');
    }
}

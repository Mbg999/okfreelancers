<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Town extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'region_id', 'name'
    ];

    public function region(){
        return $this->belongsTo('App\Region');
    }
}

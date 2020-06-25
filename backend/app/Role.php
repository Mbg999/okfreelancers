<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{

    protected $fillable = ['name', 'description'];

    protected $hidden = ['pivot', 'created_at', 'updated_at'];

    public function usuarios(){
        return $this->belongsToMany('App\User');
    }
}

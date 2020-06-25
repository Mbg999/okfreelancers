<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    public $timestamps = false;
    protected $fillable = [
      'freelancer_id', 'position', 'file',
      'title', 'description'
    ];

    public function freelancer(){
        return $this->belongsTo('App\Freelancer');
    }
}

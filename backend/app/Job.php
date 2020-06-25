<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    protected $fillable = [
        'project_id', 'freelancer_id', 'hours', 'price_hour',
        'finished', 'rate', 'assessment'
    ];

    public function project(){
        return $this->belongsTo('App\Project');
    }

    public function freelancer(){
        return $this->belongsTo('App\Freelancer');
    }
}

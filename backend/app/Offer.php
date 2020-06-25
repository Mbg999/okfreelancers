<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Offer extends Model {

    protected $fillable = [
      'project_id', 'freelancer_id', 'price',
        'approx_hours', 'approx_term', 'message',
        'company_deposit', 'freelancer_deposit'
    ];

    public function project(){
        return $this->belongsTo('App\Project');
    }

    public function freelancerProfile(){
        return $this->belongsTo('App\Freelancer', 'freelancer_id', 'id');
    }
}

<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Skill extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id', 'name_es', 'name_en',
        'description_es', 'description_en'
    ];

    public $hidden = [
        'pivot'
    ];

    public function category(){
        return $this->belongsTo('App\Category');
    }

    public function projects(){
        return $this->belongsToMany('App\Project');
    }

    public function projectsWithTrashed(){
        return $this->belongsToMany('App\Project')->withTrashed();
    }

    public function freelancerProfiles(){
        return $this->belongsToMany('App\Freelancer');
    }

    public function freelancerProfilesWithTrashed(){
        return $this->belongsToMany('App\Freelancer')->withTrashed();
    }
}

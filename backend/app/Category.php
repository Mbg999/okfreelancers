<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'father_id', 'name_es', 'name_en',
        'description_es', 'description_en', 'image',
        'title_color', 'text_color', 'background_color',
        'portfolio_type'
    ];

    protected $table = 'categories';

    public $hidden = [
        'pivot'
    ];

    public function subcategories(){
        return $this->hasMany('App\Category', 'father_id');
    }

    public function subcategoriesWithTrashed(){
        return $this->hasMany('App\Category', 'father_id')->withTrashed();
    }

    public function father(){
        return $this->belongsTo('App\Category', 'father_id', 'id')->withTrashed();
    }

    public function skills(){
        return $this->hasMany('App\Skill');
    }

    public function freelancerProfiles(){
        return $this->hasMany('App\Freelancer','category_id','id');
    }

    public function freelancerProfilesWithTrashed(){
        return $this->hasMany('App\Freelancer','category_id','id')->withTrashed();
    }

    public function projects(){
        return $this->belongsToMany('App\Project');
    }

    public function projectsWithTrashed(){
        return $this->belongsToMany('App\Project')->withTrashed();
    }
}

<?php

namespace App;

use App\Http\Controllers\TranslationController;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Freelancer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'category_id', 'title', 'description',
        'years_exp', 'approx_fee', 'advertisable', 'picture',
        'ban', 'ban_reason'
    ];

    public $hidden = [
        'pivot'
    ];

    public function user(){
        return $this->belongsTo('App\User');
    }

    public function userWithTrashed(){
        return $this->belongsTo('App\User','user_id')->withTrashed();
    }

    public function category(){
        return $this->belongsTo('App\Category');
    }

    public function skills(){
        return $this->belongsToMany('App\Skill')->join('categories','skills.category_id','=','categories.id')
            ->whereNull('categories.deleted_at')
            ->select(array_merge(['skills.id', 'categories.title_color', 'categories.background_color'], TranslationController::getTranslatedFields(true, '', 'skills.')));
    }

    public function portfolio(){
        return $this->hasMany('App\Portfolio')->orderBy('position', 'asc');
    }

    public function offers(){
        return $this->hasMany('App\Offer');
    }

    public function jobs(){
        return $this->hasMany('App\Job');
    }
}

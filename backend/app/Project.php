<?php

namespace App;

use App\Http\Controllers\TranslationController;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use SoftDeletes;

    protected $fillable = [
      'company_id', 'title', 'description', 'advertisable',
      'finished', 'budget', 'deposit', 'ban', 'ban_reason'
    ];

    public $hidden = [
        'pivot'
    ];

    public function company(){
        return $this->belongsTo('App\Company');
    }

    public function companyWithTrashed(){
        return $this->belongsTo('App\Company', 'company_id')->withTrashed();
    }

    public function categories(){
        return $this->belongsToMany('App\Category')->select(array_merge(['id', 'father_id', 'title_color', 'background_color'], TranslationController::getTranslatedFields()));
    }

    public function skills(){
        return $this->belongsToMany('App\Skill')
            ->join('categories','skills.category_id','=','categories.id')
            ->whereNull('categories.deleted_at')
            ->select(array_merge(['skills.id','categories.title_color', 'categories.background_color', 'categories.id as category_id'],
                TranslationController::getTranslatedFields(true, '', 'skills.')));
    }

    public function offers(){
        return $this->hasMany('App\Offer');
    }

    public function jobs(){
        return $this->hasMany('App\Job');
    }
}

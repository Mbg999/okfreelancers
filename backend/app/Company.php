<?php

namespace App;

use App\Notifications\BanNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use SoftDeletes;

    protected $fillable = [
      'user_id', 'name', 'description', 'logo',
      'address', 'address_description', 'zip', 'country',
      'region', 'town', 'web', 'github',
      'linkedin', 'twitter', 'ban', 'ban_reason'
    ];

    public function user(){
        return $this->belongsTo('App\User');
    }

    public function userWithTrashed(){
        return $this->belongsTo('App\User','user_id')->withTrashed();
    }

    public function projects(){
        return $this->hasMany('App\Project');
    }

    public function projectsWithTrashed(){
        return $this->hasMany('App\Project')->withTrashed();
    }
}

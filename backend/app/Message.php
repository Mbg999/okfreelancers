<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Message extends Model {

    protected $fillable = [
        'sender_id', 'receiver_id', 'text', 'read'
    ];

    public $timestamps = false;

    public function userSender(){
        return $this->belongsTo('App\User', 'sender_id');
    }

    public function userReceiver(){
        return $this->belongsTo('App\User', 'receiver_id');
    }
}

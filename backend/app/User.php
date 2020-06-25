<?php

namespace App;

//use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\AcceptedOfferNotification;
use App\Notifications\BanNotification;
use App\Notifications\CanceledJobNotification;
use App\Notifications\DeleteNotification;
use App\Notifications\PasswordResetEmail;
use App\Notifications\TransactionNotification;
use App\Notifications\VerifyEmail;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Cashier\Billable;

// JWTSubject interface, for JWT usage
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable, SoftDeletes, Billable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'email', 'password', 'name', 'surnames',
        'born_date', 'phone', 'balance', 'address',
        'address_description', 'zip', 'town', 'region',
        'country', 'github', 'linkedin', 'picture',
        'twitter', 'last_password_update', 'email_verified_at',
        'ban', 'ban_reason'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'last_password_update', 'pivot',
        'stripe_id ', 'card_brand ', 'card_last_four ', 'trial_ends_at'
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // for soft delete purpose
    protected $dates = [
        'deleted_at'
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     * https://medium.com/@viralsolani/how-to-set-custom-payload-claims-on-laravel-jwt-dcd293fe30fa
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [
            'email' => $this->email,
            'lpu' => $this->last_password_update
        ];
    }

    public function roles(){
        return $this->belongsToMany('App\Role')->select('id', 'name')->orderBy('name');
    }

    public function messagesSents(){
        return $this->hasMany('App\Message', 'sender_id', 'id');
    }

    public function messagesReceived(){
        return $this->hasMany('App\Message', 'receiver_id', 'id');
    }

    public function groups(){
        return $this->belongsToMany('App\Group')->whereNull('group_user.deleted_at')
            ->select('groups.*','group_user.created_at as joined_at');
    }

    public function groupMessages(){
        return $this->hasMany('App\GroupMessage');
    }

    public function company(){
        return $this->hasOne('App\Company');
    }

    public function companyWithTrashed(){
        return $this->hasOne('App\Company')->withTrashed();
    }

    public function freelancerProfiles(){
        return $this->hasMany('App\Freelancer','user_id','id');
    }

    public function freelancerProfilesWithTrashed(){
        return $this->hasMany('App\Freelancer','user_id','id')->withTrashed();
    }

    public function verification(){
        return $this->hasOne('App\Verification');
    }

    public function transactions(){
        return $this->hasMany('App\Transaction');
    }

    /**
     * Determines if an user has a role
     *
     * @param User $user
     * @param Role $role
     * @return bool
     */
    public function hasRole($roleid){
        foreach ($this->roles as $r){
            if($r['id'] == $roleid){
                return true;
            }
        }
        return false;
    }

    public function sendEmailVerificationNotification() {
        $this->notify(new VerifyEmail($this->name, $this->verification->token));
    }

    public function sendPasswordResetNotification($token) {
        $this->notify(new PasswordResetEmail($this->name, $this->email, $token));
    }

    public function sendDeleteNotification($type, $text){
        $this->notify(new DeleteNotification($type, $this->name, $text));
    }

    public function sendBanNotification($type, $text, $ban_reason=null){
        $this->notify(new BanNotification($type, $this->email, $this->name, $text, $ban_reason));
    }

    public function sendTransactionNotification($type, $amount, $pay, $description, $note){
        $this->notify(new TransactionNotification($type, $this->name, $amount, $pay, $description, $note));
    }

    public function sendOfferAcceptedNotification($type, $freelancer, $project, $name){
        $this->notify(new AcceptedOfferNotification($type, $freelancer, $project, $name));
    }

    public function sendCancelledJobNotification($by, $receiver, $project, $freelancer, $refound, $penalty, $company=null){
        $this->notify(new CanceledJobNotification($this->name, $by, $receiver, $project, $freelancer, $refound, $penalty, $company));
    }
}

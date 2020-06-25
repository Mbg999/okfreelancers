<?php

namespace App\Http\Controllers;

use App\Role;
use App\User;
use App\Verification;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    /**
     * Register a new User
     * it sends a verification email
     *
     * @return JSON response
     */
    public function register() {
        $validator = Validator::make(request()->all(), [
            'email' => 'required|string|email|max:191|unique:users',
            'password' => [
                'required',
                'string',
                'min:6',
                // min 6 chars, at least one lowercase letter, one uppercase letter, one number, one special char
                'regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?á-üÁ-Ü!@$%^&*-]).{6,}$/',
                'confirmed'
            ],
            'name' => 'required|string|min:2|max:100',
            'surnames' => 'required|string|min:2|max:100',
            'born_date' => 'required|date|before:-18 years'
        ], ['before' => trans('miscellaneous.too_young')]);

        if($validator->fails()){
            return response()->json([
                'ok' => false,
                'errors' => $validator->errors()->jsonSerialize(),
                'status' => 'Bad Request'
            ],Response::HTTP_BAD_REQUEST);
        }

        $user = User::create([
            'email' => request()->get('email'),
            'password' => Hash::make(request()->get('password')),
            'name' => request()->get('name'),
            'surnames' => request()->get('surnames'),
            'born_date' => request()->get('born_date')
        ]);

        Verification::create([
            'user_id' => $user->id,
            'token' => Str::random(30)
        ]);

        $user->sendEmailVerificationNotification();

        return response()->json([
            'ok'=> true,
            'message'=> trans('auth.registered_msg')
        ], Response::HTTP_CREATED);
    }

    /**
     * Resend a new verification email to an user
     *
     * @param User $user
     * @return JSON response
     */
    public function resendVerificationEmail(){
        $validator = Validator::make(request()->all(), [
            'email' => 'required|string|email'
        ]);

        if($validator->fails()){
            return response()->json([
                'ok' => false,
                'errors' => $validator->errors()->jsonSerialize(),
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $user = User::where('email', 'like', request()->get('email'))->firstOrFail();


        if(isset($user) && !$user->hasVerifiedEmail()){
            $user->verification()->update(['token' => Str::random(30)]); // change token for security reasons
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'ok' => true,
            'message' => trans('auth.new_token_send')
        ], Response::HTTP_OK);
    }

    /**
     * Verify an user
     *
     * @param $token string
     * @return JSON response
     */
    public function verifyUser($token){
        $verification = Verification::where('token', 'like', $token)->first();

        if(empty($verification)){
            return response()->json([
                'ok' => false,
                'message' => trans('auth.invalid_verification_token'),
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $user = $verification->user;

        $user->markEmailAsVerified();
        $user->verification()->delete();

        return response()->json([
            'ok' => true,
            'message' => trans('auth.correclty_verified')
        ], Response::HTTP_OK);
    }

    /**
     * login with credentials: email and password
     * only verified users, it checks if the user is banned
     * also checks for a hardcoded user
     *
     * @return JSON response
     */
    public function login() {
        $validator = Validator::make(request()->all(), [
            'email' => 'required|string|email|max:255',
            'password' => 'required|string',
        ]);

        if($validator->fails()){
            return response()->json([
                'ok' => false,
                'errors' => $validator->errors()->jsonSerialize(),
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        // login() -> instance of App\User as param
        // attempt() -> credentials as param, validates them vs the db, if exists, returns a token
        if($token = auth()->attempt(request()->only('email', 'password'))){
            if(auth()->user()->hasVerifiedEmail()){ // only verified users
                return $this->respondWithToken($token);
            }
            return response()->json([
                'ok' => false,
                'errors' => ['verify' => trans('auth.not_verified_msg')],
                'status' => 'Unauthorized'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // check for rehabilitate account request
        if(request()->get('email') != 'okfreelancers@gmail.com'){ // not the hardcoded user
            $user = User::withTrashed()
                ->where('email','like', request()->get('email'))
                ->first();

            if(isset($user) && isset($user->deleted_at)){
                if($user->ban > 0){ // its a ban user
                    return response()->json([
                        'ok' => false,
                        'errors' => trans('auth.banned_account'),
                        'status' => 'Unauthorized'
                    ], Response::HTTP_UNAUTHORIZED);
                }

                $user->restore(); // rehabilitate account, its needed to attempt
                if($token = auth()->attempt(request()->only('email', 'password'))){
                    if(auth()->user()->hasVerifiedEmail()){ // only verified users
                        return $this->respondWithToken($token);
                    }
                }
            }
        }


        // hardcoded user + admin role, its saved into bdd for jwt reasons
        // with this way, this admin has 2 posible passwords, the bdd one and the hardcoded one
        if(request()->get('email') == 'okfreelancers@gmail.com' && request()->get('password') == 'Usuario0?'){ // reforzar password al pasar a produccion
            $user = User::withTrashed()->where('email', 'like', 'okfreelancers@gmail.com')->first();
            if(isset($user->deleted_at)){
                $user->restore();
                $user->update(['ban' => false, 'ban_reason' => null]);
            }
            if(empty($user)){
                $adminRole = Role::find(42);
                if(empty($adminRole)){
                    Role::create([
                        'name' => 'company',
                        'description' => 'Company privileges for OkFreelancers'
                    ]);
                    Role::create([
                        'name' => 'freelancer',
                        'description' => 'Freelancer privileges for OkFreelancers'
                    ]);
                    $admin = new Role();
                    $admin->id = 42; // https://www.google.com/search?sxsrf=ALeKk00DUSjlTEUfO5sFBE2fC5UbNRZtTA%3A1585955283683&ei=08GHXryjKcngUZDRhdAJ&q=the+answer+to+life+the+universe+and+everything&oq=the+ans&gs_lcp=CgZwc3ktYWIQAxgAMgQIABBDMgUIABCDATICCAAyAggAMgIIADICCAAyAggAMgUIABDLATICCAAyAggAOgQIABBHOgQIIxAnOgcIABCDARBDSiQIFxIgMGcxMjdnMTIwZzExNGc5NmcxMDFnMTEwZzg3ZzEyLTdKGAgYEhQwZzFnMWcxZzFnMWcxZzFnMTItMVCZJ1ihLWCmNWgAcAF4AIABcYgBsAWSAQM0LjOYAQCgAQGqAQdnd3Mtd2l6&sclient=psy-ab
                    // they will expect admin at id 1
                    $admin->name = 'administrator';
                    $admin->description = 'Administrator privileges for OkFreelancers application';
                    $admin->save();
                    $adminRole = $admin->id;
                }
                $user = User::find(User::create([
                    'email' => 'okfreelancers@gmail.com',
                    'password' => Hash::make('Usuario0?'),
                    'name' => 'admin',
                    'surnames' => 'user',
                    'born_date' => '1999-02-06',
                    'email_verified_at' => Date::now()
                ])->id); // User::create does not returns default fields
                $user->roles()->attach($adminRole);
            }
            return $this->respondWithToken(auth()->login($user));
        }

        return response()->json([
            'ok' => false,
            'errors' => trans('auth.invalid_credentials'),
            'status' => 'Bad Request'
        ], Response::HTTP_BAD_REQUEST);
    }

    /**
     * Logout, it invalidates the token used to logout
     * not logged out tokens are still working for their sessions
     *
     * @return JSON response
     */
    public function logout() {
        auth()->logout();
        return response()->json([
            'ok' => true,
            'message' => trans('auth.logout')
        ], Response::HTTP_OK);
    }

    /**
     * Get authenticated User data
     *
     * @return JSON response
     */
    public function me() {
        auth()->user()->roles;
        return response()->json([
            'ok' => true,
            'data' => auth()->user()
        ], Response::HTTP_OK);
    }

    /**
     * Get the extra data included into the token
     *
     * @return JSON response
     */
    public function payload() {
        return response()->json([
            'ok' => true,
            'data' => auth()->payload()
        ], Response::HTTP_OK);
    }

    /**
     * Revoke token and generates a new one
     *
     * @return JSON response
     */
    public function refresh() {
        return $this->respondWithToken(auth()->refresh());
    }

    /**
     * Response with token and user data
     *
     * @param $token JWT
     * @return JSON response
     */
    public function respondWithToken($token) {
        auth()->user()->roles;

        return response()->json([
            'ok' => true,
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => auth()->factory()->getTTL(),
                'user' => auth()->user(),

            ]
        ], Response::HTTP_OK);
    }
}

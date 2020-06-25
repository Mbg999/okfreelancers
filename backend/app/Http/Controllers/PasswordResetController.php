<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class PasswordResetController extends Controller
{
    /**
     * If the email requested exists, it stores a token into password_resets table
     * and send an email with a link who adds the email + token necesary
     * for reset the password
     *
     * @return JSON response
     */
    public function sendPasswordReset(){
        $validator = Validator::make(request()->all(), [
            'email' => 'required|string|email|max:191'
        ]);

        if($validator->fails()){
            return response()->json([
                'ok' => false,
                'errors' => $validator->errors()->jsonSerialize(),
                'status' => 'Bad Request'
            ],Response::HTTP_BAD_REQUEST);
        }

        $user = User::where('email', 'like', request()->email)->first();
        if(isset($user)){
            Password::sendResetLink(request()->only('email'));
        }
        return response()->json([
            'ok' => true,
            'message' => trans('passwords.password_reset_sent')
        ], Response::HTTP_OK);
    }

    /**
     * Tests the request necesary parameters and try the email+token,
     * if they are ok, the password will be reset
     *
     * @return JSON response
     */
    public function resetPassword() {
        $validator = Validator::make(request()->all(), [
            'email' => 'required|string|email',
            'token' => 'required|string',
            'password' => [
                'required',
                'string',
                'min:6',
                // min 6 chars, at least one lowercase letter, one uppercase letter, one number, one special char
                'regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?á-üÁ-Ü!@$%^&*-.]).{6,}$/',
                'confirmed'
            ]
        ]);

        if ($validator->fails()) {
            return response()->json([
                'ok' => false,
                'errors' => $validator->errors()->jsonSerialize(),
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $result = Password::reset(request()->all(), function ($user, $newPassword) {
            $user->update(['password' => Hash::make($newPassword), 'last_password_update' => Date::now()]);
        });

        if($result != 'passwords.reset'){
            return response()->json([
                'ok' => false,
                'message' => trans('passwords.invalid_password_reset'),
                'status' => 'Bad Request'
            ],Response::HTTP_BAD_REQUEST);
        }

        return response()->json([
            'ok' => true,
            'message' => trans('passwords.valid_password_reset')
        ],Response::HTTP_OK);
    }
}

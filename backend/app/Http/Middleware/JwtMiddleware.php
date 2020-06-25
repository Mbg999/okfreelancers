<?php

namespace App\Http\Middleware;

use App\User;
use Closure;
use JWTAuth;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Http\Middleware\BaseMiddleware;

class JwtMiddleware extends BaseMiddleware
{
    /**
     * Handle an incoming request.
     * This validates if the passed token is valid
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next) {
        try {

            if(!JWTAuth::parseToken()->authenticate() ||
                // looking for email or password update
               auth()->user()->email != auth()->payload()['email'] ||
               auth()->user()->last_password_update != auth()->payload()['lpu']){

                if(User::withTrashed()->where('email','like',auth()->payload()['email'])->firstOrFail()){ // check for if banned
                    return $this->responseErrorStatus(trans('auth.banned_account'));
                }
                return $this->responseErrorStatus(trans('auth.token_invalid'));
            }

        } catch (TokenExpiredException $ex){
            return $this->responseErrorStatus(trans('auth.token_expired'));
        } catch (TokenInvalidException $ex) {
            return $this->responseErrorStatus(trans('auth.token_invalid'));
        } catch (JWTException $ex) {
            return $this->responseErrorStatus(trans('auth.token_not_found'));
        }

        return $next($request);
    }

    private function responseErrorStatus($status) {
        return response()->json([
            'ok' => false,
            'status' => $status,
            'auth' => true
        ], Response::HTTP_BAD_REQUEST);
    }
}

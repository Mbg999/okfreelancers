<?php

namespace App\Http\Controllers;

use App\Role;
use App\User;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller {

    private static $pathPicture = 'assets/images/users/pictures';

    public static function getPathPicture(){
        return self::$pathPicture;
    }

    /**
     * get all the users
     * only admin
     *
     * @return JSON response
     */
    public function getUsers(){
        return response()->json([
            'ok' => true,
             'data' => User::withTrashed()
                 ->select('id','email','name','surnames','email_verified_at', DB::raw('balance > 0 as balance'), 'ban','ban_reason','deleted_at')
                 ->where('email','not like','okfreelancers@gmail.com')
                 ->orderBy('created_at', 'desc')
                 ->get()
        ], Response::HTTP_OK);
    }

    /**
     * Display the specified resource.
     * all can see this, do not show confidential information
     *
     * @param  User $user
     * @return JSON response
     */
    public function showById(User $user) {
        return response()->json([
            'ok' => true,
            'data' => $user->makeHidden(['balance', 'token',
                'updated_at', 'deleted_at', 'email_verified_at', 'ban', 'ban_reason', 'born_date'])
        ], Response::HTTP_OK);
    }

    /**
     * Display the specified resource.
     * all can see this, do not show confidential information
     *
     * @param  $email
     * @return JSON response
     */
    public function showByEmail($email) {
        $user = User::where('email','like',$email)->firstOrFail();
        return response()->json([
            'ok' => true,
            'data' => $user->makeHidden(['balance', 'token',
                'updated_at', 'deleted_at', 'email_verified_at', 'ban', 'ban_reason', 'born_date'])
        ], Response::HTTP_OK);
    }

    /**
     * Display all the data from the specified resource.
     * only admin
     *
     * @param  $id
     * @return JSON response
     */
    public function showAsAdmin($id) {
        $user = User::withTrashed()->findOrFail($id);
        $user['roles'] = $user->roles;

        return response()->json([
            'ok' => true,
            'data' => $user
        ], Response::HTTP_OK);
    }

    /**
     * Search user by email
     * only admin
     *
     * @param  $search
     * @return JSON response
     */
    public function searchByEmailAsAdmin($search){
        $users = User::withTrashed()->where('email','like',"%$search%")->get();

        return response()->json([
            'ok' => true,
            'data' => $users
        ], Response::HTTP_OK);
    }

    /**
     * Update the auth user profile.
     * Token is acutomatically updated, so it's not need to refresh it
     *
     * @return JSON response
     */
    public function updateAsAuth() {
        return $this->update(0, auth()->user());
    }

    /**
     * Update a choosen user profile.
     * Token is acutomatically updated, so it's not need to refresh it
     * only admin
     *
     * @return JSON response
     */
    public function update($id, User $user=null){
        if(!isset($user)){
            $user = User::withTrashed()->findOrFail($id);
        }
        $data = $this->validateUser();
        $need_reauth = false;

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        if(isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
            $data['last_password_update'] = Date::now();
            $need_reauth = true;
        }

        if(isset($data['email'])){
            $need_reauth = true;
        }

        $user->update($data);
        $user->roles;

        return response()->json([
            'ok' => true,
            'message' =>  trans('miscellaneous.updated'),
            'need_reauth' => $need_reauth,
            'data' => $user
        ], Response::HTTP_OK);
    }

    /**
     * Adds the freelancer role to auth user
     *
     * @return JSON response
     */
    public function addFreelancerRole(){
        if(auth()->user()->hasRole(2)){
            return response()->json([
                'ok' => false,
                'message' => trans('auth.role_already_added'),
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        auth()->user()->roles()->attach(2);

        return response()->json([
            'ok' => true,
            'message' => trans('auth.role_added')
        ], Response::HTTP_OK);
    }

    /**
     * Removes the freelancer role to auth user
     *
     * @return JSON response
     */
    public function removeFreelancerRole(){
        auth()->user()->roles()->detach(2);

        return response()->json([
            'ok' => true,
            'message' => trans('auth.role_removed')
        ], Response::HTTP_OK);
    }

    /**
     * Adds the company role to auth user
     *
     * @return JSON response
     */
    public function addCompanyRole(){
        if(auth()->user()->hasRole(1)){
            return response()->json([
                'ok' => false,
                'message' => trans('auth.role_already_added'),
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        auth()->user()->roles()->attach(1);

        return response()->json([
            'ok' => true,
            'message' => trans('auth.role_added')
        ], Response::HTTP_OK);
    }

    /**
     * Removes the company role to auth user
     *
     * @return JSON response
     */
    public function removeCompanyRole(){
        auth()->user()->roles()->detach(1);

        return response()->json([
            'ok' => true,
            'message' => trans('auth.role_removed')
        ], Response::HTTP_OK);
    }

    /**
     * Adds any role to any user
     * only admin
     *
     * @return JSON response
     */
    public function addRoleAsAdmin($id, Role $role){
        $user = User::withTrashed()->findOrFail($id);
        if($user->hasRole($role->id)){
            return response()->json([
                'ok' => false,
                'message' => trans('auth.role_already_added'),
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $user->roles()->attach($role);

        return response()->json([
            'ok' => true,
            'message' => trans('auth.role_added')
        ], Response::HTTP_OK);
    }

    /**
     * Removes any role to any user
     *
     * @return JSON response
     */
    public function removeRoleAsAdmin($id, Role $role){
        $user = User::withTrashed()->findOrFail($id);

        if(!$user->hasRole($role->id)){
            return response()->json([
                'ok' => false,
                'message' => trans('auth.missing_role'),
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $user->roles()->detach($role);

        return response()->json([
            'ok' => true,
            'message' => trans('auth.role_removed')
        ], Response::HTTP_OK);
    }

    /**
     * deactivate
     * user implements soft delete
     *
     * @return JSON response
     */
    public function deactivateAsAuth() {
        return $this->deactivate(0, auth()->user(),'');
    }

    /**
     * disable
     * user implements soft delete
     * only admin
     *
     * @return JSON response
     */
    public function deactivate($id, User $user=null, $postfix='_admin') {
        if(!isset($user)){
            $user = User::withTrashed()->findOrFail($id);
        }

        $freelancers = $user->freelancerProfiles;
        if(isset($freelancers)){
            $pending_jobs = 0;
            $unfinished_jobs = 0;
            foreach ($freelancers as $freelancer){
                $pending_jobs += $freelancer->offers()->where('company_deposit','>',0)->where('freelancer_deposit','=',0)->select(DB::raw('count(*) as count'))->first()['count'];
                $unfinished_jobs += $freelancer->jobs()->whereNull('finished')->select(DB::raw('count(*) as count'))->first()['count'];
            }

            if($unfinished_jobs > 0 || $pending_jobs > 0){
                $count = $unfinished_jobs+$pending_jobs;
                return response()->json([
                    'ok' => false,
                    'errors' => ['pending' => ($count > 1) ? trans("validation.unfinished_jobs$postfix", ['count' => $count]) : trans("validation.unfinished_job$postfix")],
                    'status' => 'Bad Request'
                ], Response::HTTP_UNAUTHORIZED);
            }
        }

        $company = $user->company;
        if(isset($company)){
            $unfinished_projects = $company->projects()->whereNull('finished')->whereNull('deleted_at')->select(DB::raw('count(*) as count'))->first()['count'];

            if($unfinished_projects > 0){
                return response()->json([
                    'ok' => false,
                    'errors' => ['pending' => ($unfinished_projects > 1) ? trans("validation.unfinished_projects$postfix", ['count' => $unfinished_projects]) : trans("validation.unfinished_project$postfix")],
                    'status' => 'Bad Request'
                ], Response::HTTP_UNAUTHORIZED);
            }
        }

        if($postfix == '_admin'){
            $ban_reason = request()->get('ban_reason') ?? trans('miscellaneous.no_reason');
            $user->update(['ban' => true, 'ban_reason' => $ban_reason]);
            $user->sendBanNotification('ban', trans('emails.ban.ban.account'), $ban_reason);
        }

        $user->delete();
        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.disabled')
        ], Response::HTTP_OK);
    }

    /**
     * activate
     * user implements soft delete
     *
     * desuso, se vuelve a activar con solo hacer login
     *
     * @return JSON response
     */
    public function activateAsAuth($id) {
        return $this->activate(0, auth()->user());
    }

    /**
     * enable
     * Skill implements soft delete
     * only admin
     *
     * @return JSON response
     */
    public function activate($id, User $user=null) {
        if(!isset($user)){
            $user = User::withTrashed()->findOrFail($id);
            $user->update(['ban' => false, 'ban_reason' => null]);
            $user->sendBanNotification('rehabilitate', trans('emails.ban.rehabilitate.account'));
        }
        $user->restore();
        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.enabled')
        ], Response::HTTP_OK);
    }

    /**
     * Remove the auth user from storage.
     * User implements soft delete
     *
     * @return JSON response
     */
    public function destroyAsAuth($emailForPaypalPayment) {
        return $this->destroy(0, $emailForPaypalPayment, auth()->user(), trans('emails.delete.user.text', ['email' => $emailForPaypalPayment]),'');
    }

    /**
     * Remove any user from storage.
     * User implements soft delete
     * only admin
     *
     * @return JSON response
     */
    public function destroy($id, $emailForPaypalPayment, User $user=null, $notifText=null, $postfix='_admin') {
        if(!isset($user)){
            $user = User::withTrashed()->findOrFail($id);
        }

        $freelancers = $user->freelancerProfiles;
        if(isset($freelancers)){
            $pending_jobs = 0;
            $unfinished_jobs = 0;
            foreach ($freelancers as $freelancer){
                $pending_jobs += $freelancer->offers()->where('company_deposit','>',0)->where('freelancer_deposit','=',0)->select(DB::raw('count(*) as count'))->first()['count'];
                $unfinished_jobs += $freelancer->jobs()->whereNull('finished')->select(DB::raw('count(*) as count'))->first()['count'];
            }

            if($unfinished_jobs > 0 || $pending_jobs > 0){
                $count = $unfinished_jobs+$pending_jobs;
                return response()->json([
                    'ok' => false,
                    'errors' => ['pending' => ($count > 1) ? trans("validation.unfinished_jobs$postfix", ['count' => $count]) : trans("validation.unfinished_job$postfix")],
                    'status' => 'Bad Request'
                ], Response::HTTP_UNAUTHORIZED);
            }
        }

        $company = $user->company;
        if(isset($company)){
            $unfinished_projects = $company->projects()->whereNull('finished')->whereNull('deleted_at')->select(DB::raw('count(*) as count'))->first()['count'];

            if($unfinished_projects > 0){
                return response()->json([
                    'ok' => false,
                    'errors' => ['pending' => ($unfinished_projects > 1) ? trans("validation.unfinished_projects$postfix", ['count' => $unfinished_projects]) : trans("validation.unfinished_project$postfix")],
                    'status' => 'Bad Request'
                ], Response::HTTP_UNAUTHORIZED);
            }
        }

        if($postfix == '_admin'){
            $notifText = trans('emails.delete.user.admin_text', ['email' => $emailForPaypalPayment]);
        }

        UploadController::removeOldFile(self::getPathPicture(), $user->picture);

        if(isset($user->company)){
            UploadController::removeOldFile(CompanyController::getPathLogo(), $user->company->logo);
        }

        foreach ($user->freelancerProfilesWithTrashed as $freelancer){
            UploadController::removeOldFile(FreelancerController::getPathPicture(), $freelancer->picture);
            foreach ($freelancer->portfolio as $portfolio){
                $path = PortfolioController::determinePathByType($freelancer->category->portfolio_type);
                UploadController::removeOldFile($path, $portfolio->file);
            }
        }

        if($user->balance > 0){
            TransactionController::withdrawBalanceWithPaypal(
                $user,
                $user->balance,
                $emailForPaypalPayment,
                trans('miscellaneous.acc_close_payment')
            );
        }

        $user->sendDeleteNotification('user',$notifText);
        $user->forceDelete();

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.deleted')
        ], Response::HTTP_OK);
    }

    /**
     * Validates the request params for update an user
     *
     * @return \Illuminate\Contracts\Validation\Validator
     */
    private function validateUser() {
        $data = request()->only([
            'email', 'password', 'password_confirmation',
            'name', 'surnames', 'born_date', 'phone',
            'balance', 'address', 'address_description', 'zip',
            'town', 'region', 'country', 'github',
            'linkedin', 'twitter'
        ]);

         $validator = Validator::make($data, [
            'email' => 'string|email|max:191|unique:users',
            'password' => [
                'string',
                'min:6',
                // min 6 chars, at least one lowercase letter, one uppercase letter, one number, one special char
                'regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?á-üÁ-Ü!@$%^&*-.:]).{6,}$/',
                'confirmed'
            ],
            'name' => 'string|min:2|max:100',
            'surnames' => 'string|min:2|max:100',
            'born_date' => 'date|before:-18 years',
            'phone' => 'string|min:9|max:25', // +34 666777888
            'balance' => 'numeric|min:0|max:99999999.99',
            'address' => 'string|min:1|max:100',
            'address_description' => 'string|min:1|max:500',
            'zip' => 'string|between:4,12', // diferent countries has diferent zip lenght
            'town' => 'string|min:2|max:80',
            'region' => 'string|min:2|max:80',
            'country' => 'string|min:2|max:80',
            'github' => 'string|min:20|max:100',
            'linkedin' => 'string|min:20|max:100',
            'twitter' => 'string|min:20|max:100'
        ], ['before' => trans('validation.too_young')]);

        if($validator->fails()){
            return ['errors' => $validator->errors()->jsonSerialize()];
        }

         return $data;
    }


}

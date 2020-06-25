<?php

namespace App\Http\Controllers;

use App\Company;
use App\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class CompanyController extends Controller
{

    private static $pathLogo = 'assets/images/companies/logos';

    public static function getPathLogo(){
        return self::$pathLogo;
    }

    /**
     * Return the companies data
     *
     * @return JSON response
     */
    public function getCompanies(){
        return response()->json([
            'ok' => true,
            'data' => Company::join('users', 'companies.user_id','=','users.id')
                ->select('companies.id','companies.user_id', 'users.email','companies.name',
                    'companies.description', 'companies.logo', 'companies.town', 'companies.region',  'companies.country',
                    'companies.web', 'companies.github', 'companies.linkedin', 'companies.twitter')
                ->orderBy('companies.created_at', 'desc')
                ->get()
        ], Response::HTTP_OK);
    }

    /**
     * Return the companies data as admin
     * only admin
     *
     * @return JSON response
     */
    public function getCompaniesAsAdmin(){
        return response()->json([
            'ok' => true,
            'data' => Company::withTrashed()
                ->join('users', 'companies.user_id','=','users.id')
                ->select('companies.id', 'companies.user_id', 'users.email', 'companies.name','companies.deleted_at', 'companies.ban_reason')
                ->orderBy('companies.created_at', 'desc')
                ->get()
        ], Response::HTTP_OK);
    }

    /**
     * Return one company data
     *
     * @param  \App\Company  $company
     * @return JSON response
     */
    public function show($name){
        $company = Company::where('name','like',$name)
            ->firstOrFail();
        return response()->json([
            'ok' => true,
            'data' => [
                'company' => $company,
                'user' => $company->user()->select(['id', 'email', 'name', 'surnames', 'picture'])->firstOrFail()
            ]
        ], Response::HTTP_OK);
    }

    /**
     * Uses the showWithTrashed method, but instead of an id, it uses the auth user company as param
     * it does not just pass the id for the simple reason of save one sql request
     * only auth
     *
     * @return JSON response
     */
    public function showWithTrashedAsAuth(){
        // only if the user is the owner of that profile, if the user has no company, this throw the 404
        return $this->showWithTrashed(0, auth()->user()->companyWithTrashed()->firstOrFail());
    }

    /**
     * Return one company data, including the with trashed ones (soft deleted)
     *
     * @param  $id
     * @param Company $company=null
     * @return JSON response
     */
    public function showWithTrashed($id, Company $company=null){
        if(!isset($company)){
            $company = Company::withTrashed()->findOrFail($id);
        }

        return response()->json([
            'ok' => true,
            'data' => $company
        ], Response::HTTP_OK);
    }

    /**
     * Returns the company data of a user, it search by email
     *
     * @param $email
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCompanyByUser($email){
        return response()->json([
            'ok' => true,
            'data' => User::where('email','like',$email)->firstOrFail()->company()->select('id','user_id','name','description',
                'logo','town','region','country','web','github','linkedin','twitter')
                ->firstOrFail()
        ], Response::HTTP_OK);
    }

    /**
     * Returns the company data of a user, it seach by id
     * it returns also the withtrashed ones (soft deleted)
     * only admin
     *
     * @param $id
     * @return JSON response
     */
    public function getCompanyByUserAsAdmin($id){
        return response()->json([
            'ok' => true,
            'data' => User::withTrashed()->findOrFail($id)->companyWithTrashed()
                ->join('users', 'companies.user_id','=','users.id')
                ->select('companies.id', 'users.email', 'companies.name','companies.deleted_at')
                ->get()
        ], Response::HTTP_OK);
    }

    /**
     * uses the store method for store a company with the auth user id
     * only auth
     *
     * @return JSON response
     */
    public function storeAsAuth(){
        request()->request->add(['user_id' => auth()->user()->id]);
        return $this->store();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return JSON response
     */
    public function store(){
        $data = $this->validateCompany();

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        if(isset($data['logo'])){ // image uploading
            $image = UploadController::uploadImage('logo', self::getPathLogo());

            if(isset($image['errors'])){
                return response()->json([
                    'ok' => false,
                    'errors' => $image['errors'],
                    'status' => 'Bad Request'
                ], Response::HTTP_BAD_REQUEST);
            }

            $data['logo'] = $image['logo'];
        }

        $company = Company::join('users', 'companies.user_id','=','users.id')
            ->select('companies.*', 'users.email')
            ->find(Company::create($data)->id);


        $company->userWithTrashed->roles()->attach(1); // add company role
        unset($company->userWithTrashed); // i dont want to return the user data

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.created'),
            'data' => $company
        ], Response::HTTP_CREATED);
    }

    /**
     * Uses the update method, for update the company associated with the auth user id
     * only auth
     *
     * @return JSON response
     */
    public function updateAsAuth(){
        // only if the user is the owner of that profile, if the user has no company, this throw the 404
        return $this->update(0,
            auth()->user()->companyWithTrashed()
                ->join('users', 'companies.user_id','=','users.id')
                ->select('companies.*', 'users.email')
                ->firstOrFail()
            );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param $id
     * JSON response
     */
    public function update($id, Company $company=null) {
        if(!isset($company)){
            $company = Company::withTrashed()
                ->join('users', 'companies.user_id','=','users.id')
                ->select('companies.*', 'users.email')
                ->findOrFail($id);
        }

        $data = $this->validateCompany('');

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        if(isset($data['logo'])){ // image uploading
            $logo = UploadController::uploadImage('logo', self::getPathLogo(), $company->logo);

            if(isset($logo['errors'])){
                return response()->json([
                    'ok' => false,
                    'errors' => $logo['errors'],
                    'status' => 'Bad Request'
                ], Response::HTTP_BAD_REQUEST);
            }
            $data['logo'] = $logo['logo'];
        }

        $company->update($data);

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.updated'),
            'data' => $company
        ], Response::HTTP_OK);
    }

    /**
     * Deactivate the user auth company using the deactivate method
     * Company implements soft delete
     * only auth
     *
     * @return JSON response
     */
    public function deactivateAsAuth(){
        // only if the user is the owner of that profile, if the user has no company, this throw the 404
        return $this->deactivate(0, auth()->user()->companyWithTrashed()->firstOrFail(),'');
    }

    /**
     * deactivate
     * Company implements soft delete
     *
     * if this method is called by an admin with the id param,
     * this company will get banned and the user will get notificated via email
     *
     * @param  $id
     * @return JSON response
     */
    public function deactivate($id, Company $company=null, $postfix='_admin') {
        if(!isset($company)){
            $company = Company::withTrashed()->findOrFail($id);
        }

        $unfinished_projects = $company->projects()->whereNull('finished')->whereNull('deleted_at')->select(DB::raw('count(*) as count'))->first()['count'];

        if($unfinished_projects > 0){
            return response()->json([
                'ok' => false,
                'errors' => ['pending' => ($unfinished_projects > 1) ? trans("validation.unfinished_projects$postfix", ['count' => $unfinished_projects]) : trans("validation.unfinished_project$postfix")],
                'status' => 'Bad Request'
            ], Response::HTTP_UNAUTHORIZED);
        }

        if($postfix == '_admin'){
            $ban_reason = request()->get('ban_reason') ?? trans('miscellaneous.no_reason');
            $company->update(['ban' => true, 'ban_reason' => $ban_reason]);
            $company->userWithTrashed->sendBanNotification('ban', trans('emails.ban.ban.company'), $ban_reason);
        }

        $company->delete();

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.deactivated')
        ], Response::HTTP_OK);
    }

    /**
     * Activate the user auth company using the activate method
     * Company implements soft delete, this restores the deleted company
     * only auth
     *
     * @return JSON response
     */
    public function activateAsAuth(){
        // only if the user is the owner of that profile, if the user has no company, this throw the 404
        return $this->activate(0, auth()->user()->companyWithTrashed()->firstOrFail());
    }

    /**
     * activate
     * Company implements soft delete, this restores the deleted company
     *
     * if this method is called by an admin with the id param,
     * this company will get rehabilitated and the user will get notificated via email
     *
     * @param  $id
     * @return JSON response
     */
    public function activate($id, Company $company=null) {
        if(!isset($company)){
            $company = Company::withTrashed()->findOrFail($id);
            $company->update(['ban' => false, 'ban_reason' => null]);
            $company->userWithTrashed->sendBanNotification('rehabilitate', trans('emails.ban.rehabilitate.company'));
        }
        $company->restore();

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.activated')
        ], Response::HTTP_OK);
    }

    /**
     * Uses the destroy method for delete the company associated with the auth user id from storage
     * only auth
     *
     * @return JSON response
     */
    public function destroyAsAuth(){
        // only if the user is the owner of that profile, if the user has no company, this throw the 404
        return $this->destroy(0, auth()->user()->companyWithTrashed()->firstOrFail(), trans('emails.delete.company.text'),'');
    }

    /**
     * force delete from storage
     * take care with delete on cascade,
     * this option should only be used in really safe cases
     *
     * @param  $id
     * @return JSON response
     */
    public function destroy($id, Company $company=null, $notifText=null, $postfix='_admin') {
        if(!isset($company)){
            $company = Company::withTrashed()->findOrFail($id);
        }

        $unfinished_projects = $company->projects()->whereNull('finished')->whereNull('deleted_at')->select(DB::raw('count(*) as count'))->first()['count'];

        if($unfinished_projects > 0){
            return response()->json([
                'ok' => false,
                'errors' => ['pending' => ($unfinished_projects > 1) ? trans("validation.unfinished_projects$postfix", ['count' => $unfinished_projects]) : trans("validation.unfinished_project$postfix")],
                'status' => 'Bad Request'
            ], Response::HTTP_UNAUTHORIZED);
        }

        if($postfix == '_admin'){
            $notifText = trans('emails.delete.company.admin_text');
        }

        $company->userWithTrashed->roles()->detach(1); // remove company role
        UploadController::removeOldFile(self::getPathLogo(), $company->logo);
        $company->userWithTrashed->sendDeleteNotification('company', $notifText);
        $company->forceDelete();

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.deleted')
        ], Response::HTTP_OK);
    }

    /**
     * Validates the request params for a company
     * returns errors array or data
     *
     * @return array
     */
    private function validateCompany($required='required|'){
        $data = request()->only([
            'name','description', 'address', 'address_description',
            'zip', 'town', 'region', 'country', 'logo',
            'web', 'github', 'linkedin', 'twitter',
            (!empty($required)) ? 'user_id' : '' // only if is store
        ]);

        $validator = Validator::make($data, [
            'user_id' => $required.'numeric|exists:users,id|unique:companies',
            'name' => $required.'string|min:1|max:100|unique:companies',
            'description' => $required.'string|min:1|max:1000',
            'address' => $required.'string|min:1|max:100',
            'address_description' => 'string|min:1|max:500|nullable',
            'zip' => $required.'string|between:4,12', // diferent countries has diferent zip lenght
            'town' => $required.'string|min:2|max:80',
            'region' => $required.'string|min:2|max:80',
            'country' => $required.'string|min:2|max:80',
            'web' => 'string|min:5|max:100|nullable',
            'github' => 'string|min:20|max:100|nullable',
            'linkedin' => 'string|min:20|max:100|nullable',
            'twitter' => 'string|min:20|max:100|nullable'
        ], ['exists' => trans('validation.foreign_not_found')]);

        if($validator->fails()){
            return ['errors' => $validator->errors()->jsonSerialize()];
        }

        return $data;
    }
}

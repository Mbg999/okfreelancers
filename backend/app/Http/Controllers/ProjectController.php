<?php

namespace App\Http\Controllers;

use App\Category;
use App\Company;
use App\Freelancer;
use App\Offer;
use App\Project;
use App\Skill;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class ProjectController extends Controller
{
    /**
     * Returns all the projects data
     *
     * @return JSON response
     */
    public function getProjects(){
        $projects = Project::where('advertisable','=','1')
            ->join('companies', 'projects.company_id', '=', 'companies.id')
            ->join('users', 'companies.user_id' , '=','users.id')
            ->whereNull('companies.deleted_at')
            ->whereNull('users.deleted_at')
            ->select('projects.id', 'projects.title', 'projects.description', 'projects.budget', 'projects.advertisable',
                'projects.finished', 'companies.id as company_id',
                'companies.name as company_name', 'companies.logo as company_logo', 'users.id as user_id', 'users.email')
            ->orderBy('projects.created_at', 'desc')
            ->get();
        foreach ($projects as $project){
            $project->categories;
            $project->skills;
        }
        return response()->json([
            'ok' => true,
            'data' => $project
        ], Response::HTTP_OK);
    }

    /**
     * Returns all the projects data asociated with the auth user company
     * only auth
     *
     * @return JSON response
     */
    public function getCompanyProjectsAsAuth(){
        $projects = auth()->user()->companyWithTrashed->projectsWithTrashed()
            ->join('companies', 'projects.company_id', '=', 'companies.id')
            ->join('users', 'companies.user_id' , '=','users.id')
            ->orderBy('projects.created_at','desc')
            ->select('projects.id', 'projects.title', 'projects.budget', 'projects.advertisable',
                'projects.finished', 'projects.ban', 'projects.ban_reason', 'projects.deleted_at', 'companies.id as company_id',
                'companies.name as company_name', 'companies.logo as company_logo', 'users.id as user_id', 'users.email')
            ->orderBy('projects.created_at', 'desc')
            ->get();
        foreach ($projects as $project){
            $project->categories;
            $project->skills;
        }
        return response()->json([
            'ok' => true,
            'data' => $projects
        ], Response::HTTP_OK);
    }

    /**
     * Returns all the projects data as admin
     * only admin
     *
     * @return JSON response
     */
    public function getProjectsAsAdmin(){
        return response()->json([
            'ok' => true,
            'data' => Project::withTrashed()
                ->join('companies', 'projects.company_id', '=', 'companies.id')
                ->join('users', 'companies.user_id' , '=','users.id')
                ->select('projects.id', 'projects.title', 'projects.budget',
                    'projects.finished', 'projects.ban', 'projects.ban_reason', 'projects.deleted_at', 'companies.id as company_id',
                    'companies.name as company_name')
                ->orderBy('projects.created_at','desc')
                ->get()
        ], Response::HTTP_OK);
    }

    /**
     * Display the specified resource.
     *
     * @param  $id
     * @return JSON response
     */
    public function show($id){
        $project = Project::join('companies', 'projects.company_id', '=', 'companies.id')
            ->join('users', 'companies.user_id','=','users.id')
            ->WhereNull('users.deleted_at') // important for do not show projects from softdeleted users or companies
            ->WhereNull('companies.deleted_at')
            ->select('projects.id', 'projects.title', 'projects.description', 'projects.budget', 'projects.advertisable',
                'projects.finished', 'companies.id as company_id', 'companies.name as company_name', 'companies.logo as company_logo', 'users.id as user_id')
            ->findOrFail($id);

        $project->categories;
        $project->skills;

        return response()->json([
            'ok' => true,
            'data' => $project
        ], Response::HTTP_OK);
    }

    /**
     * Returns a single freelancer profile, one of the auth user only
     * uses the showWithTrashed method
     * it includes the withtrashed ones (soft deleted)
     * only auth
     *
     * @param $id
     * @return JSON response
     */
    public function showWithTrashedAsAuth($id){
        return $this->showWithTrashed(0,
            auth()->user()->companyWithTrashed->projectsWithTrashed()
                ->join('companies', 'projects.company_id', '=', 'companies.id')
                ->select('projects.id', 'projects.title', 'projects.description', 'projects.budget', 'projects.advertisable',
                    'projects.finished', 'projects.ban', 'projects.ban_reason','projects.deleted_at', 'companies.id as company_id',
                    'companies.name as company_name', 'companies.logo as company_logo')
                ->findOrFail($id)); // only if the user is the owner of that profile
    }

    /**
     * Display the specified resource.
     * it includes the withtrashed ones (soft deleted)
     *
     * @param  $id
     * @return JSON response
     */
    public function showWithTrashed($id, Project $project=null){
        if(!isset($project)){
            $project = Project::withTrashed()
                ->join('companies', 'projects.company_id', '=', 'companies.id')
                ->select('projects.id', 'projects.title', 'projects.description', 'projects.budget', 'projects.advertisable',
                    'projects.finished', 'projects.ban', 'projects.ban_reason', 'projects.deleted_at', 'companies.id as company_id',
                    'companies.name as company_name', 'companies.logo as company_logo')
                ->findOrFail($id);
        }
        $project->categories;
        $project->skills;

        return response()->json([
            'ok' => true,
            'data' => $project
        ], Response::HTTP_OK);
    }

    /**
     * Search a company by name and return all its projcets
     *
     * @param $email
     * @return JSON response
     */
    public function getProjectsByCompany($name){
        $projects = Company::where('name','like',$name)
            ->firstOrFail()->projects()
            ->join('companies', 'projects.company_id', '=', 'companies.id')
            ->join('users', 'companies.user_id' , '=','users.id')
            ->whereNull('users.deleted_at')
            ->select('projects.id', 'projects.title', 'projects.description', 'projects.budget', 'projects.advertisable',
                'projects.finished', 'companies.id as company_id',
                'companies.name as company_name', 'companies.logo as company_logo', 'users.id as user_id', 'users.email')
            ->orderBy('projects.created_at', 'desc')
            ->get();

        foreach ($projects as $project){
            $project->categories;
            $project->skills;
        }

        return response()->json([
            'ok' => true,
            'data' => $projects
        ], Response::HTTP_OK);
    }

    /**
     * Search a company by id and return all its projects
     * included the withtrashed ones (soft deleted)
     * only admin
     *
     * @param $id
     * @return JSON response
     */
    public function getProjectsByCompanyAsAdmin($id){
        return response()->json([
            'ok' => true,
            'data' => Company::withTrashed()->findOrFail($id)->projectsWithTrashed()
                ->join('companies', 'projects.company_id', '=', 'companies.id')
                ->join('users', 'companies.user_id' , '=','users.id')
                ->select('projects.id', 'projects.title', 'projects.budget',
                    'projects.finished', 'projects.ban', 'projects.ban_reason', 'projects.deleted_at', 'companies.id as company_id',
                    'companies.name as company_name')
                ->orderBy('projects.created_at', 'desc')
                ->get()
        ], Response::HTTP_OK);
    }

    /**
     * Search a category by name and return all its projects
     *
     * @param $name
     * @param $limit
     * @return JSON response
     */
    public function getProjectsByCategory($name, $limit){
        $projects = Category::where(TranslationController::getTranslatedFieldsName(),'like',$name)->firstOrFail()->projects()
            ->join('companies', 'projects.company_id', '=', 'companies.id')
            ->join('users', 'companies.user_id' , '=','users.id')
            ->whereNull('companies.deleted_at')
            ->whereNull('users.deleted_at')
            ->whereNull('projects.finished')
            ->where('projects.advertisable','=','1')
            ->select('projects.id', 'projects.title', 'projects.description', 'projects.budget', 'projects.advertisable',
                'projects.finished', 'companies.id as company_id',
                'companies.name as company_name', 'companies.logo as company_logo', 'users.id as user_id', 'users.email')
            ->orderBy('projects.created_at', 'desc')
            ->paginate(intval($limit));
        $projects->withPath("/projects/category/$name/$limit");

        foreach ($projects as $project){
            $project->categories;
            $project->skills;
        }

        return response()->json([
            'ok' => true,
            'data' => $projects
        ], Response::HTTP_OK);
    }

    /**
     * Search a category by id and return all its projects
     * included the withtrashed ones (soft deleted)
     * only admin
     *
     * @param $id
     * @return JSON response
     */
    public function getProjectsByCategoryAsAdmin($id){
        return response()->json([
            'ok' => true,
            'data' => Category::withTrashed()->findOrFail($id)->projectsWithTrashed()
                ->join('companies', 'projects.company_id', '=', 'companies.id')
                ->join('users', 'companies.user_id' , '=','users.id')
                ->select('projects.id', 'projects.title', 'projects.budget',
                    'projects.finished', 'projects.ban', 'projects.ban_reason', 'companies.id as company_id',
                    'companies.name as company_name')
                ->orderBy('projects.created_at', 'desc')
                ->get()
        ], Response::HTTP_OK);
    }

    /**
     * Search a category by name and return all its projects
     *
     * @param $name
     * @param $limit
     * @return JSON response
     */
    public function getProjectsBySkill($name, $limit){
        $projects = Skill::where(TranslationController::getTranslatedFieldsName(),'like',$name)->firstOrFail()->projects()
            ->join('companies', 'projects.company_id', '=', 'companies.id')
            ->join('users', 'companies.user_id' , '=','users.id')
            ->whereNull('companies.deleted_at')
            ->whereNull('users.deleted_at')
            ->whereNull('projects.finished')
            ->where('projects.advertisable','=','1')
            ->select('projects.id', 'projects.title', 'projects.description', 'projects.budget', 'projects.advertisable',
                'projects.finished', 'companies.id as company_id',
                'companies.name as company_name', 'companies.logo as company_logo', 'users.id as user_id', 'users.email')
            ->orderBy('projects.created_at', 'desc')
            ->paginate(intval($limit));
        $projects->withPath("/projects/skill/$name/$limit");

        foreach ($projects as $project){
            $project->categories;
            $project->skills;
        }

        return response()->json([
            'ok' => true,
            'data' => $projects
        ], Response::HTTP_OK);
    }

    public function getAllMyFreelancersInProgressProjects(){
        $freelancers = auth()->user()->freelancerProfilesWithTrashed()
        ->join('categories','freelancers.category_id','=','categories.id')
        ->select('freelancers.id','freelancers.title', 'freelancers.picture',
            'categories.'.TranslationController::getTranslatedFields(false,'category_'))
        ->get();

        foreach ($freelancers as $freelancer){
            $offers = $freelancer->offers()
                ->where('company_deposit','>',0)
                ->where('freelancer_deposit','=',0)
                ->get();

            $projects = [];
            foreach ($offers as $offer){
                $project = $offer->project()->join('companies', 'projects.company_id', '=', 'companies.id')
                    ->join('users', 'companies.user_id' , '=','users.id')
                    ->select('projects.id', 'projects.title', 'projects.description', 'projects.budget', 'projects.advertisable',
                        'projects.finished', 'companies.id as company_id',
                        'companies.name as company_name', 'companies.logo as company_logo', 'users.id as user_id', 'users.email')
                    ->first();
                $project->categories;
                $project->skills;
                array_push($projects, $project);
            }

            $freelancer['pending_offers_projects'] = $projects;

            $projects = [];
            $jobs = $freelancer->jobs()->whereNull('finished')->get();
            foreach ($jobs as $job){
                $project = $job->project()->join('companies', 'projects.company_id', '=', 'companies.id')
                    ->join('users', 'companies.user_id' , '=','users.id')
                    ->select('projects.id', 'projects.title', 'projects.description', 'projects.budget', 'projects.advertisable',
                        'projects.finished', 'companies.id as company_id',
                        'companies.name as company_name', 'companies.logo as company_logo', 'users.id as user_id', 'users.email')
                    ->first();

                $project->categories;
                $project->skills;
                array_push($projects, $project);
            }
            $freelancer['in_progress_offers_projects'] = $projects;
        }

        return response()->json([
            'ok' => true,
            'data' => $freelancers
        ], Response::HTTP_OK);
    }

    public function getAFreelancerAcceptedProjects($id){
        $freelancer = Freelancer::withTrashed()->where('freelancers.id','=',$id)
            ->join('categories','freelancers.category_id','=','categories.id')
            ->select('freelancers.id','freelancers.title', 'freelancers.picture',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'))
            ->findOrFail($id);
        $jobsInProgress = $freelancer->jobs()->whereNull('finished')->get();
        $jobsFinished = $freelancer->jobs()->whereNotNull('finished')->get();
        $projects = [
            'in_progress' => [],
            'finisheds' => []
        ];
        foreach ($jobsInProgress as $job){
            $project = $job->project()
                ->join('companies','projects.company_id','=','companies.id')
                ->join('users','companies.user_id','=','users.id')
                ->whereNull('projects.deleted_at')
                ->whereNull('companies.deleted_at')
                ->whereNull('users.deleted_at')
                ->select('projects.*','users.id as user_id','companies.id as company_id','companies.name as company_name', 'companies.logo as company_logo')
                ->first();
            if(isset($project)){
                $project->categories;
                $project->skills;
                $project['job'] = $job;
                array_push($projects['in_progress'], $project);
            }
        }

        foreach ($jobsFinished as $job){
            $project = $job->project()
                    ->join('companies','projects.company_id','=','companies.id')
                    ->join('users','companies.user_id','=','users.id')
                    ->whereNull('projects.deleted_at')
                    ->whereNull('companies.deleted_at')
                    ->whereNull('users.deleted_at')
                    ->select('projects.*','users.id as user_id','companies.id as company_id','companies.name as company_name', 'companies.logo as company_logo')
                    ->first();
            if(isset($project)){
                $project->categories;
                $project->skills;
                $project['job'] = $job;
                array_push($projects['finisheds'], $project);
            }
        }

        return response()->json([
            'ok' => true,
            'data' => $projects
        ], Response::HTTP_OK);
    }

    public function getTopLatest($limit){
        $projects = Project::join('companies', 'projects.company_id', '=', 'companies.id')
            ->join('users', 'companies.user_id' , '=','users.id')
            ->whereNull('companies.deleted_at')
            ->whereNull('users.deleted_at')
            ->whereNull('projects.finished')
            ->where('projects.advertisable','=','1')
            ->orderBy('projects.created_at','desc')
            ->select('projects.id', 'projects.title', 'projects.description', 'projects.budget', 'projects.advertisable',
                'projects.finished', 'companies.id as company_id',
                'companies.name as company_name', 'companies.logo as company_logo', 'users.id as user_id', 'users.email')
            ->paginate(intval($limit));
        $projects->withPath("/projects/top/$limit/latest");

        foreach ($projects as $project){
            $project->categories;
            $project->skills;
        }

        return response()->json([
            'ok' => true,
            'data' => $projects
        ], Response::HTTP_OK);
    }

    /**
     * @return JSON response
     */
    public function storeAsAuth(){
        request()->request->add(['company_id' => auth()->user()->companyWithTrashed->id]);
        return $this->store(0, auth()->user()->companyWithTrashed);
    }

    /**
     * @param $id
     * @param Company $company
     * @return JSON response
     */
    public function store($id, $company=null) {
        if(!isset($company)){
            $company = Company::withTrashed()->findOrFail($id);
            request()->request->add(['company_id' => $company->id]);
        }
        $data = $this->validateProject();

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $project = Project::join('companies', 'projects.company_id', '=', 'companies.id')
            ->join('users', 'companies.user_id' , '=','users.id')
            ->select('projects.id', 'projects.title', 'projects.description', 'projects.budget', 'projects.advertisable',
                'projects.finished', 'projects.ban', 'projects.ban_reason', 'companies.id as company_id',
                'companies.name as company_name', 'users.id as user_id', 'users.email')
            ->findOrFail(Project::create($data)->id);

        $project->categories()->sync($data['addCategories'] ?? []);
        $project->categories;

        $project->skills()->sync($data['addSkills'] ?? []);
        $project->skills;

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.created'),
            'data' => $project
        ], Response::HTTP_CREATED);
    }

    public function updateAsAuth($id){
        return $this->update(0,
            auth()->user()->companyWithTrashed->projectsWithTrashed()
                ->join('companies', 'projects.company_id', '=', 'companies.id')
                ->join('users', 'companies.user_id' , '=','users.id')
                ->select('projects.id', 'projects.title', 'projects.description', 'projects.budget', 'projects.advertisable',
                    'projects.ban', 'projects.ban_reason', 'projects.finished', 'companies.id as company_id',
                    'companies.name as company_name', 'users.id as user_id', 'users.email')
                ->findOrFail($id) // only if the user is the owner of that project
        );
    }

    /**
     * @param $id
     * @param Project $project
     * @return JSON response
     */
    public function update($id, $project=null) {
        if(!isset($project)){
            $project = Project::withTrashed()
                ->join('companies', 'projects.company_id', '=', 'companies.id')
                ->join('users', 'companies.user_id' , '=','users.id')
                ->select('projects.id', 'projects.title', 'projects.description', 'projects.budget', 'projects.advertisable',
                    'projects.ban', 'projects.ban_reason', 'projects.finished', 'companies.id as company_id',
                    'companies.name as company_name', 'users.id as user_id', 'users.email')
                ->findOrFail($id);
        }

        $data = $this->validateProject('');

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $project->update($data);

        $project->categories()->sync($data['addCategories'] ?? []);
        $project->categories;

        $project->skills()->sync($data['addSkills'] ?? []);
        $project->skills;

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.updated'),
            'data' => $project
        ], Response::HTTP_OK);
    }

    public function toggleProjectFinished($id){
        $project = Project::withoutTrashed()->findOrFail($id);

        if($project->company->user->id != auth()->user()->id){ // not the project owner user
            return response()->json([
                'ok' => false,
                'errors' => trans('status.unauthorized'),
                'status' => 'Bad Request'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $pending_offers_count = $project->offers()
            ->where('company_deposit','>',0)
            ->where('freelancer_deposit','=',0)
            ->select(DB::raw('count(*) as count'))->first()['count'];

        $unfinished_jobs_count = $project->jobs()->whereNull('finished')->select(DB::raw('count(*) as count'))->first()['count'];

        if($unfinished_jobs_count > 0 || $pending_offers_count > 0){ // has unfinisheds jobs
            return response()->json([
                'ok' => false,
                'errors' => ['pending' => trans('validation.has_unfinished_jobs')],
                'status' => 'Bad Request'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $validator =  Validator::make(request()->all(), [
            'finished' => 'nullable|string'
        ]);

        if($validator->fails()){
            return response()->json([
                'ok' => false,
                'errors' => $validator->errors()->jsonSerialize(),
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $finished = request()->get('finished');

        if(isset($project->deleted_at) || isset($project->finished) != isset($finished)){
            return response()->json([
                'ok' => false,
                'errors' => ['concurrence' => trans('validation.concurrence')],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $project->update(['finished' => (isset($finished)) ? null : Carbon::now()]);

        $project = auth()->user()->companyWithTrashed->projectsWithTrashed()
            ->join('companies', 'projects.company_id', '=', 'companies.id')
            ->select('projects.id', 'projects.title', 'projects.description', 'projects.budget', 'projects.advertisable',
                'projects.finished', 'projects.ban', 'projects.ban_reason','projects.deleted_at', 'companies.id as company_id',
                'companies.name as company_name', 'companies.logo as company_logo')
            ->findOrFail($id);

        $project->categories;
        $project->skills;

        $project->categories;
        $project->skills;

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.updated'),
            'data' => $project
        ], Response::HTTP_OK);
    }

    /**
     * Deactivate one of the user auth company projects using the deactivate method
     * Project implements soft delete
     * only auth
     *
     * @return JSON response
     */
    public function deactivateAsAuth($id){
        return $this->deactivate(0, auth()->user()->companyWithTrashed->projectsWithTrashed()->findOrFail($id), ''); // only if the user is the owner of that project
    }

    /**
     * deactivate
     * Project implements soft delete
     *
     * if this method is called by an admin with the id param,
     * this project will get banned and the user will get notificated via email
     *
     * @param  $id
     * @return JSON response
     */
    public function deactivate($id, Project $project=null, $postfix='_admin') {
        if(!isset($project)){
            $project = Project::withTrashed()->findOrFail($id);
        }

        $pending_offers_count = $project->offers()
            ->where('company_deposit','>',0)
            ->where('freelancer_deposit','=',0)
            ->select(DB::raw('count(*) as count'))->first()['count'];

        $unfinished_jobs_count = $project->jobs()->whereNull('finished')->select(DB::raw('count(*) as count'))->first()['count'];

        if($unfinished_jobs_count > 0 || $pending_offers_count > 0){ // has unfinisheds jobs
            $count = $unfinished_jobs_count + $pending_offers_count;
            return response()->json([
                'ok' => false,
                'errors' => ['pending' =>  ($count > 1) ? trans("validation.unfinished_jobs$postfix", ['count' => $count]) : trans("validation.unfinished_job$postfix")],
                'status' => 'Bad Request'
            ], Response::HTTP_UNAUTHORIZED);
        }

        if($postfix == '_admin'){
            $ban_reason = request()->get('ban_reason') ?? trans('miscellaneous.no_reason');
            $project->update(['ban' => true, 'ban_reason' => $ban_reason]);
            $project->companyWithTrashed->user->sendBanNotification('ban', trans('emails.ban.ban.project'), $ban_reason);
        }

        $project->delete();

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.deactivated')
        ], Response::HTTP_OK);
    }

    /**
     * Activate one of the user auth company projects using the activate method
     * project implements soft delete, this restores the deleted project
     * only auth
     *
     * @return JSON response
     */
    public function activateAsAuth($id){
        return $this->activate(0, auth()->user()->companyWithTrashed->projectsWithTrashed()->findOrFail($id)); // only if the user is the owner of that project
    }

    /**
     * activate
     * Project implements soft delete, this restores the deleted freelancer
     *
     * if this method is called by an admin with the id param,
     * this project will get rehabilitated and the user will get notificated via email
     *
     * @param  $id
     * @return JSON response
     */
    public function activate($id, Project $project=null) {
        if(!isset($project)){
            $project = Project::withTrashed()->findOrFail($id);
            $project->update(['ban' => false, 'ban_reason' => null]);
            $project->companyWithTrashed->user->sendBanNotification('rehabilitate', trans('emails.ban.rehabilitate.project'));
        }
        $project->restore();

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.activated')
        ], Response::HTTP_OK);
    }

    /**
     * Uses the destroy method for delete one of the user auth company projects associated with the auth user id from storage
     * only auth
     *
     * @return JSON response
     */
    public function destroyAsAuth($id){
        return $this->destroy(0, auth()->user()->companyWithTrashed->projectsWithTrashed()->findOrFail($id), trans('emails.delete.project.text'),''); // only if the user is the owner of that project
    }

    /**
     * force delete from storage
     * take care with delete on cascade,
     * this option should only be used in really safe cases
     *
     * @param  $id
     * @return JSON response
     */
    public function destroy($id, Project $project=null, $notifText=null, $postfix='_admin') {
        if(!isset($project)){
            $project = Project::withTrashed()->findOrFail($id);
        }

        $pending_offers_count = $project->offers()
            ->leftJoin('jobs','offers.freelancer_id','=','jobs.freelancer_id', 'and', 'jobs.project_id','=','offers.project_id')
            ->whereNull('jobs.finished')
            ->where('company_deposit','>',0)->select(DB::raw('count(*) as count'))->first()['count'];

        $unfinished_jobs_count = $project->jobs()->whereNull('finished')->select(DB::raw('count(*) as count'))->first()['count'];

        if($unfinished_jobs_count > 0 || $pending_offers_count > 0){ // has unfinisheds jobs
            $count = $unfinished_jobs_count + $pending_offers_count;
            return response()->json([
                'ok' => false,
                'errors' => ['pending' => ($count > 1) ? trans("validation.unfinished_jobs$postfix", ['count' => $count]) : trans("validation.unfinished_job$postfix")],
                'status' => 'Bad Request'
            ], Response::HTTP_UNAUTHORIZED);
        }

        if($postfix == '_admin'){
            $notifText = trans('emails.delete.project.admin_text');
        }

        $project->companyWithTrashed->userWithTrashed->sendDeleteNotification('project', $notifText);
        $project->forceDelete();

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.deleted')
        ], Response::HTTP_OK);
    }

    /**
     * Validates the request params for a project
     * returns errors array or data
     *
     * @return array
     */
    private function validateProject($required='required|'){
        $data = request()->only([
            'title', 'description', 'budget', 'advertisable',
            'addCategories', 'addSkills',
            (!empty($required)) ? 'company_id' : '' // only if is store
        ]);

        $validator = Validator::make($data, [
            'title' => $required.'string|min:1|max:80',
            'description' => $required.'string|min:1|max:1000',
            'budget' => $required.'numeric|min:1|max:99999999.99',
            'advertisable' => 'boolean',
            'addCategories' => 'array|exists:categories,id',
            'addSkills' => 'array|exists:skills,id'
        ],
            ['exists' => trans('validation.foreign_not_found')]);

        if($validator->fails()){
            return ['errors' => $validator->errors()->jsonSerialize()];
        }

        return $data;
    }
}

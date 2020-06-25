<?php

namespace App\Http\Controllers;

use App\Category;
use App\Freelancer;
use App\Skill;
use App\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class FreelancerController extends Controller
{

    private static $pathPicture = 'assets/images/freelancers/pictures';

    public static function getPathPicture(){
        return self::$pathPicture;
    }

    /**
     * Returns all the freelancers data
     *
     * @return JSON response
     */
    public function getFreelancers(){
        $freelancers = Freelancer::where('advertisable','=','1')
            ->join('categories', 'freelancers.category_id','=','categories.id')
            ->join('users', 'freelancers.user_id', '=', 'users.id')
            ->whereNull('categories.deleted_at')
            ->whereNull('users.deleted_at')
            ->select('freelancers.id', 'freelancers.user_id', 'users.email', 'freelancers.title', 'freelancers.description', 'freelancers.picture',
                'freelancers.years_exp', 'freelancers.approx_fee', 'freelancers.advertisable', 'categories.id as category_id',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'),
                'categories.title_color', 'categories.text_color', 'categories.background_color')
            ->orderBy('freelancers.created_at', 'desc')
            ->get();

        $to_delete = [];
        for ($i = 0; $i < count($freelancers); $i++){ // check for non deactivated parent categories
            $father = $freelancers[$i]->category->father;
            while(isset($father)){
                if(isset($father->deleted_at)) {
                    array_push($to_delete, $i);
                }
                $father = $father->father;
            }
            unset($freelancers[$i]['category']);
        }

        foreach ($to_delete as $index){
            unset($freelancers[$index]);
        }

        foreach ($freelancers as $freelancer){
            $freelancer->skills;
            $freelancer['portfolio'] = $freelancer->portfolio()->get(['position', 'title', 'description', 'file']);
        }
        return response()->json([
            'ok' => true,
            'data' => $freelancers
        ], Response::HTTP_OK);
    }

    /**
     * Returns all the freelancers data asociated with the auth user
     * only auth
     *
     * @return JSON response
     */
    public function getFreelancersAsAuth(){
        $freelancers = auth()->user()->freelancerProfilesWithTrashed()
            ->join('categories', 'freelancers.category_id','=','categories.id')
            ->whereNull('categories.deleted_at')
            ->select('freelancers.id', 'freelancers.title', 'freelancers.description', 'freelancers.picture',
                'freelancers.years_exp', 'freelancers.approx_fee', 'freelancers.advertisable', 'categories.id as category_id', 'freelancers.deleted_at',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'),
                'freelancers.ban', 'freelancers.ban_reason', 'categories.portfolio_type', 'categories.title_color',
                'categories.text_color', 'categories.background_color')
            ->orderBy('freelancers.created_at', 'desc')
            ->get();

        $to_delete = [];
        for ($i = 0; $i < count($freelancers); $i++){ // check for non deactivated parent categories
            $father = $freelancers[$i]->category->father;
            while(isset($father)){
                if(isset($father->deleted_at)) {
                    array_push($to_delete, $i);
                }
                $father = $father->father;
            }
            unset($freelancers[$i]['category']);
        }

        foreach ($to_delete as $index){
            unset($freelancers[$index]);
        }

        foreach ($freelancers as $freelancer){
            $freelancer->skills;
            $freelancer['portfolio'] = $freelancer->portfolio()->get(['position', 'title', 'description', 'file']);
        }
        return response()->json([
            'ok' => true,
            'data' => $freelancers
        ], Response::HTTP_OK);
    }

    /**
     * Returns all the freelancers data as admin
     * only admin
     *
     * @return JSON response
     */
    public function getFreelancersAsAdmin(){
        $freelancers = Freelancer::withTrashed()
            ->join('categories', 'freelancers.category_id','=','categories.id')
            ->join('users', 'freelancers.user_id', '=', 'users.id')
            ->whereNull('categories.deleted_at')
            ->whereNull('users.deleted_at')
            ->select('freelancers.id', 'freelancers.user_id', 'users.email', 'freelancers.title','freelancers.deleted_at', 'categories.id as category_id',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'), 'freelancers.picture',
                'freelancers.ban_reason', 'categories.portfolio_type')
            ->orderBy('freelancers.user_id')
            ->orderBy('freelancers.created_at', 'desc')
            ->get();

        $to_delete = [];
        for ($i = 0; $i < count($freelancers); $i++){ // check for non deactivated parent categories
            $father = $freelancers[$i]->category->father;
            while(isset($father)){
                if(isset($father->deleted_at)) {
                    array_push($to_delete, $i);
                }
                $father = $father->father;
            }
            unset($freelancers[$i]['category']);
        }

        foreach ($to_delete as $index){
            unset($freelancers[$index]);
        }

        return response()->json([
            'ok' => true,
            'data' => $freelancers
        ], Response::HTTP_OK);
    }

    /**
     * Display the specified resource.
     *
     * @param  $id
     * @return JSON response
     */
    public function show($id){
        $freelancer = Freelancer::join('categories', 'freelancers.category_id','=','categories.id')
            ->whereNull('categories.deleted_at')
            ->select('freelancers.id', 'freelancers.user_id', 'freelancers.title', 'freelancers.description', 'freelancers.picture',
                'freelancers.years_exp', 'freelancers.approx_fee', 'freelancers.advertisable', 'categories.id as category_id',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'), 'categories.portfolio_type',
                'categories.title_color', 'categories.text_color', 'categories.background_color')
            ->findOrFail($id);

        $father = $freelancer->category->father;
        while(isset($father)){
            if(isset($father->deleted_at)) {
                return response()->json([
                    'ok' => false,
                    'exception' => trans('status.not_found'),
                    'status' => 'Not Found'
                ], 404);
            }
            $father = $father->father;
        }
        unset($freelancer['category']);

        $freelancer->skills;

        $freelancer['portfolio'] = $freelancer->portfolio()->get(['position', 'title', 'description', 'file']);

        $aux = $freelancer->jobs()->select(DB::raw('avg(rate) as rate_average'), DB::raw('count(rate) as rate_count'))->first();
        $freelancer['rate_average'] = $aux['rate_average'];
        $freelancer['rate_count'] = $aux['rate_count'];

        $user = $freelancer->user()->select('id', 'email', 'name', 'surnames', 'town', 'region', 'country', 'picture')->firstOrFail();
        unset($freelancer->user);

        return response()->json([
            'ok' => true,
            'data' => [
                'freelancer' => $freelancer,
                'user' => $user
            ]
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
        $freelancer =  auth()->user()->freelancerProfilesWithTrashed()
            ->join('categories', 'freelancers.category_id','=','categories.id')
            ->join('users', 'freelancers.user_id', '=', 'users.id')
            ->whereNull('categories.deleted_at')
            ->select('freelancers.id', 'freelancers.user_id', 'users.email', 'freelancers.title', 'freelancers.description', 'freelancers.picture',
                'freelancers.years_exp', 'freelancers.approx_fee', 'freelancers.advertisable', 'categories.id as category_id', 'freelancers.deleted_at',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'),
                'categories.title_color', 'categories.text_color', 'categories.background_color','freelancers.ban',
                'freelancers.ban_reason', 'categories.portfolio_type')
            ->findOrFail($id); // only if the user is the owner of that profile

        $father = $freelancer->category->father;
        while(isset($father)){
            if(isset($father->deleted_at)) {
                return response()->json([
                    'ok' => false,
                    'exception' => trans('status.not_found'),
                    'status' => 'Not Found'
                ], 404);
            }
            $father = $father->father;
        }
        unset($freelancer['category']);

        return $this->showWithTrashed(0, $freelancer);
    }

    /**
     * Display the specified resource.
     * it includes the withtrashed ones (soft deleted)
     *
     * @param  $id
     * @return JSON response
     */
    public function showWithTrashed($id, Freelancer $freelancer=null){
        if(!isset($freelancer)){
            $freelancer = Freelancer::withTrashed()
                ->join('categories', 'freelancers.category_id','=','categories.id')
                ->join('users', 'freelancers.user_id', '=', 'users.id')
                ->select('freelancers.id', 'freelancers.user_id', 'users.email', 'freelancers.title', 'freelancers.description', 'freelancers.picture',
                    'freelancers.years_exp', 'freelancers.approx_fee', 'freelancers.advertisable', 'categories.id as category_id',
                    'categories.'.TranslationController::getTranslatedFields(false,'category_'), 'categories.portfolio_type')
                ->findOrFail($id);

            $father = $freelancer->category->father;
            while(isset($father)){
                if(isset($father->deleted_at)) {
                    return response()->json([
                        'ok' => false,
                        'exception' => trans('status.not_found'),
                        'status' => 'Not Found'
                    ], 404);
                }
                $father = $father->father;
            }
            unset($freelancer['category']);
        }

        $freelancer->skills;
        $freelancer['portfolio'] = $freelancer->portfolio()->get(['position', 'title', 'description', 'file']);

        $aux = $freelancer->jobs()->select(DB::raw('avg(rate) as rate_average'), DB::raw('count(rate) as rate_count'))->first();
        $freelancer['rate_average'] = $aux['rate_average'];
        $freelancer['rate_count'] = $aux['rate_count'];

        return response()->json([
            'ok' => true,
            'data' => $freelancer
        ], Response::HTTP_OK);
    }

    /**
     * Search a user by email and return all his freelancer profiles
     *
     * @param $email
     * @return JSON response
     */
    public function getFreelancersByUser($email){ // advertisable not needed, if the freelancer is activated, the profile will be shown
        $freelancers = User::where('email','like',$email)
            ->firstOrFail()->freelancerProfiles()
            ->join('categories', 'freelancers.category_id','=','categories.id')
            ->join('users', 'freelancers.user_id', '=', 'users.id')
            ->whereNull('categories.deleted_at')
            ->select('freelancers.id', 'freelancers.user_id', 'users.email', 'freelancers.title', 'freelancers.description', 'freelancers.picture',
                'freelancers.years_exp', 'freelancers.approx_fee', 'freelancers.advertisable', 'categories.id as category_id',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'), 'freelancers.ban', 'categories.portfolio_type',
                'categories.title_color', 'categories.text_color', 'categories.background_color')
            ->orderBy('freelancers.created_at', 'desc')
            ->get();

        $to_delete = [];
        for ($i = 0; $i < count($freelancers); $i++){ // check for non deactivated parent categories
            $father = $freelancers[$i]->category->father;
            while(isset($father)){
                if(isset($father->deleted_at)) {
                    array_push($to_delete, $i);
                }
                $father = $father->father;
            }
            unset($freelancers[$i]['category']);
        }

        foreach ($to_delete as $index){
            unset($freelancers[$index]);
        }

        foreach ($freelancers as $freelancer){
            $freelancer->skills;
            $freelancer['portfolio'] = $freelancer->portfolio()->get(['position', 'title', 'description', 'file']);
        }

        return response()->json([
            'ok' => true,
            'data' => $freelancers
        ], Response::HTTP_OK);
    }

    /**
     * Search a user by id and return all his freelancer profiles
     * included the withtrashed ones (soft deleted)
     * only admin
     *
     * @param $id
     * @return JSON response
     */
    public function getFreelancersByUserAsAdmin($id){
        $freelancers = User::withTrashed()->findOrFail($id)->freelancerProfilesWithTrashed()
            ->join('categories', 'freelancers.category_id','=','categories.id')
            ->join('users', 'freelancers.user_id', '=', 'users.id')
            ->whereNull('categories.deleted_at')
            ->select('freelancers.id', 'users.email', 'freelancers.title','freelancers.deleted_at', 'categories.id as category_id', 'freelancers.picture',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'), 'categories.portfolio_type')
            ->orderBy('freelancers.created_at', 'desc')
            ->get();

        $to_delete = [];
        for ($i = 0; $i < count($freelancers); $i++){ // check for non deactivated parent categories
            $father = $freelancers[$i]->category->father;
            while(isset($father)){
                if(isset($father->deleted_at)) {
                    array_push($to_delete, $i);
                }
                $father = $father->father;
            }
        }

        foreach ($to_delete as $index){
            unset($freelancers[$index]);
        }

        return response()->json([
            'ok' => true,
            'data' => $freelancers
        ], Response::HTTP_OK);
    }

    /**
     * Search a category by name and return all its freelancer profiles
     *
     * @param $name
     * @param $limit
     * @return JSON response
     */
    public function getFreelancersByCategory($name, $limit){
        $category = Category::where(TranslationController::getTranslatedFieldsName(),'like',$name)->firstOrFail();

        $father = $category->father;
        while(isset($father)){
            if(isset($father->deleted_at)) {
                return response()->json([
                    'ok' => false,
                    'exception' => trans('status.not_found'),
                    'status' => 'Not Found'
                ], 404);
            }
            $father = $father->father;
        }

        $freelancers = $category->freelancerProfiles()
            ->join('categories', 'freelancers.category_id','=','categories.id')
            ->join('users', 'freelancers.user_id', '=', 'users.id')
            ->whereNull('users.deleted_at')
            ->whereNull('categories.deleted_at')
            ->where('freelancers.advertisable','=','1')
            ->select('freelancers.id', 'freelancers.user_id', 'users.email', 'freelancers.title', 'freelancers.description', 'freelancers.picture',
                'freelancers.years_exp', 'freelancers.approx_fee', 'freelancers.advertisable', 'categories.id as category_id',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'), 'freelancers.ban', 'categories.portfolio_type')
            ->orderBy('freelancers.created_at', 'desc')
            ->paginate(intval($limit));
        $freelancers->withPath("/freelancers/category/$name/$limit");

        foreach ($freelancers as $freelancer){
            $freelancer->skills;
            $freelancer['portfolio'] = $freelancer->portfolio()->get(['position', 'title', 'description', 'file']);
        }

        return response()->json([
            'ok' => true,
            'data' => $freelancers
        ], Response::HTTP_OK);
    }

    /**
     * Search a category by id and return all its freelancer profiles
     * included the withtrashed ones (soft deleted)
     * only admin
     *
     * @param $id
     * @return JSON response
     */
    public function getFreelancersByCategoryAsAdmin($id){
        $category = Category::withTrashed()->findOrFail($id);

        $father = $category->father;
        while(isset($father)){
            if(isset($father->deleted_at)) {
                return response()->json([
                    'ok' => false,
                    'exception' => trans('status.not_found'),
                    'status' => 'Not Found'
                ], 404);
            }
            $father = $father->father;
        }

        return response()->json([
            'ok' => true,
            'data' => $category->freelancerProfilesWithTrashed()
                ->join('categories', 'freelancers.category_id','=','categories.id')
                ->join('users', 'freelancers.user_id', '=', 'users.id')
                ->select('freelancers.id', 'users.email', 'freelancers.title','freelancers.deleted_at', 'categories.id as category_id', 'freelancers.picture',
                    'categories.'.TranslationController::getTranslatedFields(false,'category_'), 'categories.portfolio_type')
                ->orderBy('freelancers.created_at', 'desc')
                ->get()
        ], Response::HTTP_OK);
    }

    /**
     * Search a category by name and return all its freelancer profiles
     *
     * @param $name
     * @param $limit
     * @return JSON response
     */
    public function getFreelancersBySkill($name, $limit){
        $skill = Skill::where(TranslationController::getTranslatedFieldsName(),'like',$name)->firstOrFail();

        $father = $skill->category->father;
        while(isset($father)){
            if(isset($father->deleted_at)) {
                return response()->json([
                    'ok' => false,
                    'exception' => trans('status.not_found'),
                    'status' => 'Not Found'
                ], 404);
            }
            $father = $father->father;
        }

        $freelancers = $skill->freelancerProfiles()
            ->join('categories', 'freelancers.category_id','=','categories.id')
            ->join('users', 'freelancers.user_id', '=', 'users.id')
            ->whereNull('categories.deleted_at')
            ->whereNull('users.deleted_at')
            ->where('freelancers.advertisable','=','1')
            ->select('freelancers.id', 'freelancers.user_id', 'users.email', 'freelancers.title', 'freelancers.description', 'freelancers.picture',
                'freelancers.years_exp', 'freelancers.approx_fee', 'freelancers.advertisable', 'categories.id as category_id',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'), 'freelancers.ban', 'categories.portfolio_type')
            ->orderBy('freelancers.created_at', 'desc')
            ->paginate(intval($limit));
        $freelancers->withPath("/freelancers/skill/$name/$limit");

        foreach ($freelancers as $freelancer){
            $freelancer->skills;
            $freelancer['portfolio'] = $freelancer->portfolio()->get(['position', 'title', 'description', 'file']);
        }

        return response()->json([
            'ok' => true,
            'data' => $freelancers
        ], Response::HTTP_OK);
    }

    public function getTopLatest($limit){
        $freelancers = Freelancer::join('categories', 'freelancers.category_id','=','categories.id')
            ->join('users', 'freelancers.user_id', '=', 'users.id')
            ->whereNull('categories.deleted_at')
            ->whereNull('users.deleted_at')
            ->where('freelancers.advertisable','=','1')
            ->orderBy('freelancers.created_at','desc')
            ->select('freelancers.id', 'freelancers.user_id', 'users.email', 'freelancers.title', 'freelancers.description', 'freelancers.picture',
                'freelancers.years_exp', 'freelancers.approx_fee', 'freelancers.advertisable', 'categories.id as category_id',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'), 'freelancers.ban', 'categories.portfolio_type',
                'categories.title_color', 'categories.text_color', 'categories.background_color')
            ->paginate(intval($limit));
        $freelancers->withPath("/freelancers/top/$limit/latest");

        $to_delete = [];
        for ($i = 0; $i < count($freelancers); $i++){ // check for non deactivated parent categories
            $father = $freelancers[$i]->category->father;
            while(isset($father)){
                if(isset($father->deleted_at)) {
                    array_push($to_delete, $i);
                }
                $father = $father->father;
            }
            unset($freelancers[$i]['category']);
        }

        foreach ($to_delete as $index){
            unset($freelancers[$index]);
        }

        foreach ($freelancers as $freelancer){
            $freelancer->skills;
            $freelancer['portfolio'] = $freelancer->portfolio()->get(['position', 'title', 'description', 'file']);
        }

        return response()->json([
            'ok' => true,
            'data' => $freelancers
        ], Response::HTTP_OK);
    }

    /**
     * Uses the store method for store a new freelancer profile, associated with the auth user id
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
        $data = $this->validateFreelancer();

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        if(isset($data['picture'])){ // image uploading
            $picture = UploadController::uploadImage('picture', self::getPathPicture());

            if(isset($logo['errors'])){
                return response()->json([
                    'ok' => false,
                    'errors' => $picture['errors'],
                    'status' => 'Bad Request'
                ], Response::HTTP_BAD_REQUEST);
            }
            $data['picture'] = $picture['picture'];
        }

        $freelancer = Freelancer::join('categories', 'freelancers.category_id','=','categories.id')
            ->join('users', 'freelancers.user_id', '=', 'users.id')
            ->select('freelancers.id', 'freelancers.user_id', 'users.email', 'freelancers.title', 'freelancers.description', 'freelancers.picture',
                'freelancers.years_exp', 'freelancers.approx_fee', 'freelancers.advertisable', 'categories.id as category_id',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'), 'freelancers.ban', 'categories.portfolio_type')
            ->findOrFail(Freelancer::create($data)->id);

        $addRole = false;
        if(!$freelancer->userWithTrashed->hasRole(2)){ // add freelancer role
            $freelancer->userWithTrashed->roles()->attach(2);
            $addRole = true;
        }
        unset($freelancer->userWithTrashed); // i dont want to return the user data

        if(isset($data['addSkills'])) $freelancer->skills()->attach($data['addSkills']);
        $freelancer->skills;
        $freelancer->portfolio;

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.created'),
            'addRole' => $addRole,
            'data' => $freelancer
        ], Response::HTTP_CREATED);
    }

    /**
     * Updates one of the auth user freelancer profiles
     * uses the update method
     * only auth
     *
     * @param $id
     * @return JSON response
     */
    public function updateAsAuth($id){
        request()->request->add(['user_id' => auth()->user()->id]);
        return $this->update($id, auth()->user()->freelancerProfilesWithTrashed()->findOrFail($id)); // only if the user is the owner of that profile
    }

    /**
     * Update the specified resource in storage.
     *
     * @param $id
     * JSON response
     */
    public function update($id, Freelancer $freelancer=null) {
        if(!isset($freelancer)){
            $freelancer = Freelancer::withTrashed()->findOrFail($id);
            request()->request->add(['user_id' => $freelancer->user->id]);
        }

        $data = $this->validateFreelancer('');

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        if(isset($data['picture'])){ // image uploading
            $picture = UploadController::uploadImage('picture', self::getPathPicture(), $freelancer->picture);

            if(isset($logo['errors'])){
                return response()->json([
                    'ok' => false,
                    'errors' => $picture['errors'],
                    'status' => 'Bad Request'
                ], Response::HTTP_BAD_REQUEST);
            }
            $data['picture'] = $picture['picture'];
        }

        $freelancer->update($data);

        $freelancer = Freelancer::withTrashed()
            ->join('categories', 'freelancers.category_id','=','categories.id')
            ->join('users', 'freelancers.user_id', '=', 'users.id')
            ->select('freelancers.id', 'freelancers.user_id', 'users.email', 'freelancers.title', 'freelancers.description', 'freelancers.picture',
                'freelancers.years_exp', 'freelancers.approx_fee', 'freelancers.advertisable', 'categories.id as category_id',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'), 'freelancers.ban', 'categories.portfolio_type')
            ->findOrFail($id);

        $freelancer->skills()->sync($data['addSkills'] ?? []);
        $freelancer->skills;
        $freelancer['portfolio'] = $freelancer->portfolio()->get(['position', 'title', 'description', 'file']);

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.updated'),
            'data' => $freelancer
        ], Response::HTTP_OK);
    }

    /**
     * Deactivate one of the user auth freelancer profiles using the deactivate method
     * Freelancer implements soft delete
     * only auth
     *
     * @return JSON response
     */
    public function deactivateAsAuth($id){
        return $this->deactivate(0, auth()->user()->freelancerProfilesWithTrashed()->findOrFail($id),''); // only if the user is the owner of that profile
    }

    /**
     * deactivate
     * Freelancer implements soft delete
     *
     * if this method is called by an admin with the id param,
     * this freelancer profile will get banned and the user will get notificated via email
     *
     * @param  $id
     * @return JSON response
     */
    public function deactivate($id, Freelancer $freelancer=null, $postfix='_admin') {
        if(!isset($freelancer)){
            $freelancer = Freelancer::withTrashed()->findOrFail($id);
        }

        $pending_jobs = $freelancer->offers()->where('company_deposit','>',0)->select(DB::raw('count(*) as count'))->first()['count'];
        $unfinished_jobs = $freelancer->jobs()->whereNull('finished')->select(DB::raw('count(*) as count'))->first()['count'];

        if($unfinished_jobs > 0 || $pending_jobs > 0){
            $count = $unfinished_jobs+$pending_jobs;
            return response()->json([
                'ok' => false,
                'errors' => ['pending' => ($count > 1) ? trans("validation.unfinished_jobs$postfix", ['count' => $count]) : trans("validation.unfinished_job$postfix")],
                'status' => 'Bad Request'
            ], Response::HTTP_UNAUTHORIZED);
        }

        if($postfix == '_admin'){
            $ban_reason = request()->get('ban_reason') ?? trans('miscellaneous.no_reason');
            $freelancer->update(['ban' => true, 'ban_reason' => $ban_reason]);
            $freelancer->userWithTrashed->sendBanNotification('ban', trans('emails.ban.ban.freelancer'), $ban_reason);
        }

        $freelancer->delete();

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.deactivated')
        ], Response::HTTP_OK);
    }

    /**
     * Activate one of the user auth freelancer profiles using the activate method
     * Freelancer implements soft delete, this restores the deleted freelancer
     * only auth
     *
     * @return JSON response
     */
    public function activateAsAuth($id){
        return $this->activate(0, auth()->user()->freelancerProfilesWithTrashed()->findOrFail($id)); // only if the user is the owner of that profile
    }

    /**
     * activate
     * Freelancer implements soft delete, this restores the deleted freelancer
     *
     * if this method is called by an admin with the id param,
     * this freelancer will get rehabilitated and the user will get notificated via email
     *
     * @param  $id
     * @return JSON response
     */
    public function activate($id, Freelancer $freelancer=null) {
        if(!isset($freelancer)){
            $freelancer = Freelancer::withTrashed()->findOrFail($id);
            $freelancer->update(['ban' => false, 'ban_reason' => null]);
            $freelancer->userWithTrashed->sendBanNotification('rehabilitate', trans('emails.ban.rehabilitate.freelancer'));
        }
        $freelancer->restore();

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.activated')
        ], Response::HTTP_OK);
    }

    /**
     * Uses the destroy method for delete one of the user auth freelancer profiles associated with the auth user id from storage
     * only auth
     *
     * @return JSON response
     */
    public function destroyAsAuth($id){
        return $this->destroy(0, auth()->user()->freelancerProfilesWithTrashed()->findOrFail($id), trans('emails.delete.freelancer.text'),''); // only if the user is the owner of that profile
    }

    /**
     * force delete from storage
     * take care with delete on cascade,
     * this option should only be used in really safe cases
     *
     * @param  $id
     * @return JSON response
     */
    public function destroy($id, Freelancer $freelancer=null, $notifText=null, $postfix='_admin') {
        if(!isset($freelancer)){
            $freelancer = Freelancer::withTrashed()->findOrFail($id);
            $postfix = '_admin';
        }

        $pending_jobs = $freelancer->offers()->where('company_deposit','>',0)->select(DB::raw('count(*) as count'))->first()['count'];
        $unfinished_jobs = $freelancer->jobs()->whereNull('finished')->select(DB::raw('count(*) as count'))->first()['count'];

        if($unfinished_jobs > 0 || $pending_jobs > 0){
            $count = $unfinished_jobs+$pending_jobs;
            return response()->json([
                'ok' => false,
                'errors' => ['pending' => ($count > 1) ? trans("validation.unfinished_jobs$postfix", ['count' => $count]) : trans("validation.unfinished_job$postfix")],
                'status' => 'Bad Request'
            ], Response::HTTP_UNAUTHORIZED);
        }

        if($postfix == '_admin'){
            $notifText = trans('emails.delete.freelancer.admin_text');
        }

        $removeRole = false;
        if(count($freelancer->userWithTrashed->freelancerProfilesWithTrashed) < 2){ // this is the only freelancer profile of this user
            $freelancer->userWithTrashed->roles()->detach(2); // remove freelancer role
            $removeRole = true;
        }


        UploadController::removeOldFile(self::getPathPicture(),$freelancer->picture);
        foreach ($freelancer->portfolio as $portfolio){
            $path = PortfolioController::determinePathByType($freelancer->category->portfolio_type);
            UploadController::removeOldFile($path, $portfolio->file);
        }

        $freelancer->userWithTrashed->sendDeleteNotification('freelancer',$notifText);
        $freelancer->forceDelete();

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.deleted'),
            'removeRole' => $removeRole
        ], Response::HTTP_OK);
    }

    /**
     * Validates the request params for a freelancer
     * returns errors array or data
     *
     * @return array
     */
    private function validateFreelancer($required='required|'){
        $data = request()->only([
            'category_id', 'title', 'description', 'years_exp', 'approx_fee',
            'advertisable', 'addSkills', 'picture',
            'user_id'
        ]);

        $validator = Validator::make($data, [
            'user_id' => $required.'numeric|exists:users,id',
            'category_id' => $required.'numeric|exists:categories,id|unique_with:freelancers,user_id,category_id',
            'title' => $required.'string|min:1|max:80',
            'description' => $required.'string|min:1|max:1000',
            'years_exp' => $required.'string|min:0|max:7',
            'approx_fee' => $required.'numeric|min:0|max:99999999.99',
            'advertisable' => 'boolean',
            'addSkills' => 'array|exists:skills,id'
        ],
        [
            'exists' => trans('validation.foreign_not_found'),
            'unique_with' => trans('validation.freelancer_already_registered')
        ]);

        if($validator->fails()){
            return ['errors' => $validator->errors()->jsonSerialize()];
        }

        return $data;
    }
}

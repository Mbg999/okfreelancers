<?php

namespace App\Http\Controllers;

use App\Category;
use App\Job;
use App\Offer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class CategoryController extends Controller {

    private static $pathImage = 'assets/images/categories';

    public static function getPathImage(){
        return self::$pathImage;
    }

    /**
     * Get all categories, with selected fields
     *
     * @return JSON response
     */
    public function categories() {
        $categories = Category::select(array_merge(TranslationController::getTranslatedFields(), ['id', 'portfolio_type']))->whereNull('father_id')->get();

        $to_delete = [];
        for ($i = 0; $i < count($categories); $i++){ // check for non deactivated parent categories
            $father = $categories[$i]->father;
            while(isset($father)){
                if(isset($father->deleted_at)) {
                    array_push($to_delete, $i);
                }
                $father = $father->father;
            }
            unset($categories[$i]['father']);
        }

        foreach ($to_delete as $index){
            unset($categories[$index]);
        }

        return response()->json([
            'ok' => true,
            'data' => $categories
        ], Response::HTTP_OK);
    }

    /**
     * Get all categories, with selected fields
     * only admin
     *
     * @return JSON response
     */
    public function categoriesAsAdmin() {
        $categories = Category::withTrashed()->whereNull('father_id')->get();

        foreach ($categories as $category){
            $category['freelancers_count'] = count($category->freelancerProfilesWithTrashed);
            $category['projects_count'] = count($category->projectsWithTrashed);
            unset($category->freelancerProfilesWithTrashed);
            unset($category->projectsWithTrashed);
        }

        return response()->json([
            'ok' => true,
            'data' => $categories
        ], Response::HTTP_OK);
    }

    /**
     * Get a category or subcategory, with selected fields
     *
     * @param  $name
     * @return JSON response
     */
    public function show($name) {
        $fields = TranslationController::getTranslatedFields();
        array_push($fields, 'id', 'father_id', 'image', 'title_color', 'text_color', 'background_color', 'portfolio_type');
        $category = Category::select($fields)
            ->where('name_en','like',$name)
            ->orWhere('name_es','like',$name)
            ->firstOrFail();

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
        unset($category['father']);

        return response()->json([
            'ok' => true,
            'data' => $category
        ], Response::HTTP_OK);
    }

    /**
     * Get a category or subcategory, with all the fields
     * only admin
     *
     * @param  $name
     * @return JSON response
     */
    public function showAsAdmin($name) {
        $category = Category::withTrashed()
            ->where('name_en','like',$name)
            ->orWhere('name_es','like',$name)
            ->firstOrFail();
        return response()->json([
            'ok' => true,
            'data' => $category
        ], Response::HTTP_OK);
    }

    /**
     * Get all the categories and their subcategories, with all the fields
     * desuso
     * only admin
     *
     * @return JSON response
     */
    public function categoriesAndSubcategoriesAsAdmin(){
        $categories = Category::withTrashed()->whereNull('father_id')->get();
        foreach ($categories as $category){
            $subcategories = $category->subcategoriesWithTrashed;
            foreach ($subcategories as $subcategory){
                $subcategory['freelancers_count'] = count($subcategory->freelancerProfilesWithTrashed);
                $subcategory['projects_count'] = count($subcategory->projectsWithTrashed);
                unset($subcategory->freelancerProfilesWithTrashed);
                unset($subcategory->projectsWithTrashed);
            }
            $category['subcategories'] = $subcategories;
        }

        return response()->json([
            'ok' => true,
            'data' => $categories
        ], Response::HTTP_OK);
    }

    /**
     * Get all the subcategories of a category, with selected fields
     *
     * @param  $name
     * @return JSON response
     */
    public function subcategories($name) {
        $category = Category::where('name_en','like',$name)
            ->orWhere('name_es','like',$name)
            ->firstOrFail();
        $fields = TranslationController::getTranslatedFields();
        array_push($fields, 'id', 'father_id', 'portfolio_type');

        $subcategories = $category->subcategories()->get($fields);

        $to_delete = [];
        for ($i = 0; $i < count($subcategories); $i++){ // check for non deactivated parent categories
            $father = $subcategories[$i]->father;
            while(isset($father)){
                if(isset($father->deleted_at)) {
                    array_push($to_delete, $i);
                }
                $father = $father->father;
            }
            unset($subcategories[$i]['father']);
        }

        foreach ($to_delete as $index){
            unset($subcategories[$index]);
        }

        return response()->json([
            'ok' => true,
            'data' => $subcategories
        ], Response::HTTP_OK);
    }

    /**
     * Get all the subcategories of a category, with selected fields
     * only admin
     *
     * @param  $name
     * @return JSON response
     */
    public function subcategoriesAsAdmin($name) {
        $category = Category::withTrashed()
            ->where(TranslationController::getTranslatedFieldsName(),'like',$name)
            ->firstOrFail();

        $subcategories = $category->subcategoriesWithTrashed;

        foreach ($subcategories as $subcategory){
            $subcategory['freelancers_count'] = count($subcategory->freelancerProfilesWithTrashed);
            $subcategory['projects_count'] = count($subcategory->projectsWithTrashed);
            unset($subcategory->freelancerProfilesWithTrashed);
            unset($subcategory->projectsWithTrashed);
        }

        return response()->json([
            'ok' => true,
            'data' => $subcategories
        ], Response::HTTP_OK);
    }

    /**
     * Gets the category by name, and returns the category data + its freelancer profiles data
     *
     * @param $name
     * @return JSON response
     */
    public function categoryAndItsFreelancers($name){
        $fields = TranslationController::getTranslatedFields();
        array_push($fields, 'id', 'father_id', 'image', 'title_color', 'text_color', 'background_color, portfolio_type');
        $category = Category::withTrashed()
            ->where(TranslationController::getTranslatedFieldsName(),'like',$name)
            ->select($fields)
            ->firstOrFail();

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
        unset($category['father']);

        $category['freelancers'] = $category->freelancerProfiles()->select('id', 'user_id', 'description', 'years_exp', 'approx_fee', 'advertisable')->get();
        return response()->json([
            'ok' => true,
            'data' => $category
        ], Response::HTTP_OK);
    }

    /**
     * Store a newly created resource in storage.
     * only admin
     *
     * @return JSON response
     */
    public function store() {
        $data = $this->validateCategory();

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        if(isset($data['image'])){ // image uploading
            $image = UploadController::uploadImage('image', self::getPathImage());

            if(isset($image['errors'])){
                return response()->json([
                    'ok' => false,
                    'errors' => $image['errors'],
                    'status' => 'Bad Request'
                ], Response::HTTP_BAD_REQUEST);
            }

            $data['image'] = $image['image'];
        }

        $cat = Category::create($data);

        $cat['freelancers_count'] = 0;
        $cat['projects_count'] = 0;

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.created'),
            'data' => $cat
        ], Response::HTTP_CREATED);
    }

    /**
     * Update the specified resource in storage.
     * only admin
     *
     * @param  $id
     * @return JSON response
     */
    public function update($id) {
        $category = Category::withTrashed()->findOrFail($id);
        $data = $this->validateCategory('');

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        if(isset($data['image'])){ // image uploading
            $image = UploadController::uploadImage('image', self::getPathImage(), $category->image);

            if(isset($image['errors'])){
                return response()->json([
                    'ok' => false,
                    'errors' => $image['errors'],
                    'status' => 'Bad Request'
                ], Response::HTTP_BAD_REQUEST);
            }

            $data['image'] = $image['image'];
        }
    // ver si el portfolio_type de la categoria cambia, si es asi, borrar los portfolios anteriores
        $category->update($data);

        $category['freelancers_count'] = count($category->freelancerProfilesWithTrashed);
        $category['projects_count'] = count($category->projectsWithTrashed);
        unset($category->freelancerProfilesWithTrashed);
        unset($category->projectsWithTrashed);

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.updated'),
            'data' => $category
        ], Response::HTTP_OK);
    }

    /**
     * deactivate
     * Category implements soft delete
     * only admin
     *
     * @param  $id
     * @return JSON response
     */
    public function deactivate($id) {
        $category = Category::withTrashed()->findOrFail($id);

        $unfinished_jobs_count = Job::whereIn('project_id', $category->projects()->pluck('id'))
            ->whereNull('finished')
            ->select(DB::raw('count(*) as count'))
            ->first()['count'];

        $pending_offers_count = Offer::whereIn('project_id', $category->projects()->pluck('id'))
            ->where('company_deposit','>',0)
            ->where('freelancer_deposit','=',0)
            ->select(DB::raw('count(*) as count'))->first()['count'];

        if($unfinished_jobs_count > 0 || $pending_offers_count > 0){ // has unfinisheds jobs
            $count = $unfinished_jobs_count + $pending_offers_count;
            return response()->json([
                'ok' => false,
                'errors' => ['pending' => ($count > 1) ? trans('validation.unfinished_jobs_admin', ['count' => $count]) : trans('validation.unfinished_job_admin')],
                'status' => 'Bad Request'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $category->delete();
        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.deactivated')
        ], Response::HTTP_OK);
    }

    /**
     * activate
     * Category implements soft delete
     * only admin
     *
     * @param  $id
     * @return JSON response
     */
    public function activate($id) {
        Category::withTrashed()->findOrFail($id)->restore();
        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.activated')
        ], Response::HTTP_OK);
    }

    /**
     * force delete from storage
     * only admin
     * take care with delete on cascade,
     * this option should only be used in really safe cases
     *
     * @param  $id
     * @return JSON response
     */
    public function destroy($id) {
        $category = Category::withTrashed()->findOrFail($id);

        $unfinished_jobs_count = Job::whereIn('project_id', $category->projects()->pluck('id'))
            ->whereNull('finished')
            ->select(DB::raw('count(*) as count'))
            ->first()['count'];

        $pending_offers_count = Offer::whereIn('offers.project_id', $category->projects()->pluck('id'))
            ->leftJoin('jobs','offers.freelancer_id','=','jobs.freelancer_id', 'and', 'jobs.project_id','=','offers.project_id')
            ->whereNull('jobs.finished')
            ->where('company_deposit','>',0)->select(DB::raw('count(*) as count'))->first()['count'];

        if($unfinished_jobs_count > 0 || $pending_offers_count > 0){ // has unfinisheds jobs
            $count = $unfinished_jobs_count + $pending_offers_count;
            return response()->json([
                'ok' => false,
                'errors' => ['pending' => ($count > 1) ? trans('validation.unfinished_jobs_admin', ['count' => $count]) : trans('validation.unfinished_job_admin')],
                'status' => 'Bad Request'
            ], Response::HTTP_UNAUTHORIZED);
        }

        UploadController::removeOldFile(self::getPathImage(), $category->image);

        $category->forceDelete();
        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.deleted')
        ], Response::HTTP_OK);
    }

    /**
     * Validates the request params for a category
     * returns errors array or data
     *
     * @return array
     */
    private function validateCategory($required='required|'){
        $data = request()->only([
            'father_id','name_es', 'name_en', 'description_es',
            'description_en', 'title_color', 'text_color',
            'background_color', 'image', 'portfolio_type'
        ]);

        $validator = Validator::make($data, [
            'father_id' => 'nullable|numeric|exists:categories,id',
            'name_es' => $required.'string|unique:categories|min:1|max:50',
            'name_en' => $required.'string|unique:categories|min:1|max:50',
            'description_es' => $required.'string|min:1|max:255',
            'description_en' => $required.'string|min:1|max:255',
            'title_color' => 'string|min:1|max:30',
            'text_color' => 'string|min:1|max:30',
            'background_color' => 'string|min:1|max:30',
            'portfolio_type' => 'nullable|string|min:1|max:15'
        ], ['exists' => trans('validation.foreign_not_found')]);

        if($validator->fails()){
            return ['errors' => $validator->errors()->jsonSerialize()];
        }

        return $data;
    }
}

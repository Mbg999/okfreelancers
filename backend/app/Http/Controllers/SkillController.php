<?php

namespace App\Http\Controllers;

use App\Category;
use App\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class SkillController extends Controller {
    /**
     * Get all the skills, with id and translated name and description
     *
     * @return JSON response
     */
    public function getSkills() {
        $skills = Skill::join('categories', 'skills.category_id','=','categories.id')
            ->whereNull('categories.deleted_at')
            ->select(array_merge(TranslationController::getTranslatedFields(true, '', 'skills.'), ['skills.id', 'skills.category_id']))->get();

        $to_delete = [];
        for ($i = 0; $i < count($skills); $i++){ // check for non deactivated parent categories
            $father = $skills[$i]->category->father;
            while(isset($father)){
                if(isset($father->deleted_at)) {
                    array_push($to_delete, $i);
                }
                $father = $father->father;
            }
            unset($skills[$i]['category']);
        }

        foreach ($to_delete as $index){
            unset($skills[$index]);
        }

        return response()->json([
            'ok' => true,
            'data' => $skills
        ], Response::HTTP_OK);
    }

    /**
     * Get all the skills, with all the fields and translated category name
     * only admin
     *
     * @return JSON response
     */
    public function getSkillsAsAdmin(){
        $skills = Skill::withTrashed()
            ->join('categories','skills.category_id','=','categories.id')
            ->whereNull('categories.deleted_at')
            ->select('skills.id', 'skills.name_en', 'skills.name_es', 'skills.description_en', 'skills.description_es',
                'skills.deleted_at', 'categories.'.TranslationController::getTranslatedFields(false,'category_'))
            ->get();

        foreach ($skills as $skill){
            $skill['freelancers_count'] = count($skill->freelancerProfilesWithTrashed);
            $skill['projects_count'] = count($skill->projectsWithTrashed);
            unset($skill->freelancerProfilesWithTrashed);
            unset($skill->projectsWithTrashed);
        }

        return response()->json([
            'ok' => true,
            'data' => $skills
        ], Response::HTTP_OK);
    }

    /**
     * Get a skill by its name
     *
     * @param  \App\Skill  $skill
     * @return JSON response
     */
    public function show($name) {
        $fields = TranslationController::getTranslatedFields(true, '','skills.');
        $skill = Skill::join('categories','skills.category_id','=','categories.id')
            ->whereNull('categories.deleted_at')
            ->select(array_merge($fields, ['skills.id', 'skills.category_id']))
            ->where('skills.name_en','like',$name)
            ->orWhere('skills.name_es','like',$name)
            ->firstOrFail();

        $category = $skill->category()
            ->select(array_merge(TranslationController::getTranslatedFields(), ['id', 'father_id', 'image', 'title_color', 'text_color', 'background_color', 'portfolio_type']))
            ->first();

        if(!isset($category)){
            return response()->json([
                'ok' => false,
                'exception' => trans('status.not_found'),
                'status' => 'Not Found'
            ], 404);
        }

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
            'data' => [
                'skill' => $skill->only('id','name','description'),
                'category' => $category
            ]
        ], Response::HTTP_OK);
    }

    /**
     * Get a skill by its name, with all its data
     * only admin
     *
     * @param  \App\Skill  $skill
     * @return JSON response
     */
    public function showAsAdmin($name) {
        $skill = Skill::withTrashed()
            ->join('categories','skills.category_id','=','categories.id')
            ->whereNull('categories.deleted_at')
            ->where('skills.name_en','like',$name)
            ->orWhere('skills.name_es','like',$name)
            ->select('skills.name_en','skills.name_es','skills.description_en','skills.description_es',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'))
            ->firstOrFail();

        return response()->json([
            'ok' => true,
            'data' => $skill
        ], Response::HTTP_OK);
    }

    public function getSkillsOfACategory(Category $category){
        $fields = TranslationController::getTranslatedFields();
        array_push($fields, 'id');

        $skills = [];
        $father = $category->father;
        while(isset($father)){ // inherited skills
            if(count($father->skills) > 0) $skills = array_merge($skills, $father->skills()->get($fields)->toArray());
            $father = $father->father;
        }
        $skills = array_merge($skills, $category->skills()->get($fields)->toArray());


        return response()->json([
            'ok' => true,
            'data' => $skills
        ], Response::HTTP_OK);
    }

    public function getSkillsOfMultipleCategories(){
        $categories = Category::find(request()->get('categories'));
        $skills = [];
        $fields = TranslationController::getTranslatedFields();
        array_push($fields, 'id', 'category_id');
        if(!empty($categories)){
            foreach ($categories as $category){
                $skills = array_merge($skills, $category->skills()->get($fields)->toArray());
            }
        }

        return response()->json([
            'ok' => true,
            'data' => $skills
        ], Response::HTTP_OK);
    }

    /**
     * Store a newly created resource in storage.
     * only admin
     *
     * @param  \Illuminate\Http\Request  $request
     * @return JSON response
     */
    public function store() {
        $data = $this->validateSkill();

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $skill = Skill::create($data);
        $skill['category_name'] = $skill->category()->first('categories.'.TranslationController::getTranslatedFields(false))['name'];
        $skill['freelancers_count'] = 0;
        $skill['projects_count'] = 0;

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.created'),
            'data' => $skill
        ], Response::HTTP_CREATED);
    }

    /**
     * Update the specified resource in storage.
     * only admin
     *
     * @return JSON response
     */
    public function update($id) {
        $skill = Skill::withTrashed()->findOrFail($id);
        $data = $this->validateSkill('');

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $skill->update($data);
        $skill['category_name'] = $skill->category()->first(TranslationController::getTranslatedFields(false))['name'];
        $skill['freelancers_count'] = count($skill->freelancerProfilesWithTrashed);
        $skill['projects_count'] = count($skill->projectsWithTrashed);
        unset($skill->freelancerProfilesWithTrashed);
        unset($skill->projectsWithTrashed);

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.updated'),
            'data' => $skill
        ], Response::HTTP_OK);
    }

    /**
     * deactivate
     * Skill implements soft delete
     * only admin
     *
     * @return JSON response
     */
    public function deactivate($id) {
        Skill::withTrashed()->findOrFail($id)->delete();
        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.deactivated')
        ], Response::HTTP_OK);
    }

    /**
     * activate
     * Skill implements soft delete
     * only admin
     *
     * @return JSON response
     */
    public function activate($id) {
        Skill::withTrashed()->findOrFail($id)->restore();
        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.activated')
        ], Response::HTTP_OK);
    }


    /**
     * Remove the specified resource from storage.
     * only admin
     * implements soft delete
     *
     * @return JSON response
     */
    public function destroy($id) {
        Skill::withTrashed()->findOrFail($id)->forceDelete();
        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.deleted')
        ], Response::HTTP_OK);
    }

    /**
     * Validates the request params for a skill
     * returns errors array or data
     *
     * @return array
     */
    private function validateSkill($required='required|'){
        $validator = Validator::make(request()->all(), [
            'category_id' => $required.'numeric|exists:categories,id',
            'name_es' => $required.'string|unique:skills|min:1|max:50',
            'name_en' => $required.'string|unique:skills|min:1|max:50',
            'description_es' => $required.'string|min:1|max:255',
            'description_en' => $required.'string|min:1|max:255'
        ], ['exists' => trans('validation.foreign_not_found')]);

        if($validator->fails()){
            return ['errors' => $validator->errors()->jsonSerialize()];
        }

        return request()->all();
    }
}

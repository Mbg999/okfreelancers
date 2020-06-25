<?php

namespace App\Http\Controllers;

use App\Freelancer;
use App\Portfolio;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class PortfolioController extends Controller {

    private static $pathImage = 'assets/images/portfolios/images';
    private static $pathAudio = 'assets/audios/portfolios/audios';
    private static $pathVideo = 'assets/videos/portfolios/videos';

    /**
     * Display the specified resource.
     *
     * @param  \App\Freelancer  $freelancer
     * @return JSON response
     */
    public function show(Freelancer $freelancer) {
        return response()->json([
            'ok' => true,
            'data' => $freelancer->portfolio()->get(['position', 'title', 'description', 'file'])
        ], Response::HTTP_OK);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Freelancer  $freelancer
     * @return JSON response
     */
    public function showWithTrashedAsAuth($id) {
        return $this->showWithTrashed(0, auth()->user()->freelancerProfilesWithTrashed()->findOrFail($id));
    }

    public function showWithTrashed($id, Freelancer $freelancer=null){
        if(!isset($freelancer)){
            $freelancer = Freelancer::withTrashed()->findOrFail($id);
        }
        return response()->json([
            'ok' => true,
            'data' => $freelancer->portfolio()->get(['position', 'title', 'description', 'file'])
        ], Response::HTTP_OK);
    }

    public function updateAsAuth($id){
        // only if the user is the owner of that profile
        return $this->update(0,
            auth()->user()->freelancerProfilesWithTrashed()
                ->join('categories', 'freelancers.category_id','=','categories.id')
                ->select('freelancers.id', 'freelancers.user_id', 'categories.portfolio_type')
                ->findOrFail($id)
            );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param $id
     * @param null $freelancer
     * @return \Illuminate\Http\Response
     */
    public function update($id, $freelancer=null) {
        if(!isset($freelancer)){
            $freelancer = Freelancer::withTrashed()
                ->join('categories', 'freelancers.category_id','=','categories.id')
                ->select('freelancers.id', 'freelancers.user_id', 'categories.portfolio_type')
                ->findOrFail($id);
        }

        if(!$this->validatePortfolioType($freelancer['portfolio_type'])){
            return response()->json([
                'ok' => false,
                'errors' => trans('validation.not_valid_type'),
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        if(!empty(request()->all())){ // if its empty, the user just want to clear his portfolio
            $data = $this->validatePortfolio();

            if(isset($data['errors'])){
                return response()->json([
                    'ok' => false,
                    'errors' => $data['errors'],
                    'status' => 'Bad Request'
                ], Response::HTTP_BAD_REQUEST);
            }

            $portfolios = $freelancer->portfolio()->get()->toArray();
            if(count($portfolios) > 0){
                $process=null;
                for ($i = 0; $i<count($data); $i++){
                    $data[$i]['freelancer_id'] = $freelancer->id; // set the freelancer_id field
                    $process = ['updated' => false];
                    for ($j=0; $j<count($portfolios); $j++){ // update the on use positions
                        if($portfolios[$j]['position'] == $data[$i]['position']){
                           $err = $this->updatePortfolio($i, $freelancer['portfolio_type'], $data[$i], $portfolios[$j]);
                           if($err) return $this->errorResponse($err);
                           $process['updated'] = true;
                           $process['idx'] = $j;
                        }
                    }

                    if($process['updated']) { // remove updated ones
                        array_splice($portfolios,$process['idx'],1); // remove updated ones
                    } else { // if not updated, its new, create
                        $data[$i]['freelancer_id'] = $freelancer->id;
                        $err = $this->createPortfolio($i, $freelancer['portfolio_type'], $data[$i]);
                        if($err) return $this->errorResponse($err);
                    }
                }

                $this->removePortfolios($freelancer['portfolio_type'], $portfolios); // remove other portfolios
            } else {
                for ($i = 0; $i<count($data); $i++){ // he has no portfolio, so let's skip the update comprobations
                    $data[$i]['freelancer_id'] = $freelancer->id;
                    $err = $this->createPortfolio($i, $freelancer['portfolio_type'], $data[$i]);
                    if($err) return $this->errorResponse($err);
                }
            }
        } else {
            $this->removePortfolios($freelancer['portfolio_type'], $freelancer->portfolio); // clear the entire portfolio
        }


        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.updated'),
            'data' => $freelancer->portfolio()->get(['position', 'title', 'description', 'file'])
        ], Response::HTTP_OK);
    }

    private function createPortfolio($i, $portfolio_type, $portfolio){
        $file = $this->updateFile($i, $portfolio_type);
        if(isset($file['errors'])) return $file['errors'];
        $portfolio['file'] = $file["portfolio.$i.file"];
        if(!isset($portfolio['title'])){ // if title is null, set it empty
            $portfolio['title'] = '';
        }

        if(!isset($portfolio['description'])){ // if description is null, set it empty
            $portfolio['description'] = '';
        }
        Portfolio::create($portfolio);
    }

    private function updatePortfolio($i, $portfolio_type, $newPortfolio, $oldPortfolio){
        if(isset($newPortfolio['file'])){ // update file
            $file = $this->updateFile($i, $portfolio_type, $oldPortfolio['file']);
            if(isset($file['errors'])) return $file['errors'];
            $newPortfolio['file'] = $file["portfolio.$i.file"];
        }

        if(!isset($newPortfolio['title'])){ // if title is null, set it empty
            $newPortfolio['title'] = '';
        }

        if(!isset($newPortfolio['description'])){ // if description is null, set it empty
            $newPortfolio['description'] = '';
        }

        if(isset($newPortfolio['file']) || // update the db only if something changed
            $newPortfolio['title'] != $oldPortfolio['title'] ||
            $newPortfolio['description'] != $oldPortfolio['description']){
            Portfolio::find($oldPortfolio['id'])->update($newPortfolio);
        }
    }

    private function updateFile($i, $portfolio_type, $oldFile=null){
        switch ($portfolio_type){
            case 'image': return UploadController::uploadImage("portfolio.$i.file", self::$pathImage, $oldFile);
            case 'audio': return UploadController::uploadAudio("portfolio.$i.file", self::$pathAudio, $oldFile);
            case 'video': return UploadController::uploadVideo("portfolio.$i.file", self::$pathVideo, $oldFile);
        }
    }

    private function removePortfolios($portfolio_type, $portfolios){
        $path = self::determinePathByType($portfolio_type);
        foreach ($portfolios as $portfolio){ // remove not updated ones
            if(isset($portfolio['file'])){
                UploadController::removeOldFile($path, $portfolio['file']);
            }
            Portfolio::find($portfolio['id'])->delete();
        }
    }

    public static function determinePathByType($portfolio_type){
        switch ($portfolio_type){
            case "image": return self::$pathImage;
            case "audio": return self::$pathAudio;
            case "video": return self::$pathVideo;
            default: return null;
        }
    }

    private function errorResponse($errors){
        return response()->json([
            'ok' => false,
            'errors' => $errors,
            'status' => 'Bad Request'
        ], Response::HTTP_BAD_REQUEST);
    }

    /**
     * Validates that this category admits portfolios
     *
     * @param $type
     * @return bool
     */
    private function validatePortfolioType($type){
        switch ($type){
            case 'image':
            case 'audio':
            case 'video': return true;
            default: return false;
        }
    }

    /**
     * Validates the request params for a portfolio
     * returns errors array or data
     *
     * @return array
     */
    private function validatePortfolio(){
        $data = request()->only([
            'portfolio'
        ]);

        $validator = Validator::make($data, [
            'portfolio' => 'required|array',
            'portfolio.*.position' => 'required|numeric',
            'portfolio.*.title' => 'nullable|string|min:3|max:80',
            'portfolio.*.description' => 'nullable|string|min:3|max:255'
        ]);

        if($validator->fails()){
            return ['errors' => $validator->errors()->jsonSerialize()];
        }

        return $data['portfolio'];
    }
}

<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class UploadController extends Controller {

    /**
     * Uses the uploadUserPicture function, updates the auth user's picture
     * only auth
     *
     * @return JSON response
     */
    public function uploadUserPictureAsAuth(){
        return $this->uploadUserPicture(0, auth()->user());
    }

    /**
     * Uses the uploadImage function, updates any user picture
     * only admin
     *
     * @return JSON response
     */
    public function uploadUserPicture($id, User $user=null){
        if(!isset($user)){
            $user = User::withTrashed()->findOrFail($id);
        }
        $data = $this::uploadImage('picture', UserController::getPathPicture(), $user['picture']);

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $user->update(['picture' => $data['picture']]);

        return response()->json([
            'ok' => true,
            'message' => $data['message'],
            'picture' => $data['picture']
        ], Response::HTTP_OK);
    }

    /**
     * Validate and upload images, it returns the image name or errors
     *
     * @param $key request image key
     * @param $path
     * @param null $oldImage
     * @return array
     */
    public static function uploadImage($key, $path, $oldImage=null){
        $validator = Validator::make(request()->all(), [
            $key => 'required|image|max:2048|mimes:jpg,jpeg,png'
        ]);

        if($validator->fails()){
            return ['errors' => $validator->errors()->jsonSerialize()];
        }

        return self::uploadFile($key, $path, $oldImage);
    }

    /**
     * Validate and uploads an audio file
     *
     * @param $key request audio key
     * @param $path
     * @param null $oldImage
     * @return array
     */
    public static function uploadAudio($key, $path, $oldAudio=null){
        $validator = Validator::make(request()->all(), [
            $key => 'required|file|mimes:audio/ogg,mpeg,mpga,mp3,wav' //max:4096
        ]);

        if($validator->fails()){
            return ['errors' => $validator->errors()->jsonSerialize()];
        }

        return self::uploadFile($key, $path, $oldAudio);
    }

    /**
     * Validate and uploads a video file
     *
     * @param $key request video key
     * @param $path
     * @param null $oldImage
     * @return array
     */
    public static function uploadVideo($key, $path, $oldVideo=null){
        $validator = Validator::make(request()->all(), [ // max:4096
            $key => 'required|file|mimes:mp4' // https://stackoverflow.com/a/29252539
        ]);

        if($validator->fails()){
            return ['errors' => $validator->errors()->jsonSerialize()];
        }

        return self::uploadFile($key, $path, $oldVideo);
    }

    /**
     * Used to upload any file, and remove the old one
     *
     * @param $key request image key
     * @param $path
     * @param $oldImage
     * @return array
     */
    private static function uploadFile($key, $path, $oldFile){
        $name = md5(time()+rand()) . '.' . request()->file($key)->extension();
        request()->file($key)->move($path, $name);
        if(isset($oldFile)){
            UploadController::removeOldFile($path, $oldFile);
        }

        return [
            'message' => trans('miscellaneous.updated'),
            $key => $name
        ];
    }

    /**
     * Used to remove a file
     *
     * @param $path
     * @param $oldFile
     */
    public static function removeOldFile($path, $oldFile){
        if(isset($oldFile) && File::exists("$path/$oldFile")){
            File::delete("$path/$oldFile");
        }
    }
}

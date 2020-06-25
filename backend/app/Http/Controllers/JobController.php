<?php

namespace App\Http\Controllers;

use App\Events\NewBalance;
use App\Job;
use App\Offer;
use App\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class JobController extends Controller
{
   public function updateHours(Job $job){
       $validator =  Validator::make(request()->all(), [
           'hours' => 'required|numeric|min:1|max:99999'
       ]);

       if($validator->fails()){
           return response()->json([
               'ok' => false,
               'errors' => $validator->errors()->jsonSerialize(),
               'status' => 'Bad Request'
           ], Response::HTTP_BAD_REQUEST);
       }

       $job->update(['hours' => request()->get('hours')]);

       return response()->json([
           'ok' => true,
           'message' => trans('miscellaneous.updated'),
           'data' => $job
       ], Response::HTTP_OK);
   }

   public function markAsFinished(Offer $offer, Job $job){
       if($offer->project->company->user->id != auth()->user()->id){ // not the project owner user
           return response()->json([
               'ok' => false,
               'errors' => trans('status.unauthorized'),
               'status' => 'Bad Request'
           ], Response::HTTP_UNAUTHORIZED);
       }

       if(isset($job->finished)){
           return response()->json([
               'ok' => false,
               'errors' => ['concurrence' => trans('validation.concurrence')],
               'status' => 'Bad Request'
           ], Response::HTTP_BAD_REQUEST);
       }

       $validator =  Validator::make(request()->all(), [
           'hours' => 'required|numeric|min:1|max:99999'
       ]);

       if($validator->fails()){
           return response()->json([
               'ok' => false,
               'errors' => $validator->errors()->jsonSerialize(),
               'status' => 'Bad Request'
           ], Response::HTTP_BAD_REQUEST);
       }

       if($job->hours != intval(request()->get('hours'))){
           return response()->json([
               'ok' => false,
               'errors' => ['changed' => trans('validation.hours_changed')],
               'data' => $job->hours,
               'status' => 'Bad Request'
           ], Response::HTTP_BAD_REQUEST);
       }

       $estimated_price = $offer->price * $offer->approx_hours;
       $final_price = $offer->price * $job->hours;

       $difference = $estimated_price - $final_price;
       $company_description = null;
       $other_user = $offer->freelancerProfile->user;

       if($difference < 0){ // extra payment
           if(auth()->user()->balance < $difference){
               return response()->json([
                   'ok' => false,
                   'errors' => ['balance' => trans('validation.not_enough_balance')],
                   'status' => 'Bad Request'
               ], Response::HTTP_BAD_REQUEST);
           }
           auth()->user()->update(['balance' => auth()->user()->balance - abs($difference)]);
           $company_description = trans('miscellaneous.job_finished_company_description_extra_payment', [
               'project_title' => $offer->project->title,
               'freelancer_title' => $offer->freelancerProfile->title,
               'email' => $other_user->email,
               'final_price' => $final_price,
               'estimated_price' => $estimated_price,
               'difference' => $difference
           ]);
       } else if($difference > 0) { // refound payment
           auth()->user()->update(['balance' => auth()->user()->balance + $difference]);
           $company_description = trans('miscellaneous.job_finished_company_description_refound', [
               'project_title' => $offer->project->title,
               'freelancer_title' => $offer->freelancerProfile->title,
               'email' => $other_user->email,
               'final_price' => $final_price,
               'estimated_price' => $estimated_price,
               'difference' => $difference
           ]);
       } else { // equal to offer budget
           $company_description = trans('miscellaneous.job_finished_company_description_equal', [
               'project_title' => $offer->project->title,
               'freelancer_title' => $offer->freelancerProfile->title,
               'email' => $other_user->email,
               'estimated_price' => $estimated_price
           ]);
       }

       $other_user->update(['balance' => $other_user->balance + $final_price + $offer->freelancer_deposit]);
       Transaction::create([
           'user_id' => auth()->user()->id,
           'amount' => $difference,
           'pay' => trans('miscellaneous.job_finished'),
           'description' => $company_description
       ]);
       Transaction::create([
           'user_id' => $other_user->id,
           'amount' => $final_price,
           'pay' => trans('miscellaneous.job_finished'),
           'description' => trans('miscellaneous.job_finished_freelancer_description', [
               'project_title' => $offer->project->title,
               'freelancer_title' => $offer->freelancerProfile->title,
               'email' => auth()->user()->email
           ])
       ]);
       Transaction::create([
           'user_id' => $other_user->id,
           'amount' => $offer->freelancer_deposit,
           'pay' => trans('miscellaneous.job_finished_freelancer_refound_deposit'),
           'description' => trans('miscellaneous.job_finished_freelancer_refound_deposit_description', [
               'project_title' => $offer->project->title,
               'freelancer_title' => $offer->freelancerProfile->title
           ])
       ]);
       $job->update(['finished' => Carbon::now()]);

       $job['days_passed'] = $job->created_at->diffForHumans($job->finished, true, false, 2); // date format https://es.stackoverflow.com/a/229424

       MessageController::internalMessage($other_user,'job_status', 'company','finished', $offer->project->id, $offer->project->title);
       event(new NewBalance(auth()->user()));
       event(new NewBalance($other_user));

       return response()->json([
           'ok' => true,
           'message' => trans('miscellaneous.updated'),
           'data' => [
               'job' => $job,
               'new_user_balance' => auth()->user()->balance
           ]
       ], Response::HTTP_OK);
   }

   public function cancelJobAsCompany(Offer $offer, Job $job){
       if($offer->project->company->user->id != auth()->user()->id){ // not the project owner user
           return response()->json([
               'ok' => false,
               'errors' => trans('status.unauthorized'),
               'status' => 'Bad Request'
           ], Response::HTTP_UNAUTHORIZED);
       }

       if(isset($job->finished)){
           return response()->json([
               'ok' => false,
               'errors' => ['concurrence' => trans('validation.concurrence')],
               'status' => 'Bad Request'
           ], Response::HTTP_BAD_REQUEST);
       }

       $penalty = $offer->company_deposit * 0.2;
       $company_refound = $offer->company_deposit - $penalty;
       $freelancer_refound = $offer->freelancer_deposit;
       $other_user = $offer->freelancerProfile->user;

       $job->delete();
       $offer->update([
           'company_deposit' => 0,
           'freelancer_deposit' => 0
       ]);
       $other_user->update(['balance' => $other_user->balance + $penalty + $freelancer_refound]);
       auth()->user()->update(['balance' => auth()->user()->balance + $company_refound]);

       Transaction::create([
           'user_id' => auth()->user()->id,
           'amount' => $company_refound,
           'pay' => trans('miscellaneous.job_canceled'),
           'description' => trans('miscellaneous.job_canceled_by_company_description_company', [
               'project_title' => $offer->project->title,
               'freelancer_title' => $offer->freelancerProfile->title,
               'penalty' => $penalty,
               'refound' => $company_refound
           ])
       ]);
       Transaction::create([
           'user_id' => $other_user->id,
           'amount' => $penalty + $freelancer_refound,
           'pay' => trans('miscellaneous.job_canceled'),
           'description' => trans('miscellaneous.job_canceled_by_company_description_freelancer', [
               'company' => $offer->project->company->name,
               'project_title' => $offer->project->title,
               'freelancer_title' => $offer->freelancerProfile->title,
               'penalty' => $penalty,
               'refound' => $freelancer_refound
           ])
       ]);

       MessageController::internalMessage($offer->freelancerProfile->user,'job_status', 'company','canceled', $offer->project->id, $offer->project->title);
       event(new NewBalance(auth()->user()));
       event(new NewBalance($other_user));
       auth()->user()->sendCancelledJobNotification('company', 'company', $offer->project, $offer->freelancerProfile, $company_refound, $penalty);
       $other_user->sendCancelledJobNotification('company', 'freelancer', $offer->project, $offer->freelancerProfile, $freelancer_refound, $penalty, $offer->project->company);

       return response()->json([
           'ok' => true,
           'message' => trans('miscellaneous.updated'),
           'data' => [
               'offer' => Offer::join('freelancers','offers.freelancer_id','=','freelancers.id')
                   ->join('categories','freelancers.category_id','=','categories.id')
                   ->select('offers.*','freelancers.title as freelancer_title','freelancers.picture as freelancer_picture',
                       'categories.'.TranslationController::getTranslatedFields(false,'category_'))
                   ->find($offer->id),
               'new_user_balance' => auth()->user()->balance
           ]
       ], Response::HTTP_OK);
   }

   public function cancelJobAsFreelancer(Offer $offer, Job $job){
        if($offer->freelancerProfile->user->id != auth()->user()->id){ // not the freelancer user owner
            return response()->json([
                'ok' => false,
                'errors' => trans('status.unauthorized'),
                'status' => 'Bad Request'
            ], Response::HTTP_UNAUTHORIZED);
        }

        if(isset($job->finished)){
            return response()->json([
                'ok' => false,
                'errors' => ['concurrence' => trans('validation.concurrence')],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $penalty = $offer->freelancer_deposit;
        $company_refound = $offer->company_deposit;
        $other_user = $offer->project->company->user;

        $job->delete();
        $offer->update([
            'company_deposit' => 0,
            'freelancer_deposit' => 0
        ]);
        $other_user->update(['balance' => $other_user->balance + $penalty + $company_refound]);

        Transaction::create([
            'user_id' => auth()->user()->id,
            'amount' => 0,
            'pay' => trans('miscellaneous.job_canceled'),
            'description' => trans('miscellaneous.job_canceled_by_freelancer_description_freelancer', [
                'project_title' => $offer->project->title,
                'freelancer_title' => $offer->freelancerProfile->title,
                'penalty' => $penalty
            ])
        ]);
        Transaction::create([
            'user_id' => $other_user->id,
            'amount' => $company_refound+$penalty,
            'pay' => trans('miscellaneous.job_canceled'),
            'description' => trans('miscellaneous.job_canceled_by_freelancer_description_company', [
                'project_title' => $offer->project->title,
                'freelancer_title' => $offer->freelancerProfile->title,
                'penalty' => $penalty,
                'refound' => $company_refound
            ])
        ]);

        MessageController::internalMessage($other_user,'job_status', 'freelancer','canceled', $offer->project->id, $offer->project->title);
        event(new NewBalance($other_user));
        auth()->user()->sendCancelledJobNotification('freelancer', 'freelancer', $offer->project, $offer->freelancerProfile, 0, $penalty);
        $other_user->sendCancelledJobNotification('freelancer', 'company', $offer->project, $offer->freelancerProfile, $company_refound, $penalty);

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.updated'),
            'data' => [
                'offer' => $offer,
                'new_user_balance' => auth()->user()->balance
            ]
        ], Response::HTTP_OK);
    }

   public function rate(Job $job){
       if(!isset($job->finished)){
           return response()->json([
               'ok' => false,
               'errors' => ['not_finished' => trans('validation.not_finished')],
               'status' => 'Bad Request'
           ], Response::HTTP_BAD_REQUEST);
       }

       $validator =  Validator::make(request()->all(), [
           'rate' => 'required|numeric|min:1|max:5',
           'assessment' => 'required|string|min:1|max:500'
       ]);

       if($validator->fails()){
           return response()->json([
               'ok' => false,
               'errors' => $validator->errors()->jsonSerialize(),
               'status' => 'Bad Request'
           ], Response::HTTP_BAD_REQUEST);
       }

       $job->update([
           'rate' => request()->get('rate'),
           'assessment' => request()->get('assessment')
       ]);

       return response()->json([
           'ok' => true,
           'message' => trans('miscellaneous.updated'),
           'data' => $job
       ], Response::HTTP_OK);
   }
}

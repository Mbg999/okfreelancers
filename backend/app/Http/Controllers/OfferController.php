<?php

namespace App\Http\Controllers;

use App\Events\NewBalance;
use App\Events\NewChat;
use App\Events\NewMessage;
use App\Job;
use App\Message;
use App\Offer;
use App\Project;
use App\Transaction;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class OfferController extends Controller {

    public function getMyProjectOffers($id){
        $project = Project::withTrashed()->findOrFail($id);

        $available_offers = $project->offers()->where('company_deposit','=',0)
            ->join('freelancers','offers.freelancer_id','=','freelancers.id')
            ->join('categories','freelancers.category_id','=','categories.id')
            ->select('offers.*','freelancers.title as freelancer_title','freelancers.picture as freelancer_picture',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'))
            ->orderBy('offers.updated_at', 'desc')
            ->get();

        $pending_offers = $project->offers()->where('company_deposit','>',0)->where('freelancer_deposit','=',0)
            ->join('freelancers','offers.freelancer_id','=','freelancers.id')
            ->join('categories','freelancers.category_id','=','categories.id')
            ->select('offers.*','freelancers.title as freelancer_title','freelancers.picture as freelancer_picture',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'))
            ->orderBy('offers.updated_at','desc')
            ->get();

        $in_progress_offers = $project->offers()
            ->join('projects', 'offers.project_id','=','projects.id')
            ->join('jobs','projects.id','=','jobs.project_id')
            ->join('freelancers','offers.freelancer_id','=','freelancers.id')
            ->join('categories','freelancers.category_id','=','categories.id')
            ->where('offers.company_deposit','>',0)->where('offers.freelancer_deposit','>',0)
            ->whereNull('jobs.finished')
            ->select('offers.*','freelancers.title as freelancer_title','freelancers.picture as freelancer_picture',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'))
            ->orderBy('offers.updated_at','desc')
            ->get();

        foreach ($in_progress_offers as $offer){
            $offer['job'] = Job::where('project_id','=',$offer->project_id)
                ->where('freelancer_id','=',$offer->freelancer_id)
                ->first();
            $offer['job']['days_passed'] = $offer['job']->created_at->diffForHumans(($offer['job']->finished) ?? null, true, false, 2); // date format https://es.stackoverflow.com/a/229424
        }

        $finished_offers = $project->offers()
            ->join('projects', 'offers.project_id','=','projects.id')
            ->join('jobs','projects.id','=','jobs.project_id')
            ->join('freelancers','offers.freelancer_id','=','freelancers.id')
            ->join('categories','freelancers.category_id','=','categories.id')
            ->where('offers.company_deposit','>',0)->where('offers.freelancer_deposit','>',0)
            ->whereNotNull('jobs.finished')
            ->select('offers.*','freelancers.title as freelancer_title','freelancers.picture as freelancer_picture',
                'categories.'.TranslationController::getTranslatedFields(false,'category_'))
            ->orderBy('offers.updated_at','desc')
            ->get();

        foreach ($finished_offers as $offer){
            $offer['job'] = Job::where('project_id','=',$offer->project_id)
                ->where('freelancer_id','=',$offer->freelancer_id)
                ->first();
            $offer['job']['days_passed'] = $offer['job']->created_at->diffForHumans(($offer['job']->finished) ?? null, true, false, 2); // date format https://es.stackoverflow.com/a/229424
        }

        return response()->json([
            'ok' => true,
            'data' => [
                'available_offers' => $available_offers,
                'pending_offers' => $pending_offers,
                'in_progress_offers' => $in_progress_offers,
                'finished_offers' => $finished_offers
            ]
        ], Response::HTTP_OK);
    }

    public function getMyOffersToAProject(Project $project){
        $freelancers = auth()->user()->freelancerProfiles()
            ->whereIn('category_id',$project->categories()->pluck('id'))
            ->join('categories','freelancers.category_id','=','categories.id')
            ->select('freelancers.id', 'freelancers.title', 'freelancers.picture',
                'categories.id as category_id','categories.'.TranslationController::getTranslatedFields(false,'category_'))
            ->get();

        foreach ($freelancers as $freelancer) {
            $freelancer['offer'] = $freelancer->offers()->where('project_id','=',$project->id)->first();
            if(isset($freelancer['offer']) && $freelancer['offer']->freelancer_deposit > 0) $freelancer['job'] = $freelancer->jobs()->where('project_id','=',$project->id)->first();
        }

        return response()->json([
            'ok' => true,
            'data' => $freelancers
        ], Response::HTTP_OK);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return JSON response
     */
    public function store() {
        $data = $this->validateOffer(['price', 'approx_hours', 'approx_term','message','project_id', 'freelancer_id']);

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $offer = Offer::find(Offer::create($data)->id);

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.created'),
            'data' => $offer
        ], Response::HTTP_CREATED);
    }

    /**
     * Update the specified resource in storage.
     *
     * @return JSON response
     */
    public function update(Offer $offer) {
        if($offer->company_deposit > 0){
            return response()->json([
                'ok' => false,
                'errors' => ['concurrence' => trans('validation.concurrence')],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $data = $this->validateOffer(['price', 'approx_hours', 'approx_term','message'],'');

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $offer->update($data);

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.updated'),
            'data' => $offer
        ], Response::HTTP_OK);
    }

    public function acceptOfferAsProjectOwner(Offer $offer){
        $data = $this->validateOffer(['company_deposit'],'', 'required|');

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        if($offer->company_deposit > 0){
            return response()->json([
                'ok' => false,
                'errors' => ['concurrence' => trans('validation.concurrence')],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $company_deposit = $offer->price * $offer->approx_hours;

        if($company_deposit != floatval($data['company_deposit'])){
            return response()->json([
                'ok' => false,
                'errors' => ['changed' => trans('validation.balance_changed')],
                'data' => $offer,
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        if(auth()->user()->balance < $company_deposit){
            return response()->json([
                'ok' => false,
                'errors' => ['balance' => trans('validation.not_enough_balance')],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $offer->update(['company_deposit' => $company_deposit]);
        auth()->user()->update(['balance' => auth()->user()->balance - $company_deposit]);
        $other_user = $offer->freelancerProfile->user;
        Transaction::create([
            'user_id' => auth()->user()->id,
            'amount' => $company_deposit*-1,
            'pay' => trans('miscellaneous.company_deposit'),
            'description' => trans('miscellaneous.company_deposit_description', [
                'project_title' => $offer->project->title,
                'freelancer_title' => $offer->freelancerProfile->title,
                'email' => $other_user->email
            ])
        ]);

        MessageController::internalMessage($offer->freelancerProfile->user,'offer_status', 'company','accept', $offer->project->id, $offer->project->title);
        event(new NewBalance(auth()->user()));
        $other_user->sendOfferAcceptedNotification('accepted', $offer->freelancerProfile, $offer->project, $other_user->name);

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.updated'),
            'data' => [
                'offer' => Offer::join('freelancers','offers.freelancer_id','=','freelancers.id')
                    ->join('categories','freelancers.category_id','=','categories.id')
                    ->select('offers.*','freelancers.title as freelancer_title','freelancers.picture as freelancer_picture',
                        'categories.'.TranslationController::getTranslatedFields(false,'category_'))
                    ->orderBy('offers.updated_at','desc')
                    ->find($offer->id),
                'new_user_balance' => auth()->user()->balance
            ]
        ], Response::HTTP_OK);
    }

    public function acceptOfferAsFreelancer(Offer $offer){
        $data = $this->validateOffer(['freelancer_deposit'],'','','required|');

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        if($offer->company_deposit == 0 || $offer->freelancer_deposit > 0){
            return response()->json([
                'ok' => false,
                'errors' => ['concurrence' => trans('validation.concurrence')],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $freelancer_deposit = $offer->price * $offer->approx_hours * 0.2; // 20%

        if($freelancer_deposit != floatval($data['freelancer_deposit'])){
            return response()->json([
                'ok' => false,
                'errors' => ['changed' => trans('validation.balance_changed')],
                'data' => $offer,
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        if(auth()->user()->balance < $freelancer_deposit){
            return response()->json([
                'ok' => false,
                'errors' => ['balance' => trans('validation.not_enough_balance')],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $offer->update(['freelancer_deposit' => $freelancer_deposit]);
        auth()->user()->update(['balance' => auth()->user()->balance - $freelancer_deposit]);
        Transaction::create([
            'user_id' => auth()->user()->id,
            'amount' => $freelancer_deposit*-1,
            'pay' => trans('miscellaneous.freelancer_deposit'),
            'description' => trans('miscellaneous.freelancer_deposit_description', [
                'project_title' => $offer->project->title,
                'freelancer_title' => $offer->freelancerProfile->title,
                'email' => auth()->user()->email
            ])
        ]);
        $job = Job::find(Job::create([
            'project_id' => $offer->project_id,
            'freelancer_id' => $offer->freelancer_id,
            'price_hour' => $offer->price
        ])->id);

        $other_user = $offer->project->company->user;
        MessageController::internalMessage($other_user,'offer_status', 'freelancer','accept', $offer->project->id, $offer->project->title);
        event(new NewBalance(auth()->user()));
        $other_user->sendOfferAcceptedNotification('taken', $offer->freelancerProfile, $offer->project, $other_user->name);

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.updated'),
            'data' => [
                'offer' => $offer,
                'new_user_balance' => auth()->user()->balance,
                'job' => $job
            ]
        ], Response::HTTP_OK);
    }

    public function cancelOfferAsProjectOwner(Offer $offer){
        $data = $this->validateOffer(['company_deposit'],'', 'required|');

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        if($offer->company_deposit == 0 || $offer->freelancer_deposit > 0){
            return response()->json([
                'ok' => false,
                'errors' => ['concurrence' => trans('validation.concurrence')],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $offer->update(['company_deposit' => 0]);
        auth()->user()->update(['balance' => auth()->user()->balance + floatval($data['company_deposit'])]);
        Transaction::create([
            'user_id' => auth()->user()->id,
            'amount' => floatval($data['company_deposit']),
            'pay' => trans('miscellaneous.company_deposit_cancelled'),
            'description' => trans('miscellaneous.company_deposit_cancelled_description', [
                'freelancer_title' => $offer->freelancerProfile->title,
            ])
        ]);

        MessageController::internalMessage($offer->freelancerProfile->user,'offer_status','company','cancel', $offer->project->id, $offer->project->title);
        event(new NewBalance(auth()->user()));

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

    public function refuseProjectAsFreelancer(Offer $offer){
        if($offer->company_deposit == 0 || $offer->freelancer_deposit > 0){
            return response()->json([
                'ok' => false,
                'errors' => ['concurrence' => trans('validation.concurrence')],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $other_user = $offer->project->company->user;
        $other_user->update(['balance' => $other_user->balance + $offer->company_deposit]);
        $offer->update(['company_deposit' => 0]);
        Transaction::create([
            'user_id' => $other_user->id,
            'amount' => $offer->price*$offer->approx_hours,
            'pay' => trans('miscellaneous.freelancer_refused'),
            'description' => trans('miscellaneous.freelancer_refused_description', [
                'project_title' => $offer->project->title,
                'freelancer_title' => $offer->freelancerProfile->title,
            ])
        ]);

        MessageController::internalMessage($other_user,'offer_status', 'freelancer','refuse', $offer->project->id, $offer->project->title);
        event(new NewBalance($other_user));

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.updated'),
            'data' => $offer
        ], Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @return JSON response
     */
    public function destroy(Offer $offer) {
        if($offer->company_deposit > 0){
            return response()->json([
                'ok' => false,
                'errors' => ['concurrence' => trans('validation.concurrence')],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $offer->forceDelete();

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.deleted')
        ]);
    }

    /**
     * Validates the request params for an offer
     * returns errors array or data
     *
     * @return array
     */
    private function validateOffer($fields, $required='required|', $company='', $freelancer=''){
        $data = request()->only($fields);

        $validator = Validator::make($data, [
            'project_id' => $required.'exists:projects,id',
            'freelancer_id' => $required.'exists:freelancers,id|unique_with:offers,project_id,freelancer_id',
            'price' => $required.'numeric|min:1|max:99999999.99',
            'approx_hours' => $required.'numeric|min:1|max:99999',
            'approx_term' => $required.'numeric|min:1|max:99999',
            'message' => $required.'string|min:1|max:1000',
            'company_deposit' => $company.'numeric|min:1|max:99999999.99',
            'freelancer_deposit' => $freelancer.'numeric|min:1|max:99999999.99'
        ], [
            'exists' => trans('validation.foreign_not_found'),
            'unique_with' => trans('validation.offer_already_registered')
        ]);

        if($validator->fails()){
            return ['errors' => $validator->errors()->jsonSerialize()];
        }

        return $data;
    }
}

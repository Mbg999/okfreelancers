<?php

namespace App\Http\Controllers;

use App\Chat;
use App\Events\MessageRead;
use App\Events\NewChat;
use App\Events\NewMessage;
use App\Message;
use App\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class MessageController extends Controller {

    public function getChats(){
        $users = DB::select('select users.id, users.email, users.name, users.surnames, users.picture, max(T1.created_at) last_message '.
        'from ('.
            'select messages.receiver_id user_id, max(messages.created_at) created_at '.
            'from messages where messages.sender_id = :auth_id1'.
            ' group by messages.receiver_id '.
            'union distinct '.
            '(select  messages.sender_id user_id, max(messages.created_at) created_at '.
            'from messages '.
            'where messages.receiver_id = :auth_id2'.
            ' group by messages.sender_id)'.
        ') T1 '.
        'inner join users on users.id = T1.user_id '.
        'group by users.id, users.email, users.name, users.surnames, users.picture '.
            'order by last_message desc', ['auth_id1' => auth()->user()->id,'auth_id2' => auth()->user()->id]);

        $chats=[];
        $ids = ['user' => auth()->user()->id];
        foreach ($users as $user){
            $ids['other'] = $user->id;
            unset($user->last_message);
            array_push($chats, [
                'user' => $user,
                'last_message' => Message::where(function ($query) use ($ids) {
                    $query->where('sender_id', '=', $ids['user'])
                        ->where('receiver_id', '=', $ids['other']);
                    })->orWhere(function ($query) use ($ids) {
                        $query->where('sender_id', '=', $ids['other'])
                            ->where('receiver_id', '=', $ids['user']);
                    })->orderBy('created_at','desc')->first(),
                'unreads'=> Message::where('sender_id','=',$user->id)
                    ->where('receiver_id','=',auth()->user()->id)
                    ->where('read', '<','1')
                    ->select(DB::raw('count(*) as unreads'))
                    ->first()['unreads']
            ]);
        }


        return response()->json([
            'ok' => true,
            'data' => $chats
        ], Response::HTTP_OK);
    }

    public function getUnreadsCount(){
        $unreads = auth()->user()->messagesReceived()
            ->select(DB::raw('count(*) count'))
            ->where('read','<','1')
            ->first()['count'];

        return response()->json([
            'ok' => true,
            'data' => $unreads
        ], Response::HTTP_OK);
    }

    public function getMessages($id){
        $ids = ['other' => $id, 'user' => auth()->user()->id];
        $messages = Message::where(function ($query) use ($ids) {
                $query->where('sender_id', '=', $ids['user'])
                    ->where('receiver_id', '=', $ids['other']);
            })->orWhere(function ($query) use ($ids) {
                $query->where('sender_id', '=', $ids['other'])
                    ->where('receiver_id', '=', $ids['user']);
            })
            ->orderBy('created_at','desc')
            ->paginate(12);
        $messages->withPath("/messages/$id");

        return response()->json([
            'ok' => true,
            'data' => $messages
        ], Response::HTTP_OK);
    }

    public function getUserForNewChat(User $user){
        return response()->json([
            'ok' => true,
            'data' => ['user' => $user->only('id','name','surnames','picture')]
        ], Response::HTTP_OK);
    }

    /**
     * Display the specified resource.
     *
     * @return JSON response
     */
    public function store() {
        $data = $this->validateMessage();

        if(isset($data['errors'])){
            return response()->json([
                'ok' => false,
                'errors' => $data['errors'],
                'status' => 'Bad Request'
            ], Response::HTTP_BAD_REQUEST);
        }

        $message = Message::find(Message::create([
            'sender_id' => auth()->user()->id,
            'receiver_id' => $data['receiver_id'],
            'text' => $data['text']
        ])->id);

        $ids = ['other' => $data['receiver_id'], 'user' => auth()->user()->id];
        $messages_count = Message::where(function ($query) use ($ids) {
            $query->where('sender_id', '=', $ids['user'])
                ->where('receiver_id', '=', $ids['other']);
        })->orWhere(function ($query) use ($ids) {
            $query->where('sender_id', '=', $ids['other'])
                ->where('receiver_id', '=', $ids['user']);
        })
            ->select(DB::raw('count(*) as count'))
            ->first()['count'];

        if($messages_count < 2){ // its the first message
            event(new NewChat($data['receiver_id'], [
                // this cant be auth()->user(), the event uses to send the auth user instead the sender
                'user' => User::select('id','email','name','surnames','picture')->findOrFail($message->userSender->id),
                'last_message' => $message,
                'unreads'=> 1
            ]));
            unset($message->userSender);
        } else {
            event(new NewMessage($message));
        }

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.created'),
            'data' => $message
        ], Response::HTTP_CREATED);
    }

    public function markAsRead(Message $message){
        $message->update(['read' => 1]);

        event(new MessageRead($message->userSender->id, auth()->user()->id));

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.updated')
        ], Response::HTTP_OK);
    }

    public function markChatAsRead($id){
        $reads = Message::where('sender_id','=',$id)
            ->where('receiver_id','=',auth()->user()->id)
            ->update(['read' => 1]);

        event(new MessageRead(intval($id), auth()->user()->id));

        return response()->json([
            'ok' => true,
            'message' => trans('miscellaneous.updated'),
            'data' => $reads
        ], Response::HTTP_OK);
    }



    public static function internalMessage($receiver_user, $type, $role, $action=null, $item_id=null, $item_additional_text=null){
        // --- SEND MESSAGE TO CHAT
        $message = Message::find(Message::create([
            'sender_id' => auth()->user()->id,
            'receiver_id' => $receiver_user->id,
            'text' => "OkFreelancersInternal:$type:$role:$action:".$item_id.(($item_additional_text) ? ":$item_additional_text" : '')
        ])->id);
        $ids = ['other' => $receiver_user->id, 'user' => auth()->user()->id];
        $messages_count = Message::where(function ($query) use ($ids) {
            $query->where('sender_id', '=', $ids['user'])
                ->where('receiver_id', '=', $ids['other']);
        })->orWhere(function ($query) use ($ids) {
            $query->where('sender_id', '=', $ids['other'])
                ->where('receiver_id', '=', $ids['user']);
        })
            ->select(DB::raw('count(*) as count'))
            ->first()['count'];

        if($messages_count < 2){ // its the first message
            event(new NewChat($receiver_user->id, [
                // this cant be auth()->user(), the event uses to send the auth user instead the sender
                'user' => User::select('id','email','name','surnames','picture')->findOrFail($message->userSender->id),
                'last_message' => $message,
                'unreads'=> 1
            ]));
            unset($message->userSender);
        } else {
            event(new NewMessage($message));
        }
        // --- /SEND MESSAGE TO CHAT
    }

    /**
     * Validates the request params for a message
     * returns errors array or data
     *
     * @return array
     */
    private function validateMessage(){
        $data = request()->only([
            'text', 'receiver_id'
        ]);

        $validator = Validator::make($data, [
            'receiver_id' => 'required|numeric|exists:users,id',
            'text' => 'required|string|min:1|max:1000'
        ], ['exists' => trans('validation.foreign_not_found')]);

        if($validator->fails()){
            return ['errors' => $validator->errors()->jsonSerialize()];
        }

        return $data;
    }
}

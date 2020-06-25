<?php

namespace App\Events;

use App\Chat;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewChat implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $other_user_id;
    public $chat;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($other_user_id, $chat)
    {
        $this->other_user_id = $other_user_id;
        $this->chat = $chat;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn() {
        return new Channel('messages.' . $this->other_user_id);
    }

    public function broadcastWith() // payload data to send
    {
        return [$this->chat];
    }

    public function broadcastAs() // event name on client
    {
        return 'NewChat';
    }
}

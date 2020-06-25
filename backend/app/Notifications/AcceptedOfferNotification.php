<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AcceptedOfferNotification extends Notification
{
    use Queueable;

    public $type; // its "accepted" or "taken"
    public $freelancer;
    public $project;
    public $name;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($type, $freelancer, $project, $name)
    {
        $this->type = $type;
        $this->freelancer = $freelancer;
        $this->project = $project;
        $this->name = $name;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject(trans("emails.accepted_offer.$this->type.notification"))
            ->view('email.accepted_offer',[
                'type' => $this->type,
                'freelancer' => $this->freelancer,
                'project' => $this->project,
                'name' => $this->name
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}

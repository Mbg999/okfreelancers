<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DeleteNotification extends Notification
{
    use Queueable;

    public $type; // user, company, freelancer or project
    public $name;
    public $text;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($type, $name, $text) {
        $this->type = $type;
        $this->name = $name;
        $this->text = $text;
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
            ->subject(trans("emails.delete.$this->type.subject"))
            ->view('email.delete',[
                'type' => $this->type,
                'name' => $this->name,
                'text' => $this->text
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

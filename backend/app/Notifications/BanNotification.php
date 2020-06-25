<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BanNotification extends Notification
{
    use Queueable;

    public $type; // its "ban" or "rehabilitate"
    public $email;
    public $name;
    public $text;
    public $reason;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($type, $email, $name, $text, $reason=null) {
        $this->type = $type;
        $this->email = $email;
        $this->name = $name;
        $this->text = $text;
        $this->reason = $reason;
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
            ->subject(trans("emails.ban.$this->type.notification"))
            ->view('email.ban',[
                'type' => $this->type,
                'email' => $this->email,
                'name' => $this->name,
                'text' => $this->text,
                'reason' => $this->reason
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

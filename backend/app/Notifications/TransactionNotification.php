<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TransactionNotification extends Notification
{
    use Queueable;

    public $type; // its payment or withdraw
    public $email;
    public $name;
    public $amount;
    public $pay;
    public $description;
    public $note;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($type, $name, $amount, $pay, $description, $note) {
        $this->type = $type;
        $this->name = $name;
        $this->amount = abs($amount);
        $this->pay = $pay;
        $this->description = $description;
        $this->note = $note;
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
            ->subject(trans("emails.transaction.$this->type"))
            ->view('email.transaction',[
                'type' => $this->type,
                'name' => $this->name,
                'amount' => $this->amount,
                'pay' => $this->pay,
                'description' => $this->description,
                'note' => $this->note
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
